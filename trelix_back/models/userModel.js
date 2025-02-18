const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const User = new Schema({
    id:String,
    firstName: String,
    lastName: String,
    email:{type:String, unique:true},
    password:String,
    mfaEnabled: { type: Boolean, default: false }, 
    mfaSecret: { type: String, default: null },
    backupCodes: { type: [String], default: [] }, 
    resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
    role: { 
        type: String, 
        enum: ["superAdmin","admin", "student", "instructor"]
      }
});
// Hashing Password
User.pre('save', async function(next) {
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
  User.methods.comparePassword = async function(userPassword) {
    return await bcrypt.compare(userPassword, this.password);
  };

module.exports =mongoose.model('User', User);