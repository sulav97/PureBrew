const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5001/api';

class PenetrationTester {
  constructor() {
    this.results = [];
    this.csrfToken = null;
    this.userToken = null;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  addResult(vulnerability, severity, details = '', payload = '') {
    this.results.push({ 
      vulnerability, 
      severity, 
      details, 
      payload, 
      timestamp: new Date() 
    });
    this.log(`${vulnerability}: ${severity} - ${details}`, severity === 'LOW' ? 'INFO' : 'WARN');
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

  async testAuthenticationBypass() {
    this.log('🔓 Testing Authentication Bypass...', 'TEST');

    // Test 1: Access Protected Routes Without Authentication
    const protectedRoutes = [
      '/users/profile',
      '/bookings/my',
      '/users/2fa/backup'
    ];

    for (const route of protectedRoutes) {
      try {
        await axios.get(`${BASE_URL}${route}`);
        this.addResult('Authentication Bypass', 'HIGH', `Protected route accessible without auth: ${route}`);
      } catch (error) {
        if (error.response?.status === 401) {
          this.addResult('Authentication Bypass', 'PASS', `Protected route correctly blocked: ${route}`);
        } else {
          this.addResult('Authentication Bypass', 'MEDIUM', `Unexpected response for ${route}: ${error.response?.status}`);
        }
      }
    }

    // Test 2: JWT Token Manipulation
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2MzQ1Njc4OTB9.fake-signature';
    try {
      await axios.get(`${BASE_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${fakeToken}` }
      });
      this.addResult('JWT Token Manipulation', 'HIGH', 'Fake JWT token was accepted');
    } catch (error) {
      if (error.response?.status === 401) {
        this.addResult('JWT Token Manipulation', 'PASS', 'Fake JWT token correctly rejected');
      } else {
        this.addResult('JWT Token Manipulation', 'MEDIUM', `Unexpected response: ${error.response?.status}`);
      }
    }
  }

  async testInjectionAttacks() {
    this.log('💉 Testing Injection Attacks...', 'TEST');

    // Test 1: NoSQL Injection
    const nosqlPayloads = [
      { email: { $ne: '' }, password: 'test' },
      { email: { $gt: '' }, password: 'test' },
      { email: { $regex: '.*' }, password: 'test' },
      { email: { $exists: true }, password: 'test' }
    ];

    for (const payload of nosqlPayloads) {
      try {
        await axios.post(`${BASE_URL}/auth/login`, payload, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        this.addResult('NoSQL Injection', 'HIGH', 'NoSQL injection payload succeeded', JSON.stringify(payload));
      } catch (error) {
        this.addResult('NoSQL Injection', 'PASS', 'NoSQL injection payload correctly rejected', JSON.stringify(payload));
      }
    }

    // Test 2: Command Injection
    const commandPayloads = [
      'test; ls -la',
      'test && cat /etc/passwd',
      'test | whoami',
      'test$(whoami)'
    ];

    for (const payload of commandPayloads) {
      try {
        await axios.post(`${BASE_URL}/contact`, {
          name: payload,
          email: 'test@example.com',
          message: 'test'
        }, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        this.addResult('Command Injection', 'HIGH', 'Command injection payload succeeded', payload);
      } catch (error) {
        this.addResult('Command Injection', 'PASS', 'Command injection payload correctly rejected', payload);
      }
    }
  }

  async testXssAttacks() {
    this.log('🚫 Testing XSS Attacks...', 'TEST');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<svg onload="alert(1)">',
      'javascript:alert(1)',
      '"><script>alert("xss")</script>',
      '\'><script>alert("xss")</script>'
    ];

    for (const payload of xssPayloads) {
      try {
        await axios.post(`${BASE_URL}/auth/register`, {
          name: payload,
          email: `xss-${Date.now()}@test.com`,
          password: 'Test1234!@#',
          token: 'dummy'
        }, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': this.csrfToken }
        });
        this.addResult('XSS Attack', 'MEDIUM', 'XSS payload was accepted', payload);
      } catch (error) {
        this.addResult('XSS Attack', 'PASS', 'XSS payload correctly rejected', payload);
      }
    }
  }

  async testCsrfAttacks() {
    this.log('🛡️ Testing CSRF Attacks...', 'TEST');

    // Test 1: Request Without CSRF Token
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'CSRF Test',
        email: `csrf-attack-${Date.now()}@test.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true
        // No CSRF token
      });
      this.addResult('CSRF Attack', 'HIGH', 'Request succeeded without CSRF token');
    } catch (error) {
      if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        this.addResult('CSRF Attack', 'PASS', 'Request correctly blocked without CSRF token');
      } else {
        this.addResult('CSRF Attack', 'MEDIUM', `Unexpected error: ${error.response?.data?.error}`);
      }
    }

    // Test 2: Invalid CSRF Token
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'CSRF Test',
        email: `csrf-invalid-${Date.now()}@test.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': 'invalid-token' }
      });
      this.addResult('CSRF Attack - Invalid Token', 'HIGH', 'Request succeeded with invalid CSRF token');
    } catch (error) {
      if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        this.addResult('CSRF Attack - Invalid Token', 'PASS', 'Request correctly blocked with invalid CSRF token');
      } else {
        this.addResult('CSRF Attack - Invalid Token', 'MEDIUM', `Unexpected error: ${error.response?.data?.error}`);
      }
    }
  }

  async testPrivilegeEscalation() {
    this.log('🔺 Testing Privilege Escalation...', 'TEST');

    // First, create a regular user
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Regular User',
        email: `regular-${Date.now()}@test.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });

      // Login as regular user
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: `regular-${Date.now()}@test.com`,
        password: 'Test1234!@#'
      }, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': this.csrfToken }
      });

      this.userToken = loginResponse.data.token;

      // Test 1: Access Admin Routes as Regular User
      const adminRoutes = [
        '/users',
        '/bookings/admin',
        '/coffees' // POST/PUT/DELETE operations
      ];

      for (const route of adminRoutes) {
        try {
          await axios.get(`${BASE_URL}${route}`, {
            headers: { 'Authorization': `Bearer ${this.userToken}` }
          });
          this.addResult('Privilege Escalation', 'HIGH', `Regular user accessed admin route: ${route}`);
        } catch (error) {
          if (error.response?.status === 403) {
            this.addResult('Privilege Escalation', 'PASS', `Admin route correctly blocked for regular user: ${route}`);
          } else {
            this.addResult('Privilege Escalation', 'MEDIUM', `Unexpected response for ${route}: ${error.response?.status}`);
          }
        }
      }

    } catch (error) {
      this.addResult('Privilege Escalation Setup', 'FAIL', `Failed to setup test: ${error.message}`);
    }
  }

  async testInformationDisclosure() {
    this.log('📋 Testing Information Disclosure...', 'TEST');

    // Test 1: Error Message Information Disclosure
    try {
      await axios.get(`${BASE_URL}/nonexistent-route`);
      this.addResult('Information Disclosure', 'MEDIUM', 'Detailed error information exposed');
    } catch (error) {
      if (error.response?.data?.msg?.includes('stack') || error.response?.data?.msg?.includes('Error:')) {
        this.addResult('Information Disclosure', 'MEDIUM', 'Stack trace or detailed error exposed');
      } else {
        this.addResult('Information Disclosure', 'PASS', 'Generic error message returned');
      }
    }

    // Test 2: Directory Traversal
    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];

    for (const payload of traversalPayloads) {
      try {
        await axios.get(`${BASE_URL}/uploads/${payload}`);
        this.addResult('Directory Traversal', 'HIGH', 'Directory traversal succeeded', payload);
      } catch (error) {
        this.addResult('Directory Traversal', 'PASS', 'Directory traversal correctly blocked', payload);
      }
    }
  }

  async testRateLimitingBypass() {
    this.log('🚫 Testing Rate Limiting Bypass...', 'TEST');

    // Test 1: Rapid Login Attempts
    let rateLimitHit = false;
    for (let i = 0; i < 10; i++) {
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
      this.addResult('Rate Limiting Bypass', 'PASS', 'Rate limiting correctly enforced');
    } else {
      this.addResult('Rate Limiting Bypass', 'HIGH', 'Rate limiting not enforced');
    }

    // Test 2: Different IP Bypass (simulated)
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      }, {
        withCredentials: true,
        headers: { 
          'X-CSRF-Token': this.csrfToken,
          'X-Forwarded-For': '192.168.1.100'
        }
      });
      this.addResult('Rate Limiting - IP Bypass', 'MEDIUM', 'IP-based rate limiting bypassed');
    } catch (error) {
      this.addResult('Rate Limiting - IP Bypass', 'PASS', 'IP-based rate limiting working');
    }
  }

  async testFileUploadVulnerabilities() {
    this.log('📁 Testing File Upload Vulnerabilities...', 'TEST');

    const FormData = require('form-data');
    const fs = require('fs');
    const path = require('path');

    // Test 1: Malicious File Upload
    const maliciousFiles = [
      { name: 'shell.php', content: '<?php system($_GET["cmd"]); ?>' },
      { name: 'shell.jsp', content: '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>' },
      { name: 'shell.asp', content: '<% Response.Write(CreateObject("WScript.Shell").Exec(Request.QueryString("cmd")).StdOut.ReadAll()) %>' },
      { name: 'shell.exe', content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00' }
    ];

    for (const file of maliciousFiles) {
      const testFilePath = path.join(__dirname, file.name);
      fs.writeFileSync(testFilePath, file.content);

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
        this.addResult('File Upload - Malicious File', 'HIGH', `Malicious file uploaded: ${file.name}`);
      } catch (error) {
        this.addResult('File Upload - Malicious File', 'PASS', `Malicious file correctly rejected: ${file.name}`);
      }

      // Clean up
      fs.unlinkSync(testFilePath);
    }

    // Test 2: Large File Upload
    const largeContent = 'A'.repeat(10 * 1024 * 1024); // 10MB
    const largeFilePath = path.join(__dirname, 'large-file.txt');
    fs.writeFileSync(largeFilePath, largeContent);

    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(largeFilePath));
      
      await axios.post(`${BASE_URL}/coffees`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.userToken}`,
          'X-CSRF-Token': this.csrfToken
        },
        withCredentials: true
      });
      this.addResult('File Upload - Large File', 'MEDIUM', 'Large file uploaded successfully');
    } catch (error) {
      this.addResult('File Upload - Large File', 'PASS', 'Large file correctly rejected');
    }

    // Clean up
    fs.unlinkSync(largeFilePath);
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Penetration Testing...', 'START');

    // Get CSRF token first
    if (!(await this.getCsrfToken())) {
      this.log('❌ Failed to get CSRF token. Stopping tests.', 'ERROR');
      return;
    }

    // Run all penetration tests
    await this.testAuthenticationBypass();
    await this.testInjectionAttacks();
    await this.testXssAttacks();
    await this.testCsrfAttacks();
    await this.testPrivilegeEscalation();
    await this.testInformationDisclosure();
    await this.testRateLimitingBypass();
    await this.testFileUploadVulnerabilities();

    // Generate report
    this.generateReport();
  }

  generateReport() {
    this.log('\n📊 PENETRATION TEST REPORT', 'REPORT');
    this.log('=' * 50, 'REPORT');

    const totalTests = this.results.length;
    const highVulns = this.results.filter(r => r.severity === 'HIGH').length;
    const mediumVulns = this.results.filter(r => r.severity === 'MEDIUM').length;
    const lowVulns = this.results.filter(r => r.severity === 'LOW').length;
    const passedTests = this.results.filter(r => r.severity === 'PASS').length;

    this.log(`Total Tests: ${totalTests}`, 'REPORT');
    this.log(`High Severity Vulnerabilities: ${highVulns}`, 'REPORT');
    this.log(`Medium Severity Vulnerabilities: ${mediumVulns}`, 'REPORT');
    this.log(`Low Severity Vulnerabilities: ${lowVulns}`, 'REPORT');
    this.log(`Passed Security Tests: ${passedTests}`, 'REPORT');

    this.log('\n📋 VULNERABILITY DETAILS:', 'REPORT');
    this.results.forEach(result => {
      const severityIcon = result.severity === 'HIGH' ? '🔴' : 
                          result.severity === 'MEDIUM' ? '🟡' : 
                          result.severity === 'LOW' ? '🟢' : '✅';
      this.log(`${severityIcon} ${result.vulnerability}: ${result.details}`, 'REPORT');
      if (result.payload) {
        this.log(`   Payload: ${result.payload}`, 'REPORT');
      }
    });

    if (highVulns === 0 && mediumVulns === 0) {
      this.log('\n🎉 NO CRITICAL VULNERABILITIES FOUND!', 'SUCCESS');
      this.log('Your application is secure against common attack vectors.', 'SUCCESS');
    } else {
      this.log('\n⚠️  VULNERABILITIES FOUND. Please address them before production deployment.', 'WARNING');
      if (highVulns > 0) {
        this.log(`🔴 ${highVulns} HIGH severity vulnerabilities need immediate attention.`, 'WARNING');
      }
      if (mediumVulns > 0) {
        this.log(`🟡 ${mediumVulns} MEDIUM severity vulnerabilities should be addressed.`, 'WARNING');
      }
    }
  }
}

// Run the penetration tests
const penetrationTester = new PenetrationTester();
penetrationTester.runAllTests().catch(error => {
  console.error('❌ Penetration testing failed:', error.message);
}); 