const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/userModel");
require("dotenv").config();
const { encryptSecret, decryptSecret } = require("./encryptionService");
const crypto = require("crypto");
const bcrypt = require('bcrypt');

const generateMFA = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const secret = speakeasy.generateSecret({
      name: `${process.env.AppIssuer} (${user.email})`,
      issuer: process.env.AppIssuer,
    });

    const encryptedSecret = encryptSecret(secret.base32);

    await User.findByIdAndUpdate(
      userId,
      {
        "mfa.secret": encryptedSecret,
        "mfa.enabled": true,
      },
      { new: true }
    );

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return { qrCodeUrl, secret: encryptedSecret };
  } catch (error) {
    console.error("Error generating MFA:", error.message);
    throw new Error("MFA setup failed");
  }
};

const verifyMFA = async (userId, token) => {
  try {
    if (!token) return false;
    const user = await User.findById(userId);
    if (!user || user.mfa.secret === null) return false;
    const decryptedSecret = decryptSecret(user.mfa.secret);
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 2,
    });
  } catch (error) {
    console.error("Error verifying MFA:", error.message);
    return false;
  }
};

function generateSingleCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

function generateCodes() {
  const codes = new Set();
  while (codes.size < 8) {
    const newCode = generateSingleCode();
    codes.add(newCode);
  }
  return Array.from(codes);
}

const verifyPassword = async (req, res, next) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: "User ID and password are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, isNotPass: true, message: "Incorrect password" });
    }

    next();
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { generateMFA, verifyMFA, generateCodes, verifyPassword };
