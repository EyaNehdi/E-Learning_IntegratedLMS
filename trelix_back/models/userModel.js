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
  phone: { type: String, default: null },
  Bio: { type: String, default: null },
  badges: [{
    name: { type: String, required: true },
    description: { type: String, default: "" },
    earnedAt: { type: Date, default: Date.now },
    image: { type: String, default: null }
  }],
  completedChapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
  certificatesOwned: [
    {
      certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
      acquiredOn: Date,
      verificationCode: String,
      pdfUrl: { type: String, default: null },
    }
  ],
  skils: { type: [String], default: [] },
  profilePhoto: { type: String, default: null },
  coverPhoto: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiresAt: { type: Date, default: null },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,  // Token used for email verification
  verificationTokenExpiresAt: Date,  // Expiration time for the token
  isVerified: { type: Boolean, default: false },  // Whether the user has verified their email
  totalScore: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ["superAdmin", "admin", "student", "instructor"]
  },
  accountCreatedAt: { type: Date, default: Date.now },
  lastLoginLocation: {
    ip: String,
    city: String,
    region: String,
    country: String,
    loggedInAt: Date
  },
  mfa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, default: null },
    backupCodes: [
      {
        code: { type: String, required: true },
        used: { type: Boolean, default: false },
      },
    ],
    trustedDevices: [
      {
        deviceId: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        browser: { type: String },
        os: { type: String },
      },
    ],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  processedSessions: [{ type: String }], // Track processed Stripe session IDs
  purchasedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    purchaseDate: { type: Date, default: Date.now },
  }],
  engagementStage: {
    type: String,
    enum: ["active", "at_risk", "idle", "churned"],
    default: "active"
  },
  lastEngagementEmailSent: {
    type: Date,
    default: null
  }
},
  { timestamps: true });
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
// Modified pre-save hook to prevent double-hashing
User.pre("save", async function (next) {
  // Only hash if password field has been modified
  if (!this.isModified("password")) return next()

  // Check if the password is already hashed (starts with $2b$ or $2a$ for bcrypt)
  if (this.password.startsWith("$2b$") || this.password.startsWith("$2a$")) {
    //console.log("Password is already hashed, skipping hashing")
    return next()
  }

  try {
    //console.log("Hashing password...")
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    //console.log("Password hashed successfully")
    next()
  } catch (err) {
    console.error("Error hashing password:", err)
    next(err)
  }
})

// Compare Password while login
User.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password)
}

module.exports = mongoose.model('User', User);