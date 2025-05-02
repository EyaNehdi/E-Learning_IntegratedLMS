require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/packs.model');
const User = require('../models/userModel');

const checkoutSession = async (req, res) => {
  const { packId, userId } = req.body;
  const authUserId = req.userId;
  const userEmail = req.user?.email;

  try {
    console.log("Checkout session request:", { packId, userId, authUserId, body: req.body });

    if (!packId) {
      console.error("Missing packId");
      return res.status(400).json({ message: "packId is required" });
    }
    if (!authUserId && !userId) {
      console.error("Missing userId");
      return res.status(400).json({ message: "userId is required" });
    }
    if (userId === "anonymous" || authUserId === "anonymous") {
      console.error("Anonymous user not allowed for checkout");
      return res.status(403).json({ message: "Authentication required for purchase" });
    }

    const product = await Product.findById(packId);
    if (!product) {
      console.error(`Pack not found for packId: ${packId}`);
      return res.status(404).json({ message: "Pack not found" });
    }
    if (!product.isActive) {
      console.error(`Pack is archived: ${packId}`);
      return res.status(400).json({ message: "Pack is archived and cannot be purchased" });
    }
    if (!product.stripe_price_id) {
      console.error(`Missing stripe_price_id for pack: ${packId}`);
      return res.status(400).json({ message: "Invalid product configuration: missing stripe_price_id" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      ui_mode: "hosted",
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: userEmail || undefined,
      success_url: `http://localhost:5173/store?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/store`,
      metadata: {
        userId: authUserId || userId,
        packId: product._id.toString(),
      },
    });

    console.log("Checkout session created:", { sessionId: session.id, url: session.url });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({
      error: "Failed to create checkout session",
      message: err.message,
    });
  }
};

const verifySession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    console.log(`Verifying session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const userId = session.metadata.userId;
      const packId = session.metadata.packId;

      console.log(`Session metadata: userId=${userId}, packId=${packId}`);
      if (userId === "anonymous") {
        console.error("Anonymous user not allowed for balance update");
        return res.status(403).json({ message: "Authentication required for balance update" });
      }

      const product = await Product.findById(packId);
      if (!product) {
        console.error(`Pack not found for packId: ${packId}`);
        return res.status(404).json({ message: "Pack not found" });
      }

      if (!product.coinAmount || product.coinAmount <= 0) {
        console.error(`Invalid coinAmount for pack: ${packId}, coinAmount: ${product.coinAmount}`);
        return res.status(400).json({ message: "Invalid coin amount" });
      }

      // Update user balance and track session
      const user = await User.findOneAndUpdate(
        { _id: userId, processedSessions: { $ne: sessionId } },
        {
          $inc: { balance: product.coinAmount },
          $addToSet: { processedSessions: sessionId },
        },
        { new: true }
      );

      if (!user) {
        console.error(`User not found or session already processed for userId: ${userId}, session: ${sessionId}`);
        return res.status(404).json({ message: "User not found or session already processed" });
      }

      console.log(`Balance updated for user ${userId}: +${product.coinAmount} coins, new balance: ${user.balance}`);
      return res.status(200).json({
        success: true,
        message: `Payment successful! ${product.coinAmount} Trelix coins added to your account.`,
      });
    } else {
      console.log(`Payment not completed for session: ${sessionId}, status: ${session.payment_status}`);
      return res.status(400).json({
        success: false,
        message: 'Payment not completed or cancelled.',
      });
    }
  } catch (err) {
    console.error(`Error verifying session ${sessionId}:`, err);
    res.status(500).json({
      error: 'Failed to verify session',
      message: err.message,
    });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`Webhook received: ${event.type}, id: ${event.id}`);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook Error', message: err.message });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const packId = session.metadata.packId;
    const userId = session.metadata.userId;

    console.log(`Webhook processing session: ${session.id}, userId: ${userId}, packId: ${packId}`);
    if (userId === "anonymous") {
      console.error("Anonymous user not allowed for balance update in webhook");
      return res.status(403).json({ message: "Authentication required for balance update" });
    }

    try {
      const product = await Product.findById(packId);
      if (!product) {
        console.error(`Pack not found for session: ${session.id}, packId: ${packId}`);
        return res.status(404).json({ message: 'Pack not found' });
      }

      if (!product.coinAmount || product.coinAmount <= 0) {
        console.error(`Invalid coinAmount for pack: ${packId}, coinAmount: ${product.coinAmount}`);
        return res.status(400).json({ message: "Invalid coin amount" });
      }

      // Update user balance and track session
      const user = await User.findOneAndUpdate(
        { _id: userId, processedSessions: { $ne: session.id } },
        {
          $inc: { balance: product.coinAmount },
          $addToSet: { processedSessions: session.id },
        },
        { new: true }
      );

      if (!user) {
        console.error(`User not found or session already processed for userId: ${userId}, session: ${session.id}`);
        return res.status(404).json({ message: 'User not found or session already processed' });
      }

      console.log(`Webhook: Balance updated for user ${userId}: +${product.coinAmount} coins, new balance: ${user.balance}`);
    } catch (err) {
      console.error(`Error fulfilling order for session ${session.id}:`, err);
      return res.status(500).json({ error: 'Failed to fulfill order', message: err.message });
    }
  }

  res.status(200).json({ received: true });
};

const sessionStatus = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    console.log(`Session status retrieved: ${req.query.session_id}, status: ${session.status}`);
    res.send({
      status: session.status,
      customer_email: session.customer_email || undefined,
      payment_status: session.payment_status,
    });
  } catch (err) {
    console.error('Error getting session status:', err);
    res.status(500).json({
      error: 'Failed to get session status',
      message: err.message,
    });
  }
};

module.exports = { checkoutSession, verifySession, handleWebhook, sessionStatus };