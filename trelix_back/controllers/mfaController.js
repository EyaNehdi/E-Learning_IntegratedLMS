const { generateMFA, verifyMFA, generateCodes } = require("../services/mfaService");
const User = require("../models/userModel");
const crypto = require("crypto");
const { decryptSecret, encryptSecret } = require("../services/encryptionService");
const { generateTrustedDeviceToken } = require("../middlewares/UserAccess");
const { v4: uuidv4 } = require("uuid");
const generateToken = require("../utils/generateTokenAndSetCookie");

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
  const { userId, token, trustDevice, metadata } = req.body;

  try {
    const verified = await verifyMFA(userId, token);
    if (!verified) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (trustDevice) {
      const deviceId = uuidv4();
      const tokenTrustedDevice = generateTrustedDeviceToken(userId, deviceId, metadata);
      const newTrustedDevice = {
        deviceId,
        ...metadata,
        addedAt: new Date(),
        expiresAt: expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            "mfa.trustedDevices": newTrustedDevice
          },
        },
        { new: true }
      );
      res.cookie("trusted_device_token", tokenTrustedDevice, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    return res.json({ success: true, message: "MFA verified" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    const updatedUser = await User.findByIdAndUpdate(userId, { "mfa.backupCodes": hashedBackupCodes }, { new: true });
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

    const backupCodes = user.mfa?.backupCodes;

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
    if (
      !user?.mfa?.enabled ||
      !user?.mfa?.secret ||
      user.mfa.secret.length === 0
    ) {
      return res.status(400).json({ message: "MFA is already disabled" });
    }

    const userUpdated = await User.findByIdAndUpdate(
      userId,
      {
        "mfa.enabled": false,
        "mfa.secret": null,
        "mfa.backupCodes": [],
      },
      { new: true }
    );

    if (!userUpdated) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, message: "MFA has been disabled" });
  } catch (error) {
    console.error("Error disabling MFA:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyMfaCode = async (req, res) => {
  console.log("req.body, verifyMfaCode", req.body);

  const { userId, otpCode, backupCode, trustDevice, deviceInfo } = req.body;
  try {
    if (!otpCode && !backupCode) return { success: false, message: "Missing code input" };

    const user = await User.findById(userId);
    if (!user || !user.mfa.enabled) {
      return res.status(404).json({ success: false, message: "User or MFA setup not found" });
    }

    if (otpCode) {
      const verified = await verifyMFA(userId, otpCode);
      if (!verified) {
        return res.status(401).json({ success: false, otpError: true, message: "Invalid OTP" });
      }
    } else if (backupCode) {
      const matchingCode = user.mfa.backupCodes.find((entry) => {
        if (!entry.used) {
          const decryptedCode = decryptSecret(entry.code);
          return decryptedCode === backupCode;
        }
        return false;
      });

      if (!matchingCode) {
        return res.status(401).json({ success: false, otpError: false, message: "Invalid or already used backup code" });
      }
      matchingCode.used = true;
    }
    if (trustDevice) {
      const deviceId = uuidv4();
      const tokenTrustedDevice = generateTrustedDeviceToken(userId, deviceId, deviceInfo);
      const newTrustedDevice = {
        deviceId,
        ...deviceInfo,
        addedAt: new Date(),
        expiresAt: expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
      const existingDevice = user.mfa.trustedDevices.find((d) => d.deviceId === deviceId);
      if (!existingDevice) {
        await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              "mfa.trustedDevices": newTrustedDevice
            },
          },
          { new: true }
        );
        res.cookie("trusted_device_token", tokenTrustedDevice, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
    }
    await user.save();
    generateToken(res, user._id, true);
    req.actingUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    res.locals.fullyLoggedIn = true;
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error verifying MFA:", error.message);
    return { success: false, message: "Server error during MFA verification" };
  }
};

const getTrusted = async (req, res) => {
  const userId = req.query.userId;
  try {
    const user = await User.findById(userId);
    if (!user || !user.mfa.enabled) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const trustedDevices = user.mfa?.trustedDevices;
    if (!trustedDevices || trustedDevices.length === 0) {
      return res.status(204).json({
        success: false,
        message: "No trusted devices found.",
      });
    }
    return res.status(200).json({
      success: true,
      trustedDevices: trustedDevices,
    });

  } catch (error) {
    console.error("Error fetching Trusted Devices:", error.message);
    return { success: false, message: "Server error during get trusted devices" };
  }
}

const removeDevice = async (req, res) => {
  const { userId, deviceId } = req.query;
  try {
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { 'mfa.trustedDevices': { deviceId } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'Device removed successfully.' });
  } catch (error) {
    console.error('Error removing device:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { enableMFA, authenticateMfa, generateBackupCodes, getBackupCodes, disableMFA, verifyMfaCode, getTrusted, removeDevice };
