const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/userModel");
require("dotenv").config();
const { encryptSecret, decryptSecret } = require("./encryptionService");

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

module.exports = { generateMFA, verifyMFA };
