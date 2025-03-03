const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/userModel");
require("dotenv").config();
const { encryptSecret, decryptSecret } = require("./encryptionService");
const crypto = require("crypto");

const generateMFA = async (userId) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `${process.env.AppIssuer} (${userId})`,
      issuer: process.env.AppIssuer,
    });

    const encryptedSecret = encryptSecret(secret.base32);

    const user = await User.findByIdAndUpdate(
      userId,
      { mfaSecret: encryptedSecret, mfaEnabled: true },
      { new: true }
    );

    if (!user) throw new Error("User not found");

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
    if (!user || !user.mfaSecret) return false;

    const decryptedSecret = decryptSecret(user.mfaSecret);

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
    console.log(newCode);
    codes.add(newCode);
  }
  return Array.from(codes);
}

module.exports = { generateMFA, verifyMFA, generateCodes };
