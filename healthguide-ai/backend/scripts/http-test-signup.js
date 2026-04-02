const http = require('http');

const payload = JSON.stringify({
  name: 'HTTP Debug User',
  email: `http_debug_${Date.now()}@example.com`,
  password: 'password123',
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('Request timed out after 5s');
  req.destroy(new Error('timeout'));
});

req.write(payload);
req.end();

