# 🔒 SECURITY_FEATURES.md

## Overview
Pure Brew beans is a full-stack e-commerce platform with a strong focus on user security and privacy. The application implements robust authentication, authorization, and data protection mechanisms, including JWT-based authentication, optional TOTP-based multi-factor authentication (MFA), rate limiting, and email verification. Passwords are securely hashed, and user management includes RBAC and account blocking. This document details all security features as implemented in the codebase.

---

## 🛡️ Core Security Features Implemented

### 1. Password Security
- **Length & Complexity**: Minimum 6 characters (frontend-enforced), strength meter in registration UI
- **Hashing**: bcryptjs, 10 rounds
- **Real-Time Strength Assessment**: Regex-based feedback in frontend

### 2. Brute-Force Prevention
- **Rate Limiting**: 
  - Login: 5 attempts per 15 minutes per IP
  - Signup: 5 attempts per hour per IP
- **Lockout**: No account lockout or progressive delays
- **IP Tracking**: Per-IP rate limiting

### 3. Access Control (RBAC)
- **Roles**: User and Admin (isAdmin boolean)
- **Middleware**: Admin-only endpoints check `req.user.isAdmin`
- **Blocked Users**: Cannot log in (`isBlocked: true`)

### 4. Session Management
- **JWT**: 7-day expiry, Bearer in Authorization header

---

## Encryption
- **Password Hashing**: bcryptjs, 10 rounds
- **JWT Signing**: `jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })`
- **2FA Secret Storage**: Base32 string in MongoDB
- [ ] HTTPS enforcement (must be handled at deployment)

---

## Activity Logging
- **Console Logs**: Errors, failed logins, password resets

---

## 🔧 Additional Security Features
- **Input Validation**: Password regex in frontend, required fields in backend
- **XSS**: Recursive XSS filtering

---

## 📊 Security Monitoring
- **Console logs**: All errors, failed logins, password resets

---

## 🚀 Implementation Details

### Middleware Pipeline
```
Request → CORS → express.json() → Rate Limiting → Auth Middleware → Route Handler
```

### Database Schema (User Model)
```js
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  emails: [{ address: { type: String, required: true }, verified: { type: Boolean, default: false } }],
  emailVerifyToken: { type: String },
  emailVerifyAddress: { type: String },
  emailVerifyExpire: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, { timestamps: true });
```

### API-Level Security
- **Auth**: JWT required for protected endpoints
- **Rate Limiting**: express-rate-limit on login/signup
- **Input Validation**: Required fields, password regex (frontend)

---

## 🔍 Security Testing

### Manual Testing Areas
- [x] Password strength and validation
- [x] MFA setup and login
- [x] Rate limiting and brute force protection
- [x] Admin/user access control
- [x] Manual penetration testing (JWT, RBAC, blocked user)
- [x] Email verification for new emails
- [x] Blocked user cannot log in
- [x] JWT tampering returns 401

### Security Audit Checklist
- [x] Password hashing (bcryptjs)
- [x] JWT authentication
- [x] 2FA (TOTP)
- [x] Email verification for new emails
- [x] Rate limiting on login/signup
- [x] RBAC (isAdmin)
- [x] CORS restricted
- [x] Secrets in .env
- [x] Logging of errors/events
- [x] Multi-email support
- [x] Automated security tests 
- [] HTTPS enforcement (must be set up in deployment)

---

## 📋 Compliance Features
- [x] Password hashing (bcryptjs)
- [x] JWT authentication
- [x] 2FA (TOTP)
- [x] Email verification for new emails
- [x] Rate limiting on login/signup
- [x] RBAC (isAdmin)
- [x] CORS restricted
- [x] Secrets in .env
- [x] Logging of errors/events

---

## 🛠️ Configuration

### Environment Variables
```env
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_uri
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
FRONTEND_URL=http://localhost:5174
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Configurable Settings
- **Rate Limiting**: 5 login attempts/15 min, 5 signup attempts/hour
- **JWT Expiry**: 7 days
- **Password Hashing**: bcryptjs, 10 rounds

---

## 📈 Security Metrics
- **Failed Login Rate**: Console logs, rate limiting enforced
- **Account Lockout Rate**: Not implemented
- **Security Event Rate**: Console logs only
- **User Activity Rate**: Not tracked
- **Admin Dashboard Metrics**: Not implemented

---

## 🔐 Best Practices
- [x] Defense in Depth: Multiple controls (rate limiting, 2FA, RBAC)
- [x] Principle of Least Privilege: Admin checks on sensitive endpoints
- [x] Secure Failure: 401/403 on unauthorized/forbidden actions
- [x] Security by Design: Security built into architecture
- [x] User Education: Password strength meter, 2FA encouragement

---

## Support and Maintenance
- **Patching**: Manual dependency updates, `npm audit`
- **Incident Response**: Not documented
- **Ongoing Audits**: Manual, not automated
- **Contact**: Project maintainer or repository issue tracker
