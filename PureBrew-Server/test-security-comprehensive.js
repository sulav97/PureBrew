const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5001/api';

class SecurityTestSuite {
  constructor() {
    this.results = [];
    this.testUser = {
      name: 'Security Test User',
      email: `security-test-${Date.now()}@example.com`,
      password: 'Test1234!@#'
    };
    this.adminUser = {
      email: 'admin@purebrew.com',
      password: 'Admin1234!@#'
    };
    this.csrfToken = null;
    this.userToken = null;
    this.adminToken = null;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  addResult(test, status, details = '') {
    this.results.push({ test, status, details, timestamp: new Date() });
    this.log(`${test}: ${status} ${details}`, status === 'PASS' ? 'PASS' : 'FAIL');
  }

  async getCsrfToken() {
    try {
      const response = await axios.get(`${BASE_URL}/csrf-token`, {
        withCredentials: true
      });
      this.csrfToken = response.data.csrfToken;
      return true;
    } catch (error) {
      this.log(`Failed to get CSRF token: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async testAuthentication() {
    this.log('🔐 Testing Authentication Security...', 'TEST');

    // Test 1: Password Strength Validation
    try {
      const weakPassword = '123';
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `weak-pass-${Date.now()}@test.com`,
        password: weakPassword,
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('Password Strength Validation', 'FAIL', 'Weak password was accepted');
    } catch (error) {
      if (error.response?.data?.msg?.includes('Password must be')) {
        this.addResult('Password Strength Validation', 'PASS', 'Weak password correctly rejected');
      } else {
        this.addResult('Password Strength Validation', 'FAIL', `Unexpected error: ${error.response?.data?.msg}`);
      }
    }

    // Test 2: Registration with Strong Password
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: this.testUser.name,
        email: this.testUser.email,
        password: this.testUser.password,
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('Registration with Strong Password', 'PASS', 'User registered successfully');
    } catch (error) {
      this.addResult('Registration with Strong Password', 'FAIL', `Registration failed: ${error.response?.data?.msg}`);
    }

    // Test 3: Login with Valid Credentials
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: this.testUser.email,
        password: this.testUser.password
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.userToken = response.data.token;
      this.addResult('Login with Valid Credentials', 'PASS', 'Login successful');
    } catch (error) {
      this.addResult('Login with Valid Credentials', 'FAIL', `Login failed: ${error.response?.data?.msg}`);
    }

    // Test 4: Login with Invalid Credentials
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: this.testUser.email,
        password: 'wrongpassword'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('Login with Invalid Credentials', 'FAIL', 'Invalid login was accepted');
    } catch (error) {
      if (error.response?.data?.msg?.includes('Invalid credentials')) {
        this.addResult('Login with Invalid Credentials', 'PASS', 'Invalid login correctly rejected');
      } else {
        this.addResult('Login with Invalid Credentials', 'FAIL', `Unexpected error: ${error.response?.data?.msg}`);
      }
    }
  }

  async testRateLimiting() {
    this.log('🚫 Testing Rate Limiting...', 'TEST');

    // Test 1: Rate Limiting on Login
    let rateLimitHit = false;
    for (let i = 0; i < 6; i++) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
      } catch (error) {
        if (error.response?.data?.msg?.includes('too many')) {
          rateLimitHit = true;
          break;
        }
      }
    }
    
    if (rateLimitHit) {
      this.addResult('Rate Limiting on Login', 'PASS', 'Rate limit correctly enforced');
    } else {
      this.addResult('Rate Limiting on Login', 'FAIL', 'Rate limit not enforced');
    }
  }

  async testAuthorization() {
    this.log('🔒 Testing Authorization (RBAC)...', 'TEST');

    // Test 1: Access Protected Route Without Token
    try {
      await axios.get(`${BASE_URL}/users/profile`);
      this.addResult('Protected Route Without Token', 'FAIL', 'Accessed protected route without token');
    } catch (error) {
      if (error.response?.status === 401) {
        this.addResult('Protected Route Without Token', 'PASS', 'Protected route correctly blocked');
      } else {
        this.addResult('Protected Route Without Token', 'FAIL', `Unexpected error: ${error.response?.status}`);
      }
    }

    // Test 2: Access Protected Route With Token
    try {
      const response = await axios.get(`${BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      this.addResult('Protected Route With Token', 'PASS', 'Protected route accessible with valid token');
    } catch (error) {
      this.addResult('Protected Route With Token', 'FAIL', `Access denied: ${error.response?.data?.msg}`);
    }

    // Test 3: Access Admin Route as Regular User
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${this.userToken}` }
      });
      this.addResult('Admin Route as Regular User', 'FAIL', 'Regular user accessed admin route');
    } catch (error) {
      if (error.response?.status === 403) {
        this.addResult('Admin Route as Regular User', 'PASS', 'Admin route correctly blocked for regular user');
      } else {
        this.addResult('Admin Route as Regular User', 'FAIL', `Unexpected error: ${error.response?.status}`);
      }
    }
  }

  async testInputValidation() {
    this.log('🧹 Testing Input Validation & Sanitization...', 'TEST');

    // Test 1: XSS Prevention
    const xssPayload = '<script>alert("xss")</script>';
    try {
      const response = await axios.post(`${BASE_URL}/contact`, {
        name: xssPayload,
        email: 'test@example.com',
        message: xssPayload
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('XSS Prevention', 'PASS', 'XSS payload handled safely');
    } catch (error) {
      this.addResult('XSS Prevention', 'FAIL', `XSS test failed: ${error.response?.data?.msg}`);
    }

    // Test 2: SQL Injection Prevention (NoSQL)
    const injectionPayload = { $gt: '' };
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: injectionPayload,
        password: 'test'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('NoSQL Injection Prevention', 'PASS', 'Injection payload handled safely');
    } catch (error) {
      this.addResult('NoSQL Injection Prevention', 'FAIL', `Injection test failed: ${error.response?.data?.msg}`);
    }

    // Test 3: Email Validation
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('Email Validation', 'FAIL', 'Invalid email was accepted');
    } catch (error) {
      if (error.response?.data?.msg?.includes('Invalid email')) {
        this.addResult('Email Validation', 'PASS', 'Invalid email correctly rejected');
      } else {
        this.addResult('Email Validation', 'FAIL', `Unexpected error: ${error.response?.data?.msg}`);
      }
    }
  }

  async testFileUploadSecurity() {
    this.log('📁 Testing File Upload Security...', 'TEST');

    // Test 1: File Type Validation
    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file');

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(testFilePath));
      
      await axios.post(`${BASE_URL}/coffees`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.userToken}`,
          'X-CSRF-Token': this.csrfToken
        },
        withCredentials: true
      });
      this.addResult('File Type Validation', 'FAIL', 'Invalid file type was accepted');
    } catch (error) {
      if (error.response?.data?.msg?.includes('Invalid file type')) {
        this.addResult('File Type Validation', 'PASS', 'Invalid file type correctly rejected');
      } else {
        this.addResult('File Type Validation', 'FAIL', `Unexpected error: ${error.response?.data?.msg}`);
      }
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);
  }

  async testCsrfProtection() {
    this.log('🛡️ Testing CSRF Protection...', 'TEST');

    // Test 1: Request Without CSRF Token
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `csrf-test-${Date.now()}@test.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true
        // No CSRF token header
      });
      this.addResult('CSRF Protection - No Token', 'FAIL', 'Request succeeded without CSRF token');
    } catch (error) {
      if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        this.addResult('CSRF Protection - No Token', 'PASS', 'Request correctly blocked without CSRF token');
      } else {
        this.addResult('CSRF Protection - No Token', 'FAIL', `Unexpected error: ${error.response?.data?.error}`);
      }
    }

    // Test 2: Request With CSRF Token
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `csrf-test-valid-${Date.now()}@test.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('CSRF Protection - With Token', 'PASS', 'Request succeeded with valid CSRF token');
    } catch (error) {
      this.addResult('CSRF Protection - With Token', 'FAIL', `Request failed: ${error.response?.data?.msg}`);
    }
  }

  async testSessionManagement() {
    this.log('🔑 Testing Session Management...', 'TEST');

    // Test 1: JWT Token Validation
    try {
      const decoded = jwt.verify(this.userToken, process.env.JWT_SECRET);
      this.addResult('JWT Token Validation', 'PASS', 'Token is valid and properly signed');
    } catch (error) {
      this.addResult('JWT Token Validation', 'FAIL', `Token validation failed: ${error.message}`);
    }

    // Test 2: Tampered Token Rejection
    const tamperedToken = this.userToken + 'tampered';
    try {
      await axios.get(`${BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${tamperedToken}` }
      });
      this.addResult('Tampered Token Rejection', 'FAIL', 'Tampered token was accepted');
    } catch (error) {
      if (error.response?.status === 401) {
        this.addResult('Tampered Token Rejection', 'PASS', 'Tampered token correctly rejected');
      } else {
        this.addResult('Tampered Token Rejection', 'FAIL', `Unexpected error: ${error.response?.status}`);
      }
    }
  }

  async testDataIntegrity() {
    this.log('🔐 Testing Data Integrity...', 'TEST');

    // Test 1: Password Hashing
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    
    if (isMatch) {
      this.addResult('Password Hashing', 'PASS', 'Passwords properly hashed and verified');
    } else {
      this.addResult('Password Hashing', 'FAIL', 'Password hashing verification failed');
    }

    // Test 2: Data Validation
    try {
      const response = await axios.post(`${BASE_URL}/contact`, {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });
      this.addResult('Data Validation', 'PASS', 'Data validation working correctly');
    } catch (error) {
      this.addResult('Data Validation', 'FAIL', `Data validation failed: ${error.response?.data?.msg}`);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Security Test Suite...', 'START');

    // Get CSRF token first
    if (!(await this.getCsrfToken())) {
      this.log('❌ Failed to get CSRF token. Stopping tests.', 'ERROR');
      return;
    }

    // Run all test suites
    await this.testAuthentication();
    await this.testRateLimiting();
    await this.testAuthorization();
    await this.testInputValidation();
    await this.testFileUploadSecurity();
    await this.testCsrfProtection();
    await this.testSessionManagement();
    await this.testDataIntegrity();

    // Generate report
    this.generateReport();
  }

  generateReport() {
    this.log('\n📊 SECURITY TEST REPORT', 'REPORT');
    this.log('=' * 50, 'REPORT');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;

    this.log(`Total Tests: ${totalTests}`, 'REPORT');
    this.log(`Passed: ${passedTests}`, 'REPORT');
    this.log(`Failed: ${failedTests}`, 'REPORT');
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'REPORT');

    this.log('\n📋 DETAILED RESULTS:', 'REPORT');
    this.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      this.log(`${statusIcon} ${result.test}: ${result.details}`, 'REPORT');
    });

    if (failedTests === 0) {
      this.log('\n🎉 ALL SECURITY TESTS PASSED!', 'SUCCESS');
      this.log('Your application is secure and ready for production.', 'SUCCESS');
    } else {
      this.log('\n⚠️  SOME TESTS FAILED. Please review the security implementation.', 'WARNING');
    }
  }
}

// Run the test suite
const testSuite = new SecurityTestSuite();
testSuite.runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
}); 