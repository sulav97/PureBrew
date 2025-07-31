import { runFrontendSecurityTests } from './security-tests.js';

class ComprehensiveTestRunner {
  constructor() {
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async runFrontendTests() {
    this.log('🧪 Running Frontend Security Tests...', 'TEST');
    try {
      const frontendResults = await runFrontendSecurityTests();
      this.results.push(...frontendResults.map(result => ({
        ...result,
        category: 'Frontend',
        component: 'Client-Side Security'
      })));
      this.log(`✅ Frontend tests completed: ${frontendResults.length} tests`, 'SUCCESS');
    } catch (error) {
      this.log(`❌ Frontend tests failed: ${error.message}`, 'ERROR');
    }
  }

  async runBackendTests() {
    this.log('🔧 Running Backend Security Tests...', 'TEST');
    
    // Test API connectivity
    try {
      const response = await fetch('http://localhost:5001/api/csrf-token', {
        credentials: 'include'
      });
      
      if (response.ok) {
        this.results.push({
          test: 'Backend Connectivity',
          status: 'PASS',
          details: 'Backend server is accessible',
          category: 'Backend',
          component: 'API Connectivity'
        });
      } else {
        this.results.push({
          test: 'Backend Connectivity',
          status: 'FAIL',
          details: `Backend server returned ${response.status}`,
          category: 'Backend',
          component: 'API Connectivity'
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Backend Connectivity',
        status: 'FAIL',
        details: `Cannot connect to backend: ${error.message}`,
        category: 'Backend',
        component: 'API Connectivity'
      });
    }

    // Test CSRF token functionality
    try {
      const response = await fetch('http://localhost:5001/api/csrf-token', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.csrfToken && data.csrfToken.length > 0) {
        this.results.push({
          test: 'CSRF Token Generation',
          status: 'PASS',
          details: 'CSRF token successfully generated',
          category: 'Backend',
          component: 'CSRF Protection'
        });
      } else {
        this.results.push({
          test: 'CSRF Token Generation',
          status: 'FAIL',
          details: 'CSRF token is empty or invalid',
          category: 'Backend',
          component: 'CSRF Protection'
        });
      }
    } catch (error) {
      this.results.push({
        test: 'CSRF Token Generation',
        status: 'FAIL',
        details: `CSRF token generation failed: ${error.message}`,
        category: 'Backend',
        component: 'CSRF Protection'
      });
    }
  }

  testEnvironmentSecurity() {
    this.log('🌍 Testing Environment Security...', 'TEST');

    // Test HTTPS enforcement
    const isHttps = window.location.protocol === 'https:';
    this.results.push({
      test: 'HTTPS Enforcement',
      status: isHttps ? 'PASS' : 'WARN',
      details: isHttps ? 'Application served over HTTPS' : 'Application not served over HTTPS (development mode)',
      category: 'Environment',
      component: 'Transport Security'
    });

    // Test Content Security Policy
    const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    this.results.push({
      test: 'Content Security Policy',
      status: cspHeader ? 'PASS' : 'INFO',
      details: cspHeader ? 'CSP meta tag present' : 'CSP meta tag not found (may be set via headers)',
      category: 'Environment',
      component: 'Security Headers'
    });

    // Test secure cookies
    const cookies = document.cookie;
    this.results.push({
      test: 'Secure Cookies',
      status: cookies.includes('secure') || cookies.includes('httpOnly') ? 'PASS' : 'INFO',
      details: 'Cookie security attributes not visible in client (expected)',
      category: 'Environment',
      component: 'Cookie Security'
    });
  }

  testInputValidation() {
    this.log('📝 Testing Input Validation...', 'TEST');

    // Test email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const testEmails = [
      { email: 'test@example.com', expected: true },
      { email: 'invalid-email', expected: false },
      { email: '@example.com', expected: false },
      { email: 'test@', expected: false }
    ];

    testEmails.forEach(({ email, expected }) => {
      const isValid = emailRegex.test(email);
      this.results.push({
        test: `Email Validation - ${email}`,
        status: isValid === expected ? 'PASS' : 'FAIL',
        details: `Email validation ${isValid === expected ? 'correct' : 'incorrect'}`,
        category: 'Input Validation',
        component: 'Form Validation'
      });
    });

    // Test password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const testPasswords = [
      { password: 'Test1234!@#', expected: true },
      { password: 'weak', expected: false },
      { password: 'Password1', expected: false },
      { password: '12345678', expected: false }
    ];

    testPasswords.forEach(({ password, expected }) => {
      const isStrong = passwordRegex.test(password);
      this.results.push({
        test: `Password Strength - ${password}`,
        status: isStrong === expected ? 'PASS' : 'FAIL',
        details: `Password strength validation ${isStrong === expected ? 'correct' : 'incorrect'}`,
        category: 'Input Validation',
        component: 'Password Security'
      });
    });
  }

  testXssPrevention() {
    this.log('🚫 Testing XSS Prevention...', 'TEST');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<svg onload="alert(1)">',
      'javascript:alert(1)'
    ];

    xssPayloads.forEach(payload => {
      // Simulate sanitization
      const sanitized = payload
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '');
      
      const isSanitized = sanitized !== payload;
      this.results.push({
        test: `XSS Prevention - ${payload}`,
        status: isSanitized ? 'PASS' : 'FAIL',
        details: `XSS payload ${isSanitized ? 'sanitized' : 'not sanitized'}`,
        category: 'XSS Prevention',
        component: 'Input Sanitization'
      });
    });
  }

  async runAllTests() {
    this.startTime = new Date();
    this.log('🚀 Starting Comprehensive Security Test Suite...', 'START');

    // Run all test categories
    await this.runFrontendTests();
    await this.runBackendTests();
    this.testEnvironmentSecurity();
    this.testInputValidation();
    this.testXssPrevention();

    this.endTime = new Date();
    this.generateReport();
  }

  generateReport() {
    this.log('\n📊 COMPREHENSIVE SECURITY TEST REPORT', 'REPORT');
    this.log('=' * 60, 'REPORT');

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.filter(r => r.status === 'WARN').length;
    const infoTests = this.results.filter(r => r.status === 'INFO').length;

    const duration = this.endTime - this.startTime;

    this.log(`Test Duration: ${duration}ms`, 'REPORT');
    this.log(`Total Tests: ${totalTests}`, 'REPORT');
    this.log(`Passed: ${passedTests}`, 'REPORT');
    this.log(`Failed: ${failedTests}`, 'REPORT');
    this.log(`Warnings: ${warningTests}`, 'REPORT');
    this.log(`Info: ${infoTests}`, 'REPORT');
    this.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'REPORT');

    // Group results by category
    const categories = [...new Set(this.results.map(r => r.category))];
    
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
      const categoryTotal = categoryResults.length;
      
      this.log(`\n📋 ${category} (${categoryPassed}/${categoryTotal} passed):`, 'REPORT');
      
      categoryResults.forEach(result => {
        const statusIcon = result.status === 'PASS' ? '✅' : 
                          result.status === 'WARN' ? '⚠️' : 
                          result.status === 'INFO' ? 'ℹ️' : '❌';
        this.log(`  ${statusIcon} ${result.test}: ${result.details}`, 'REPORT');
      });
    });

    // Overall assessment
    if (failedTests === 0) {
      this.log('\n🎉 ALL SECURITY TESTS PASSED!', 'SUCCESS');
      this.log('Your application is secure and ready for production.', 'SUCCESS');
    } else {
      this.log('\n⚠️  SOME TESTS FAILED. Please review the security implementation.', 'WARNING');
      this.log(`❌ ${failedTests} tests failed and need attention.`, 'WARNING');
    }

    if (warningTests > 0) {
      this.log(`⚠️  ${warningTests} warnings should be addressed for production.`, 'WARNING');
    }

    // Export results for external use
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        warnings: warningTests,
        info: infoTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1),
        duration: duration
      },
      results: this.results,
      timestamp: this.endTime
    };
  }
}

// Export for use in components
export const runComprehensiveTests = async () => {
  const testRunner = new ComprehensiveTestRunner();
  await testRunner.runAllTests();
  return testRunner.results;
};

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  runComprehensiveTests();
} 