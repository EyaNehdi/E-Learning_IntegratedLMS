const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const User = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  image: { type: String, default: null },
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, default: null },
  phone: { type: String, default: null },
  badges: [{
    name: { type: String, required: true },
    description: { type: String, default: "" },
    earnedAt: { type: Date, default: Date.now },
    image: { type: String, default: null }
  }],
  backupCodes: [
    {
      code: { type: String, required: true },
      used: { type: Boolean, default: false },
    },
  ],
  skils: { type: [String], default: [] },
  profilePhoto: { type: String, default: null },
  coverPhoto: { type: String, default: null },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  totalScore: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ["superAdmin", "admin", "student", "instructor"]
  }
});
// Hashing Password
User.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare Password while login
User.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

module.exports = mongoose.model('User', User);