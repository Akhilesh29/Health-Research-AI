const http = require('http');

const email = process.env.TEST_LOGIN_EMAIL || '';
const password = process.env.TEST_LOGIN_PASSWORD || 'password123';

if (!email) {
  console.error('Set TEST_LOGIN_EMAIL env var');
  process.exit(1);
}

const payload = JSON.stringify({ email, password });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
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

