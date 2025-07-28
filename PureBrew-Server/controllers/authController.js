const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validator = require("validator");
const sanitizeHtml = require('sanitize-html');

// Register Controller
const register = async (req, res) => {
  try {
    let { name, email, password, token } = req.body;
    // Sanitize inputs
    name = sanitizeHtml(validator.trim(name || ""), { allowedTags: [], allowedAttributes: {} });
    name = validator.escape(name);
    email = sanitizeHtml(validator.trim(email || ""), { allowedTags: [], allowedAttributes: {} });
    email = validator.normalizeEmail(email);
    password = sanitizeHtml(validator.trim(password || ""), { allowedTags: [], allowedAttributes: {} });
    // Validate name
    if (!/^[A-Za-z\s]{2,}$/.test(name)) {
      return res.status(400).json({ msg: "Name must be at least 2 letters and only contain letters and spaces." });
    }
    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format." });
    }
    // Validate password
    const strongPassword = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    if (!strongPassword) {
      return res.status(400).json({ msg: "Password must be at least 8 characters, include upper, lower, number, and special character." });
    }
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });
    // Recaptcha
    const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success) return res.status(400).json({ msg: "Recaptcha verification failed" });
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emails: [{ address: email, verified: true }],
      passwordHistory: [hashedPassword],
      passwordLastChanged: now
    });
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Helper to generate tokens
function generateAccessToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
}
function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Find user by any verified email
    const user = await User.findOne({
      $or: [
        { email },
        { emails: { $elemMatch: { address: email, verified: true } } }
      ]
    });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Account lockout check
    if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
      const minutes = Math.ceil((user.lockoutUntil - Date.now()) / 60000);
      return res.status(403).json({ msg: `Account locked. Try again in ${minutes} minute(s).` });
    }

    if (user.isBlocked) return res.status(403).json({ msg: "User is blocked. Please contact support." });

    // Password expiry: 90 days
    if (user.passwordLastChanged && (Date.now() - new Date(user.passwordLastChanged).getTime()) > 90*24*60*60*1000) {
      return res.status(403).json({ msg: "Password expired. Please reset your password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      // Lock account after 5 failed attempts for 15 minutes
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(403).json({ msg: "Account locked due to too many failed login attempts. Try again in 15 minutes." });
      } else {
        await user.save();
        return res.status(400).json({ msg: "Invalid credentials" });
      }
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    // If 2FA is enabled, require code
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // Frontend should prompt for 2FA code
        return res.status(206).json({ msg: "2FA required", twoFactorRequired: true, userId: user._id });
      }
      const speakeasy = require("speakeasy");
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorCode
      });
      if (!verified) return res.status(400).json({ msg: "Invalid 2FA code" });
      // Set tokens as httpOnly, secure cookies after 2FA
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      return res.json({
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    }
    // Set tokens as httpOnly, secure cookies
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
    res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Refresh token endpoint
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }
    // Rotate refresh token
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();
    // Issue new access token
    const newAccessToken = generateAccessToken(user);
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
    res.json({ msg: "Token refreshed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Logout endpoint
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.clearCookie("token", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.json({ msg: "Logged out" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by any verified email
    const user = await User.findOne({
      $or: [
        { email },
        { emails: { $elemMatch: { address: email, verified: true } } }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Email sending logic here...
    
    res.json({ msg: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });
    // Validate password
    const strongPassword = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    if (!strongPassword) {
      return res.status(400).json({ msg: "Password must be at least 8 characters, include upper, lower, number, and special character." });
    }
    // Prevent password reuse (last 5 passwords)
    for (const oldHash of (user.passwordHistory || [])) {
      if (await bcrypt.compare(password, oldHash)) {
        return res.status(400).json({ msg: "You cannot reuse your last 5 passwords." });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordLastChanged = new Date();
    user.passwordHistory = [hashedPassword, ...(user.passwordHistory || [])].slice(0, 5);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ msg: "Password reset successful. Please login." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reset password. Try again later." });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  logout
};
