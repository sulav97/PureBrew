const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  address: { type: String, default: "" },
  phone: { type: String, default: "" },
  isBlocked: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  emails: [{
    address: { type: String, required: true },
    verified: { type: Boolean, default: false }
  }],
  emailVerifyToken: { type: String },
  emailVerifyAddress: { type: String },
  emailVerifyExpire: { type: Date },
  passwordHistory: [{ type: String }], // Array of previous password hashes
  passwordLastChanged: { type: Date },
  backupCodes: [{ type: String }], // Array of hashed 2FA backup codes
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date },
  refreshToken: { type: String },
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
