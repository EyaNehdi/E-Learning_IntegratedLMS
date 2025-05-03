require('dotenv').config();
const ActivityLog = require('../models/ActivityLog.model');
const User = require('../models/userModel');
const Product = require('../models/packs.model'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("firstName lastName email role isActive accountCreatedAt");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params; // Extracting ID from request params

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(id).select("firstName lastName email role skils profilePhoto Bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await ActivityLog.find({ target: { $ne: 'Auth' } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', '_id firstName lastName')
            .lean();

        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
        });
    }
}

const archiveUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User archived successfully",
            user,
        });
    } catch (error) {
        console.error("Error archiving user:", error);
        res.status(500).json({ message: "Failed to archive user" });
    }
}

const unarchiveUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User unarchived successfully",
            user,
        });
    } catch (error) {
        console.error("Error unarchiving user:", error);
        res.status(500).json({ message: "Failed to unarchive user" });
    }
};

const countStudents = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "student" });
        console.log("Students : ", count);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting students:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const countInstructors = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "instructor" });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting instructors:", error);
        res.status(500).json({ message: "Server error" });
    }
}
const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: "instructor" })
            .select("firstName lastName email role isActive accountCreatedAt skils profilePhoto Bio");
        res.status(200).json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// In your user routes file
const UserStats = async (req, res) => {
    try {
        const total = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const instructors = await User.countDocuments({ role: 'instructor' });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const previousTotal = await User.countDocuments({
            accountCreatedAt: { $lt: oneWeekAgo }
        });

        const growth = total - previousTotal;
        const growthPercentage = previousTotal > 0
            ? ((growth / previousTotal) * 100).toFixed(1)
            : 100;
        return res.json({
            total,
            students,
            instructors,
            growth,
            growthPercentage
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user stats' });
    }
};

const RegistrationStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const result = await User.aggregate([
            {
                $match: {
                    accountCreatedAt: { $gte: startDate },
                    role: { $in: ["student", "instructor"] }
                }
            },
            {
                $project: {
                    date: {
                        $dateToString: { format: "%Y-%m-%d", date: "$accountCreatedAt" }
                    },
                    role: 1
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 },
                    roles: {
                        $push: "$role"
                    }
                }
            },
            {
                $addFields: {
                    roles: {
                        student: { $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role", "student"] } } } },
                        instructor: { $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role", "instructor"] } } } }
                    }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    roles: 1,
                    _id: 0
                }
            }
        ]);

        res.json(result);
    } catch (error) {
        console.error("Error fetching registration trends:", error);
        res.status(500).json({ message: "Error fetching registration trends" });
    }
};
//Admin fetching all products from store
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error" });
    }
};
//Admin fetching a product from store
const getProductById = async (req, res) => {
    const { id } = req.params; // Product ID from the URL

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
}

// Admin adding a product to store with stripe
const createProductWithStripe = async (req, res) => {
    const { name, description, price , coinAmount } = req.body;
  
    try {
      // 1. Create Product on Stripe
      const stripeProduct = await stripe.products.create({
        name,
        description,
        active: true, 
      });
  
      // 2. Create Price for that product on Stripe
      const stripePrice = await stripe.prices.create({
        unit_amount: price * 100, // convert euros to cents
        currency: 'eur',
        product: stripeProduct.id,
      });
  
      // 3. Save all data to MongoDB
      const newProduct = new Product({
        name,
        description,
        price,
        currency: 'eur',
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        isActive: true,
        coinAmount,
      });
  
      await newProduct.save();
  
      res.status(201).json({
        message: 'Product successfully created and synced with Stripe',
        product: newProduct,
      });
    } catch (err) {
      console.error('Stripe product creation failed:', err);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };

  // Adming editing a product in store with stripe
  const updateProductAndPrice = async (req, res) => {
    const { id } = req.params; // MongoDB product ID

    const { name, description, price , coinAmoint } = req.body; // Price in cents from frontend

  
    try {
      // 1. Validate price
      if (!Number.isInteger(price) || price <= 0) {
        return res.status(400).json({
          error: 'Price must be a positive integer in cents',
        });
      }
  
      // 2. Find the product in MongoDB
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // 3. Update the Stripe Product
      await stripe.products.update(product.stripe_product_id, {
        name,
        description,
      });
  
      // 4. Create a new Price (since Prices are immutable)
      const newStripePrice = await stripe.prices.create({
        product: product.stripe_product_id,
        unit_amount: price, // Price in cents (ensured to be an integer)
        currency: product.currency || 'eur', // Use existing currency or default to 'eur'
        active: true, // Ensure the new Price is active
      });
  
      // 5. deactivate the old Price 
      await stripe.prices.update(product.stripe_price_id, {
        active: false, // Deactivate the old Price
      });
  
      // 6. Update the product in MongoDB (single update)
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price, // Store price in cents
          stripe_price_id: newStripePrice.id, // Update to the new Price ID
          coinAmount
        },
        { new: true } // Return the updated document
      );
  
      // 7. Respond with the updated product
      res.status(200).json({
        message: 'Product successfully updated and synced with Stripe',
        product: updatedProduct,
      });
    } catch (err) {
      console.error('Stripe product update failed:', err);
      res.status(500).json({
        error: 'Failed to update product',
        details: err.message, // Include specific error for debugging
      });
    }
  };

  // Admin Archiving a product in store
  const archiveProduct = async (req, res) => {
    const { id } = req.params; // MongoDB product ID
  
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      //stripe
      await stripe.products.update(product.stripe_product_id, {
        active: false, // Deactivate the product on Stripe
      });
      
  
      // 2. Archive the product in MongoDB
      product.isActive = false;
      await product.save();
  
      res.status(200).json({
        message: 'Product successfully archived',
        product,
      });
    } catch (err) {
      console.error('Error archiving product:', err);
      res.status(500).json({ error: 'Failed to archive product' });
    }
  };

  // Admin unarchiving a product in store
  const unarchiveProduct = async (req, res) => {
    const { id } = req.params; // MongoDB product ID
    try {
        //Mongodb 
      // 1. Find the product in MongoDB
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

        //stripe
        await stripe.products.update(product.stripe_product_id, {
            active: true, 
          });

       
  
      // 2. Unarchive the product in MongoDB
      product.isActive = true;
      await product.save();
  
      res.status(200).json({
        message: 'Product successfully unarchived',
        product,
      });
    } catch (err) {
      console.error('Error unarchiving product:', err);
      res.status(500).json({ error: 'Failed to unarchive product' });
    }
  };





module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAuditLogs,
    archiveUser,
    unarchiveUser,
    countStudents,
    countInstructors,
    getInstructors,
    UserStats,
    RegistrationStats,
    createProductWithStripe,
    updateProductAndPrice,
    getProducts,
    getProductById,
    archiveProduct,
    unarchiveProduct
};