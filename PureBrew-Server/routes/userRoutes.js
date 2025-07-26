const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const User = require('../models/User');

// User profile
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

// Admin: get all users, block/unblock
router.get("/", auth, userController.getAllUsers);
router.patch("/:id/block", auth, userController.blockUser);
router.patch("/:id/unblock", auth, userController.unblockUser);

// 2FA routes
router.post("/2fa/generate", auth, userController.generate2FA);
router.post("/2fa/confirm", auth, userController.confirm2FA);
router.post("/2fa/disable", auth, userController.disable2FA);
router.post("/2fa/verify", userController.verify2FA);

// 2FA backup code routes
router.post("/2fa/backup/generate", auth, userController.generateBackupCodes);
router.get("/2fa/backup", auth, userController.getBackupCodes);
router.post("/2fa/backup/use", userController.useBackupCode);

// Email management routes
router.post("/emails", auth, userController.addEmail);
router.get("/emails/verify/:token", userController.verifyEmail);
router.delete("/emails", auth, userController.removeEmail);

module.exports = router; 