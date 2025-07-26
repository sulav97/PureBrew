# Security Demo Video Checklist

## Pre-Recording Setup
- [ ] Ensure all security features are working in the latest build
- [ ] Prepare test accounts (admin and regular user)
- [ ] Set up screen recording software
- [ ] Prepare demo script and talking points
- [ ] Test all features before recording

---

## 1. Authentication & Authorization

### Password Security Features
- [x] Show password strength meter in registration
  - [x] Enter weak password → Show red/weak indicator
  - [x] Enter strong password → Show green/strong indicator
  - [x] Show real-time feedback and suggestions
- [x] Demonstrate password requirements
  - [x] Try to register with weak password
  - [x] Show error messages for missing requirements
  - [x] Show successful registration with strong password
- [ ] Password reuse prevention (not implemented)
- [ ] Password expiry (not implemented)

### Multi-Factor Authentication (MFA)
- [x] Show TOTP MFA setup process
  - [x] Navigate to profile/security section
  - [x] Show QR code for authenticator app
  - [x] Enter code to confirm setup
- [x] MFA verification
  - [x] Login with MFA enabled
  - [x] Show 2FA prompt and verification step
- [ ] SMS/Email MFA (not implemented)
- [ ] Backup codes (not implemented)

### Account Lockout & Brute Force
- [x] Demonstrate brute force protection
  - [x] Enter wrong password 5 times
  - [x] Show rate limit message after threshold
- [ ] Account lockout (not implemented)

---

## 2. Session Management

- [x] JWT token handling
  - [x] Show token in browser dev tools
  - [x] Demonstrate token expiration (7 days)
  - [x] Show payload (user id, isAdmin)
- [ ] Session invalidation on password change (not implemented)

---

## 3. Input Validation & Sanitization

- [x] Password regex validation in frontend
- [x] XSS injection attempts 
- [x] SQL/NoSQL injection attempts 

---

## 4. Security Headers & Rate Limiting

- [x] Rate limiting demonstration
  - [x] Exceed login/signup attempts, show error
- [ ] CSP, HSTS, Referrer Policy, NoSniff headers (not implemented)
- [ ] Helmet configuration (not implemented)

---

## 5. Data Protection

- [x] Password hashing with bcryptjs (10 rounds)
- [x] Show password hash in database (if possible)
- [ ] HTTPS enforcement (must be handled at deployment)
- [x] Role-based access control
  - [x] Show admin vs user permissions
  - [x] Demonstrate access restrictions

---

## 6. Activity Logging

- [x] Show console logs for errors, failed logins, password resets
- [ ] Audit trails, user event logs, IP/user-agent logging (not implemented)
- [ ] Real-time monitoring dashboard (not implemented)
- [ ] Alerting and suspicious activity indicators (not implemented)

---

## 7. Penetration Testing & Assessment

- [x] Run pentest scripts
- [x] Manual tests
  - [x] JWT tampering returns 401
  - [x] Blocked user cannot log in
  - [x] RBAC: Non-admin cannot access admin endpoints
- [ ] Show vulnerabilities found and patches applied (if any)
- [x] Link to/read security audit documents

---

## 8. Advanced Features (Optional)

- [x] Multi-email support with verification
- [ ] Custom security dashboards (not implemented)
- [x] Security documentation and support features

---

## 9. Video Structure

### Introduction
- [x] Introduce Pure Brew beans application
- [x] Explain security focus and demo goals
- [x] Outline demo structure

### Main Content
- [x] Follow section-by-section demonstrations above
- [x] Explain each security feature
- [x] Demonstrate real-world scenarios
- [x] Show both success and failure cases

### Conclusion
- [x] Recap security features and posture
- [x] Mention audit and next steps
- [x] Provide contact/support information

---

## 10. Recording Tips

- [x] Use high-quality screen recording
- [x] Ensure clear audio
- [x] Use professional language and pacing
- [x] Show both positive and negative cases
- [x] Explain technical concepts clearly
- [x] Demonstrate real-world relevance

---

## 11. Post-Recording Checklist

- [x] Review entire recording for clarity and completeness
- [x] Check audio and video quality
- [x] Verify all features are shown
- [x] Create video transcript (if required)
- [x] Prepare supporting documentation
- [x] Submit video and documentation as required

---

## 12. Final Summary

### Implemented Features
- [x] JWT authentication
- [x] Password hashing (bcryptjs)
- [x] TOTP MFA (speakeasy)
- [x] Email verification for new emails
- [x] Rate limiting on login/signup
- [x] RBAC (isAdmin)
- [x] CORS restricted
- [x] Secrets in .env
- [x] Logging of errors/events
- [x] Multi-email support

### Testable Requirements Covered
- [x] Password strength and validation
- [x] MFA setup and login
- [x] Rate limiting and brute force protection
- [x] Admin/user access control
- [x] Manual penetration testing (JWT, RBAC, blocked user)
