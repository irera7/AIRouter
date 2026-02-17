// Debug script to check authentication state
// Run this in your browser console on the dashboard page

console.log('=== Authentication Debug ===');
console.log('Token in localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
console.log('API Key in localStorage:', localStorage.getItem('apiKey') ? 'EXISTS' : 'MISSING');

if (localStorage.getItem('token')) {
  const token = localStorage.getItem('token');
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Try to decode JWT
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      console.log('Token expiry:', new Date(payload.exp * 1000).toISOString());
      console.log('Is expired?', Date.now() > payload.exp * 1000);
    }
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
}

// Test making a request
console.log('\n=== Testing Request ===');
fetch('http://localhost:3000/api/v1/analytics/summary', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => {
  console.log('Response status:', r.status);
  return r.json();
})
.then(data => console.log('Response data:', data))
.catch(err => console.error('Request failed:', err));

