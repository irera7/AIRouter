import fetch from 'node-fetch';

const API_KEY = 'sk-air-aqBzZhZWzqRfz6sIsu7GmMa5u4JzA3PA';

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/admin/audit-logs', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();
