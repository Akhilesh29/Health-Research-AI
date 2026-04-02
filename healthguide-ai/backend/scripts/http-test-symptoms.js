const http = require('http');

function requestJson({ method, path, token, body }) {
  const payload = body ? JSON.stringify(body) : '';
  const options = {
    hostname: 'localhost',
    port: 4000,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const status = res.statusCode || 0;
        const parsed = data ? JSON.parse(data) : null;
        resolve({ status, body: parsed });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('timeout'));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  const email = `groq_${Date.now()}@example.com`;
  const password = 'password123';

  const signup = await requestJson({
    method: 'POST',
    path: '/api/auth/signup',
    body: { name: 'Groq User', email, password },
  });
  if (signup.status !== 201) {
    console.log('Signup failed:', signup.status, signup.body);
    process.exit(1);
  }

  const token = signup.body.token;
  const symptoms = await requestJson({
    method: 'POST',
    path: '/api/symptoms',
    token,
    body: { symptoms: ['fever', 'headache'], age: 28, gender: 'female', severity: 'moderate', duration: '2 days' },
  });

  console.log('Symptoms status:', symptoms.status);
  console.log('Symptoms body keys:', symptoms.body ? Object.keys(symptoms.body) : null);
  if (symptoms.body?.check?.analysis) {
    console.log('Urgency:', symptoms.body.check.analysis.urgencyLevel);
    console.log('Summary:', String(symptoms.body.check.analysis.summary).slice(0, 120));
  } else {
    console.log('Body:', symptoms.body);
  }
})().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

