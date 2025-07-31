# 🧪 Security Testing Guide

This guide covers all the security tests implemented in the PureBrew project to ensure comprehensive security validation.

## 📋 Test Categories

### 1. **CSRF Protection Tests**
- **File**: `Server/test-csrf.js`
- **Purpose**: Tests CSRF token generation, validation, and protection
- **Command**: `npm run test:csrf`

### 2. **Comprehensive Security Tests**
- **File**: `Server/test-security-comprehensive.js`
- **Purpose**: Tests all security features including authentication, authorization, input validation, rate limiting, and more
- **Command**: `npm run test:security`

### 3. **Penetration Tests**
- **File**: `Server/test-penetration.js`
- **Purpose**: Tests for common vulnerabilities like injection attacks, XSS, authentication bypass, privilege escalation
- **Command**: `npm run test:penetration`

### 4. **Frontend Security Tests**
- **File**: `Client/src/tests/security-tests.js`
- **Purpose**: Tests client-side security features like form validation, XSS prevention, CSRF token handling
- **Usage**: Import and run in browser console

### 5. **Comprehensive Test Runner**
- **File**: `Client/src/tests/test-runner.js`
- **Purpose**: Runs all frontend and backend tests with unified reporting
- **Usage**: Import and run in browser console

## 🚀 Running Tests

### Backend Tests

```bash
# Navigate to server directory
cd Server

# Run individual test suites
npm run test:csrf              # CSRF protection tests
npm run test:security          # Comprehensive security tests
npm run test:penetration       # Penetration testing
npm run test:all              # Run all backend tests
npm run security:full         # Run security audit + all tests
```

### Frontend Tests

```javascript
// In browser console or component
import { runFrontendSecurityTests } from './tests/security-tests.js';
import { runComprehensiveTests } from './tests/test-runner.js';

// Run frontend security tests
await runFrontendSecurityTests();

// Run comprehensive tests (frontend + backend)
await runComprehensiveTests();
```

## 📊 Test Coverage

### Authentication & Authorization
- ✅ Password strength validation
- ✅ JWT token validation
- ✅ Authentication bypass prevention
- ✅ Role-based access control (RBAC)
- ✅ Session management
- ✅ Account lockout mechanisms

### Input Validation & Sanitization
- ✅ Email validation
- ✅ Password complexity requirements
- ✅ XSS prevention
- ✅ SQL/NoSQL injection prevention
- ✅ Command injection prevention
- ✅ Input sanitization

### CSRF Protection
- ✅ CSRF token generation
- ✅ Token validation
- ✅ Request blocking without tokens
- ✅ Invalid token rejection
- ✅ Token refresh mechanism

### Rate Limiting & Brute Force Protection
- ✅ Login attempt rate limiting
- ✅ Signup attempt rate limiting
- ✅ IP-based tracking
- ✅ Account lockout after failed attempts
- ✅ Progressive delays

### File Upload Security
- ✅ File type validation
- ✅ File size limits
- ✅ Malicious file detection
- ✅ Directory traversal prevention
- ✅ Secure file naming

### Information Disclosure
- ✅ Error message sanitization
- ✅ Stack trace protection
- ✅ Generic error responses
- ✅ Secure logging

## 🔍 Test Results Interpretation

### Status Codes
- **PASS** ✅ - Test passed, security feature working correctly
- **FAIL** ❌ - Test failed, security vulnerability detected
- **WARN** ⚠️ - Warning, should be addressed for production
- **INFO** ℹ️ - Informational, no action required

### Severity Levels (Penetration Tests)
- **HIGH** 🔴 - Critical vulnerability, immediate attention required
- **MEDIUM** 🟡 - Moderate vulnerability, should be addressed
- **LOW** 🟢 - Low risk, can be addressed later
- **PASS** ✅ - No vulnerability detected

## 📈 Sample Test Output

```
🚀 Starting Comprehensive Security Test Suite...

🔐 Testing Authentication Security...
✅ Password Strength Validation: PASS - Weak password correctly rejected
✅ Registration with Strong Password: PASS - User registered successfully
✅ Login with Valid Credentials: PASS - Login successful
✅ Login with Invalid Credentials: PASS - Invalid login correctly rejected

🚫 Testing Rate Limiting...
✅ Rate Limiting on Login: PASS - Rate limit correctly enforced

🔒 Testing Authorization (RBAC)...
✅ Protected Route Without Token: PASS - Protected route correctly blocked
✅ Protected Route With Token: PASS - Protected route accessible with valid token
✅ Admin Route as Regular User: PASS - Admin route correctly blocked for regular user

🧹 Testing Input Validation & Sanitization...
✅ XSS Prevention: PASS - XSS payload handled safely
✅ NoSQL Injection Prevention: PASS - Injection payload correctly rejected
✅ Email Validation: PASS - Invalid email correctly rejected

📁 Testing File Upload Security...
✅ File Type Validation: PASS - Invalid file type correctly rejected

🛡️ Testing CSRF Protection...
✅ CSRF Protection - No Token: PASS - Request correctly blocked without CSRF token
✅ CSRF Protection - With Token: PASS - Request succeeded with valid CSRF token

📊 SECURITY TEST REPORT
==================================================
Total Tests: 25
Passed: 25
Failed: 0
Success Rate: 100.0%

🎉 ALL SECURITY TESTS PASSED!
Your application is secure and ready for production.
```

## 🛠️ Customizing Tests

### Adding New Security Tests

1. **Backend Tests**: Add to `test-security-comprehensive.js`
```javascript
async testNewSecurityFeature() {
  this.log('🔒 Testing New Security Feature...', 'TEST');
  
  try {
    // Test implementation
    this.addResult('New Security Feature', 'PASS', 'Feature working correctly');
  } catch (error) {
    this.addResult('New Security Feature', 'FAIL', `Feature failed: ${error.message}`);
  }
}
```

2. **Frontend Tests**: Add to `security-tests.js`
```javascript
testNewFrontendSecurity() {
  this.log('🛡️ Testing New Frontend Security...', 'TEST');
  
  // Test implementation
  this.addResult('New Frontend Security', 'PASS', 'Feature working correctly');
}
```

### Modifying Test Parameters

Edit the test files to adjust:
- Test payloads
- Validation rules
- Rate limiting thresholds
- File upload restrictions
- Error message expectations

## 🔧 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: Cannot connect to backend
   Solution: Start the server with `npm run dev`
   ```

2. **CSRF Token Issues**
   ```
   Error: Failed to get CSRF token
   Solution: Ensure CSRF middleware is properly configured
   ```

3. **Test Failures**
   ```
   Check: Server logs for detailed error messages
   Verify: All security features are properly implemented
   Review: Test expectations match actual implementation
   ```

### Debug Mode

Enable detailed logging by modifying test files:
```javascript
// Add to test files for debugging
console.log('Debug:', { payload, response, error });
```

## 📚 Best Practices

1. **Run Tests Regularly**
   - Before each deployment
   - After security updates
   - During development iterations

2. **Monitor Test Results**
   - Track success rates over time
   - Address failed tests immediately
   - Document security improvements

3. **Update Tests**
   - Add tests for new features
   - Update tests for security changes
   - Maintain test coverage

4. **Production Readiness**
   - All tests should pass before production
   - Address warnings for production deployment
   - Regular security audits

## 🎯 Security Checklist

Before production deployment, ensure:

- [ ] All security tests pass
- [ ] No high-severity vulnerabilities detected
- [ ] Rate limiting properly configured
- [ ] CSRF protection enabled
- [ ] Input validation working
- [ ] File upload security implemented
- [ ] Authentication bypass prevented
- [ ] Information disclosure prevented
- [ ] HTTPS enforced in production
- [ ] Security headers configured

## 📞 Support

For issues with security tests:
1. Check server logs for detailed error messages
2. Verify all dependencies are installed
3. Ensure server is running on correct port
4. Review security implementation against test expectations

---

**Remember**: Security testing is an ongoing process. Regularly update and expand tests to cover new threats and vulnerabilities. 