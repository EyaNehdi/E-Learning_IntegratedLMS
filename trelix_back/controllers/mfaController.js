const { generateMFA, verifyMFA } = require("../services/mfaService");
const User = require("../models/userModel");

const enableMFA = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { qrCodeUrl, secret } = await generateMFA(userId);

    res.json({ qrCodeUrl, secret });
  } catch (error) {
    res.status(500).json({ message: "Error enabling MFA" });
  }
};

const authenticateMfa = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const verified = await verifyMFA(userId, token);
    if (verified) {
      res.json({ success: true, message: "MFA verified" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { enableMFA, authenticateMfa };
