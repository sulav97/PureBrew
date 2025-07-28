const crypto = require('crypto');
const fs = require('fs');

// File integrity verification middleware
const integrityCheck = (req, res, next) => {
  // Verify uploaded files
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      // Check file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large' });
      }
      
      // Generate hash for integrity verification
      const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      req.fileIntegrity = fileHash;
    }
  }
  
  next();
};

// Verify data integrity for critical operations
const verifyDataIntegrity = (req, res, next) => {
  const { data, signature } = req.body;
  
  if (data && signature) {
    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.INTEGRITY_SECRET || 'default-secret')
      .update(JSON.stringify(data))
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Data integrity check failed' });
    }
  }
  
  next();
};

module.exports = { integrityCheck, verifyDataIntegrity }; 