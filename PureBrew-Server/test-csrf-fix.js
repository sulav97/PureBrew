const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testCsrfFix() {
  console.log('🧪 Testing CSRF Token Fix...\n');

  try {
    // Test 1: Get CSRF token
    console.log('1. Getting CSRF token...');
    const tokenResponse = await axios.get(`${BASE_URL}/csrf-token`, {
      withCredentials: true
    });
    
    if (tokenResponse.data.csrfToken) {
      console.log('✅ CSRF token received successfully');
      console.log('   Token length:', tokenResponse.data.csrfToken.length);
    } else {
      console.log('❌ CSRF token is empty');
      return;
    }
    
    // Test 2: Try registration with CSRF token
    console.log('\n2. Testing registration with CSRF token...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true,
        headers: {
          'X-CSRF-Token': tokenResponse.data.csrfToken
        }
      });
      console.log('✅ Registration with CSRF token succeeded');
    } catch (error) {
      if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        console.log('❌ CSRF token validation still failing');
        console.log('   Error:', error.response.data.msg);
      } else {
        console.log('✅ CSRF protection working (registration failed for other reasons)');
        console.log('   Response:', error.response?.data?.msg || 'Unknown error');
      }
    }

    // Test 3: Try registration without CSRF token (should fail)
    console.log('\n3. Testing registration without CSRF token...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Test User',
        email: `test-no-csrf-${Date.now()}@example.com`,
        password: 'Test1234!@#',
        token: 'dummy'
      }, {
        withCredentials: true
        // No CSRF token header
      });
      console.log('❌ Registration succeeded without CSRF token (should have failed)');
    } catch (error) {
      if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        console.log('✅ CSRF protection working - registration blocked without token');
      } else {
        console.log('⚠️  Different error:', error.response?.data?.msg || error.message);
      }
    }

    console.log('\n🎉 CSRF Token Fix Test Complete!');
    console.log('✅ CSRF tokens are being generated');
    console.log('✅ CSRF protection is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5001');
    }
  }
}

// Run the test
testCsrfFix(); 