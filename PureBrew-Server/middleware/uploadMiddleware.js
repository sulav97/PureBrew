const multer = require("multer");
const path = require("path");
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename with integrity hash
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileHash = crypto.createHash('md5').update(file.originalname + uniqueSuffix).digest('hex');
    cb(null, file.fieldname + "-" + fileHash + path.extname(file.originalname));
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."), false);
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return cb(new Error("File too large. Maximum size is 5MB."), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

module.exports = upload;
