const { generateMFA, verifyMFA, generateCodes } = require("../services/mfaService");
const User = require("../models/userModel");
const crypto = require("crypto");
const { decryptSecret, encryptSecret } = require("../services/encryptionService");

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

const generateBackupCodes = async (req, res) => {
  try {
    const userId = req.query.userId;
    const backupCodes = generateCodes();
    const hashedBackupCodes = backupCodes.map((code) => ({
      code: encryptSecret(code),
      used: false,
    }));

    const ResponseBackupCodes = backupCodes.map((code) => ({
      code: code,
      used: false,
    }));

    const updatedUser = await User.findByIdAndUpdate(userId, { backupCodes: hashedBackupCodes }, { new: true });
    if (updatedUser) {
      res.json({ success: true, ResponseBackupCodes });
    }

  } catch (error) {
    console.error("Error generating backup codes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getBackupCodes = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const backupCodes = user.backupCodes;

    if (!backupCodes || backupCodes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "You don't have any backup codes. Would you like to generate new backup codes?",
        promptUser: true, // Flag to indicate the user should be prompted
      });
    }

    const decryptedCodes = backupCodes.map((codeObj) => ({
      code: decryptSecret(codeObj.code),
      used: codeObj.used,
    }));

    res.json({
      success: true,
      backupCodes: decryptedCodes,
    });
  } catch (error) {
    console.error("Error fetching backup codes:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const disableMFA = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });
    const user = await User.findById(userId);
    if (!user.mfaSecret || user.mfaSecret.length === 0 || !user.mfaEnabled) {
      console.log("MFA is already disabled");
      return res.status(400).json({ message: "MFA is already disabled" });
    }

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      { mfaEnabled: false, mfaSecret: null, backupCodes: [] },
      { new: true }
    );

    if (!userUpdated) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "MFA has been disabled" });
  } catch (error) {
    console.error("Error disabling MFA:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { enableMFA, authenticateMfa, generateBackupCodes, getBackupCodes, disableMFA };
