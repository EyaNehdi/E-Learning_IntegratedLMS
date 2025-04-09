const mongoose = require("mongoose")

const googleAuthSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true },
)

// Méthode pour vérifier si le token est expiré
googleAuthSchema.methods.isTokenExpired = function () {
  return this.expiryDate ? new Date() > this.expiryDate : true
}

const GoogleAuth = mongoose.model("GoogleAuth", googleAuthSchema)

module.exports = GoogleAuth

