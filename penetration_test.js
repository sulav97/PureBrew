const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const BASE_URL = 'http://localhost:5001';
const CLIENT_URL = 'http://localhost:5174';

class AdvancedPenetrationTester {
  constructor() {
    this.results = [];
    this.severityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];
    this.testSession = crypto.randomBytes(8).toString('hex');
    this.authenticatedToken = null;
  }

  log(type, message) {
    const ts = new Date().toISOString();
    console.log(`[${ts}] [${type}] ${message}`);
  }

  async runAllTests() {
    this.log('INFO', '🚀 Starting Advanced Penetration Testing Suite...');
    this.log('INFO', `Test Session ID: ${this.testSession}`);
    
    await this.testAuthentication();
    await this.testAuthorization();
    await this.testSQLInjection();
    await this.testXSS();
    await this.testCSRF();
    await this.testRateLimiting();
    await this.testInfoDisclosure();
    await this.testSessionManagement();
    await this.testInputValidation();
    await this.testFileUpload();
    await this.testBusinessLogic();
    await this.testAPISecurity();
    await this.testClientSideSecurity();
    await this.testNetworkSecurity();
    
    this.generateComprehensiveReport();
  }

  addResult({type, endpoint, payload, severity, message, evidence}) {
    this.results.push({
      type, 
      endpoint, 
      payload, 
      severity, 
      message, 
      evidence,
      timestamp: new Date().toISOString()
    });
    this.log(severity, `${type} on ${endpoint}: ${message}`);
  }

  async testAuthentication() {
    this.log('INFO', '🔐 Testing Authentication Mechanisms...');
    
    const authTests = [
      {
        name: 'Weak Password Policy',
        payload: { email: 'test@test.com', password: '123' },
        endpoint: '/api/auth/login'
      },
      {
        name: 'Brute Force Attack',
        payload: { email: 'admin@test.com', password: 'admin' },
        endpoint: '/api/auth/login'
      },
      {
        name: 'Account Enumeration',
        payload: { email: 'nonexistent@test.com', password: 'test123' },
        endpoint: '/api/auth/login'
      }
    ];

    for (const test of authTests) {
      try {
        const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.payload);
        this.addResult({
          type: 'Authentication',
          endpoint: test.endpoint,
          payload: test.payload,
          severity: 'HIGH',
          message: `${test.name} - Unexpected success`,
          evidence: response.data
        });
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'Authentication',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'CRITICAL',
            message: `${test.name} - Authentication bypassed`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testAuthorization() {
    this.log('INFO', '🔒 Testing Authorization Controls...');
    
    const protectedEndpoints = [
      '/api/users/profile',
      '/api/users',
      '/api/bookings',
      '/api/coffee/admin'
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        this.addResult({
          type: 'Authorization',
          endpoint,
          payload: null,
          severity: 'CRITICAL',
          message: 'Protected endpoint accessible without authentication',
          evidence: response.data
        });
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          this.addResult({
            type: 'Authorization',
            endpoint,
            payload: null,
            severity: 'MEDIUM',
            message: `Unexpected status code: ${error.response.status}`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testSQLInjection() {
    this.log('INFO', '💉 Testing SQL/NoSQL Injection...');
    
    const injectionPayloads = [
      { email: { "$ne": null }, password: "anything" },
      { email: "admin' || '1'=='1", password: "anything" },
      { email: "test@test.com", password: { "$gt": "" } },
      { email: "'; DROP TABLE users; --", password: "test" },
      { email: "' OR 1=1 --", password: "test" },
      { email: "admin'/**/OR/**/1=1", password: "test" }
    ];

    for (const payload of injectionPayloads) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, payload);
        if (response.data && response.data.token) {
          this.addResult({
            type: 'SQL/NoSQL Injection',
            endpoint: '/api/auth/login',
            payload,
            severity: 'CRITICAL',
            message: 'Injection successful - authentication bypassed',
            evidence: response.data
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'SQL/NoSQL Injection',
            endpoint: '/api/auth/login',
            payload,
            severity: 'HIGH',
            message: 'Potential injection vulnerability detected',
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testXSS() {
    this.log('INFO', '🕷️ Testing Cross-Site Scripting...');
    
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '"><img src=x onerror=alert("XSS")>'
    ];

    const endpoints = [
      { url: '/api/auth/register', data: { name: '', email: '', password: '', token: 'dummy' } },
      { url: '/api/contact', data: { name: '', email: '', message: '' } }
    ];

    for (const endpoint of endpoints) {
      for (const payload of xssPayloads) {
        const testData = { ...endpoint.data };
        Object.keys(testData).forEach(key => {
          if (key !== 'token') {
            testData[key] = payload;
          }
        });

        try {
          const response = await axios.post(`${BASE_URL}${endpoint.url}`, testData);
          this.addResult({
            type: 'XSS',
            endpoint: endpoint.url,
            payload,
            severity: 'HIGH',
            message: 'XSS payload accepted - manual verification required',
            evidence: response.data
          });
        } catch (error) {
          if (error.response && error.response.status === 200) {
            this.addResult({
              type: 'XSS',
              endpoint: endpoint.url,
              payload,
              severity: 'MEDIUM',
              message: 'Potential XSS vulnerability',
              evidence: error.response.data
            });
          }
        }
      }
    }
  }

  async testCSRF() {
    this.log('INFO', '🛡️ Testing CSRF Protection...');
    
    const csrfEndpoints = [
      '/api/auth/register',
      '/api/contact',
      '/api/users/profile'
    ];

    for (const endpoint of csrfEndpoints) {
      try {
        const response = await axios.post(`${BASE_URL}${endpoint}`, {
          test: 'csrf_test'
        });
        
        if (response.status === 200) {
          this.addResult({
            type: 'CSRF',
            endpoint,
            payload: { test: 'csrf_test' },
            severity: 'HIGH',
            message: 'CSRF protection may be missing',
            evidence: response.data
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          this.log('INFO', `CSRF protection working for ${endpoint}`);
        }
      }
    }
  }

  async testRateLimiting() {
    this.log('INFO', '⏱️ Testing Rate Limiting...');
    
    const rateLimitTests = [
      { endpoint: '/api/auth/login', method: 'POST', data: { email: 'test@test.com', password: 'wrong' } },
      { endpoint: '/api/auth/register', method: 'POST', data: { name: 'test', email: 'test@test.com', password: 'test123', token: 'dummy' } },
      { endpoint: '/api/contact', method: 'POST', data: { name: 'test', email: 'test@test.com', message: 'test' } }
    ];

    for (const test of rateLimitTests) {
      let blocked = false;
      let attempts = 0;
      
      for (let i = 0; i < 10; i++) {
        try {
          await axios({ 
            method: test.method, 
            url: `${BASE_URL}${test.endpoint}`, 
            data: test.data 
          });
          attempts++;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            blocked = true;
            this.log('INFO', `Rate limiting working for ${test.endpoint}`);
            break;
          }
        }
      }
      
      if (!blocked && attempts > 5) {
        this.addResult({
          type: 'Rate Limiting',
          endpoint: test.endpoint,
          payload: test.data,
          severity: 'MEDIUM',
          message: 'Rate limiting may not be properly configured',
          evidence: `Made ${attempts} requests without being blocked`
        });
      }
    }
  }

  async testInfoDisclosure() {
    this.log('INFO', '🔍 Testing Information Disclosure...');
    
    const sensitiveEndpoints = [
      '/.env',
      '/config',
      '/package.json',
      '/server.js',
      '/api/users',
      '/api/users/profile',
      '/admin',
      '/debug',
      '/error',
      '/logs'
    ];

    for (const endpoint of sensitiveEndpoints) {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        
        if (response.data) {
          const sensitivePatterns = [
            /jwt|secret|password|key|token/i,
            /mongo|database|connection/i,
            /admin|root|superuser/i,
            /api_key|access_token/i
          ];
          
          const responseText = JSON.stringify(response.data);
          for (const pattern of sensitivePatterns) {
            if (pattern.test(responseText)) {
              this.addResult({
                type: 'Information Disclosure',
                endpoint,
                payload: null,
                severity: 'HIGH',
                message: 'Sensitive information exposed',
                evidence: responseText.substring(0, 200) + '...'
              });
              break;
            }
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'Information Disclosure',
            endpoint,
            payload: null,
            severity: 'MEDIUM',
            message: 'Endpoint accessible but may expose sensitive data',
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testSessionManagement() {
    this.log('INFO', '🔐 Testing Session Management...');
    
    const sessionTests = [
      { name: 'Invalid Token', token: 'invalid_token_123' },
      { name: 'Expired Token', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDU2Nzg5MX0.invalid' },
      { name: 'Tampered Token', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOjE2MzQ1Njc4OTB9.tampered' },
      { name: 'Empty Token', token: '' },
      { name: 'Null Token', token: null }
    ];

    for (const test of sessionTests) {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${test.token}` }
        });
        
        this.addResult({
          type: 'Session Management',
          endpoint: '/api/users/profile',
          payload: test.token,
          severity: 'CRITICAL',
          message: `Profile accessible with ${test.name}`,
          evidence: response.data
        });
      } catch (error) {
        if (error.response && error.response.status !== 401) {
          this.addResult({
            type: 'Session Management',
            endpoint: '/api/users/profile',
            payload: test.token,
            severity: 'MEDIUM',
            message: `Unexpected response for ${test.name}`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testInputValidation() {
    this.log('INFO', '✅ Testing Input Validation...');
    
    const validationTests = [
      {
        endpoint: '/api/auth/register',
        payload: { name: '', email: 'notanemail', password: '123', token: 'dummy' },
        expected: 'Invalid input should be rejected'
      },
      {
        endpoint: '/api/contact',
        payload: { name: '', email: 'bad', message: '' },
        expected: 'Invalid input should be rejected'
      },
      {
        endpoint: '/api/auth/login',
        payload: { email: 'verylongemail@verylongdomain.com', password: 'a'.repeat(1000) },
        expected: 'Excessive input should be rejected'
      }
    ];

    for (const test of validationTests) {
      try {
        const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.payload);
        
        if (response.status === 200) {
          this.addResult({
            type: 'Input Validation',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'MEDIUM',
            message: 'Invalid input accepted',
            evidence: response.data
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'Input Validation',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'HIGH',
            message: 'Input validation bypassed',
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testFileUpload() {
    this.log('INFO', '📁 Testing File Upload Security...');
    
    const fileTests = [
      {
        name: 'Executable File',
        file: Buffer.from('#!/bin/bash\necho "malicious"', 'utf8'),
        filename: 'test.sh',
        contentType: 'application/x-sh'
      },
      {
        name: 'PHP File',
        file: Buffer.from('<?php system($_GET["cmd"]); ?>', 'utf8'),
        filename: 'test.php',
        contentType: 'application/x-httpd-php'
      },
      {
        name: 'Large File',
        file: Buffer.alloc(10 * 1024 * 1024),
        filename: 'large.txt',
        contentType: 'text/plain'
      }
    ];

    for (const test of fileTests) {
      try {
        const formData = new FormData();
        formData.append('file', test.file, test.filename);
        
        const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.addResult({
          type: 'File Upload',
          endpoint: '/api/upload',
          payload: test.name,
          severity: 'HIGH',
          message: `Dangerous file type accepted: ${test.name}`,
          evidence: response.data
        });
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'File Upload',
            endpoint: '/api/upload',
            payload: test.name,
            severity: 'MEDIUM',
            message: `File upload may be vulnerable: ${test.name}`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testBusinessLogic() {
    this.log('INFO', '💼 Testing Business Logic Flaws...');
    
    const businessLogicTests = [
      {
        name: 'Price Manipulation',
        endpoint: '/api/payment',
        payload: { amount: -100, currency: 'USD' },
        expected: 'Negative amounts should be rejected'
      },
      {
        name: 'Quantity Manipulation',
        endpoint: '/api/cart',
        payload: { quantity: 999999, productId: '123' },
        expected: 'Excessive quantities should be limited'
      },
      {
        name: 'Date Manipulation',
        endpoint: '/api/booking',
        payload: { date: '2020-01-01', time: '25:00' },
        expected: 'Invalid dates should be rejected'
      }
    ];

    for (const test of businessLogicTests) {
      try {
        const response = await axios.post(`${BASE_URL}${test.endpoint}`, test.payload);
        
        if (response.status === 200) {
          this.addResult({
            type: 'Business Logic',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'HIGH',
            message: `Business logic flaw: ${test.name}`,
            evidence: response.data
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'Business Logic',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'MEDIUM',
            message: `Potential business logic issue: ${test.name}`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testAPISecurity() {
    this.log('INFO', '🔌 Testing API Security...');
    
    const apiTests = [
      {
        name: 'Method Override',
        method: 'PUT',
        endpoint: '/api/users/profile',
        payload: { name: 'hacked' }
      },
      {
        name: 'HTTP Method Fuzzing',
        method: 'OPTIONS',
        endpoint: '/api/auth/login',
        payload: {}
      },
      {
        name: 'Content-Type Manipulation',
        endpoint: '/api/auth/login',
        payload: { email: 'test@test.com', password: 'test' },
        headers: { 'Content-Type': 'application/xml' }
      }
    ];

    for (const test of apiTests) {
      try {
        const response = await axios({
          method: test.method || 'POST',
          url: `${BASE_URL}${test.endpoint}`,
          data: test.payload,
          headers: test.headers || {}
        });
        
        this.addResult({
          type: 'API Security',
          endpoint: test.endpoint,
          payload: test.payload,
          severity: 'MEDIUM',
          message: `API security issue: ${test.name}`,
          evidence: response.data
        });
      } catch (error) {
        if (error.response && error.response.status === 200) {
          this.addResult({
            type: 'API Security',
            endpoint: test.endpoint,
            payload: test.payload,
            severity: 'LOW',
            message: `Potential API issue: ${test.name}`,
            evidence: error.response.data
          });
        }
      }
    }
  }

  async testClientSideSecurity() {
    this.log('INFO', '🌐 Testing Client-Side Security...');
    
    try {
      const response = await axios.get(CLIENT_URL);
      
      if (response.data) {
        const clientSideChecks = [
          { pattern: /console\.log/i, message: 'Debug statements found' },
          { pattern: /api_key|secret|password/i, message: 'Sensitive data in client code' },
          { pattern: /eval\(|Function\(/i, message: 'Dangerous eval usage' },
          { pattern: /innerHTML|outerHTML/i, message: 'Potential XSS vectors' }
        ];
        
        for (const check of clientSideChecks) {
          if (check.pattern.test(response.data)) {
            this.addResult({
              type: 'Client-Side Security',
              endpoint: CLIENT_URL,
              payload: null,
              severity: 'MEDIUM',
              message: check.message,
              evidence: 'Found in client-side code'
            });
          }
        }
      }
    } catch (error) {
      this.addResult({
        type: 'Client-Side Security',
        endpoint: CLIENT_URL,
        payload: null,
        severity: 'LOW',
        message: 'Unable to access client application',
        evidence: error.message
      });
    }
  }

  async testNetworkSecurity() {
    this.log('INFO', '🌐 Testing Network Security...');
    
    const networkTests = [
      {
        name: 'HTTPS Enforcement',
        url: BASE_URL.replace('http://', 'https://'),
        expected: 'Should redirect to HTTPS'
      },
      {
        name: 'Security Headers',
        url: BASE_URL,
        expected: 'Should have security headers'
      }
    ];

    for (const test of networkTests) {
      try {
        const response = await axios.get(test.url, {
          maxRedirects: 0,
          validateStatus: (status) => status < 400
        });
        
        const securityHeaders = [
          'Strict-Transport-Security',
          'X-Content-Type-Options',
          'X-Frame-Options',
          'X-XSS-Protection',
          'Content-Security-Policy'
        ];
        
        const missingHeaders = securityHeaders.filter(header => 
          !response.headers[header.toLowerCase()]
        );
        
        if (missingHeaders.length > 0) {
          this.addResult({
            type: 'Network Security',
            endpoint: test.url,
            payload: null,
            severity: 'MEDIUM',
            message: `Missing security headers: ${missingHeaders.join(', ')}`,
            evidence: response.headers
          });
        }
      } catch (error) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          this.addResult({
            type: 'Network Security',
            endpoint: test.url,
            payload: null,
            severity: 'LOW',
            message: 'Service not accessible',
            evidence: error.message
          });
        }
      }
    }
  }

  generateComprehensiveReport() {
    this.log('INFO', '\n' + '='.repeat(80));
    this.log('INFO', '🔍 COMPREHENSIVE PENETRATION TEST REPORT');
    this.log('INFO', '='.repeat(80));
    
    const grouped = {};
    for (const sev of this.severityLevels) grouped[sev] = [];
    for (const r of this.results) grouped[r.severity].push(r);
    
    let totalFindings = 0;
    let criticalCount = 0;
    let highCount = 0;
    
    for (const sev of this.severityLevels) {
      const findings = grouped[sev];
      if (findings.length > 0) {
        this.log('INFO', `\n📊 ${sev} FINDINGS (${findings.length}):`);
        this.log('INFO', '-'.repeat(50));
        
        for (const finding of findings) {
          this.log(sev, `🔸 ${finding.type}`);
          this.log('INFO', `   Endpoint: ${finding.endpoint}`);
          this.log('INFO', `   Message: ${finding.message}`);
          if (finding.payload) {
            this.log('INFO', `   Payload: ${JSON.stringify(finding.payload).substring(0, 100)}...`);
          }
          this.log('INFO', '');
        }
        
        totalFindings += findings.length;
        if (sev === 'CRITICAL') criticalCount = findings.length;
        if (sev === 'HIGH') highCount = findings.length;
      }
    }
    
    this.log('INFO', '\n📈 SUMMARY STATISTICS:');
    this.log('INFO', '='.repeat(50));
    this.log('INFO', `Total Findings: ${totalFindings}`);
    this.log('INFO', `Critical: ${criticalCount}`);
    this.log('INFO', `High: ${highCount}`);
    this.log('INFO', `Medium: ${grouped['MEDIUM'].length}`);
    this.log('INFO', `Low: ${grouped['LOW'].length}`);
    this.log('INFO', `Info: ${grouped['INFO'].length}`);
    
    if (criticalCount > 0 || highCount > 0) {
      this.log('CRITICAL', '\n🚨 IMMEDIATE ACTION REQUIRED!');
      this.log('CRITICAL', 'Critical and High severity findings must be addressed immediately.');
    } else {
      this.log('INFO', '\n✅ No critical or high severity findings detected.');
    }
    
    this.log('INFO', '\n📋 RECOMMENDATIONS:');
    this.log('INFO', '1. Address all Critical and High severity findings immediately');
    this.log('INFO', '2. Review Medium severity findings within 30 days');
    this.log('INFO', '3. Consider Low severity findings for future improvements');
    this.log('INFO', '4. Implement additional security controls as needed');
    
    this.log('INFO', '\n' + '='.repeat(80));
    this.log('INFO', 'Report generated successfully!');
  }
}

if (require.main === module) {
  (async () => {
    try {
      const tester = new AdvancedPenetrationTester();
      await tester.runAllTests();
    } catch (error) {
      console.error('❌ Penetration test failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = AdvancedPenetrationTester; 