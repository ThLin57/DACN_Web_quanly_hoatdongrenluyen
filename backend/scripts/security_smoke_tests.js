/*
  Security smoke tests (no external dev deps).
  Usage:
    set BASE_URL=http://localhost:5000 && node scripts/security_smoke_tests.js
*/

const http = require('http');
const https = require('https');
const axios = require('axios').default;

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

function clientFor(url) {
  return axios.create({
    baseURL: url,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    timeout: 10000,
    validateStatus: () => true
  });
}

const api = clientFor(BASE_URL);

async function testHelmetCSP() {
  const res = await api.get('/health');
  const csp = res.headers['content-security-policy'];
  const ok = typeof csp === 'string' && csp.includes("default-src 'self'");
  return { name: 'Helmet CSP header present', ok, details: csp || 'no header' };
}

async function testUploadsCorsNotWildcard() {
  const res = await api.get('/uploads'); // may be 404 but we only need headers
  const aco = res.headers['access-control-allow-origin'];
  // We tightened: should not be '*'. It may be undefined (then CORS handled by corsMw on actual CORS requests)
  const ok = aco !== '*';
  return { name: 'Uploads CORS not wildcard', ok, details: `Access-Control-Allow-Origin=${aco || '(none)'}` };
}

async function testLoginRateLimit() {
  const path = '/api/auth/login';
  let lastStatus = 0;
  let hit429 = false;
  for (let i = 0; i < 25; i++) {
    const res = await api.post(path, { maso: 'unknown_user', password: 'wrongpass' });
    lastStatus = res.status;
    if (res.status === 429) { hit429 = true; break; }
  }
  return { name: 'Login rate limit triggered', ok: hit429, details: `lastStatus=${lastStatus}` };
}

async function testSanitizeDoesNotCrash() {
  // Send suspicious payload to endpoints with validation; expect 400/401 but no 500
  const res = await api.post('/api/auth/register', {
    name: "<script>alert('xss')</script>",
    maso: '1234567',
    email: 'bad@@',
    password: '123456',
    confirmPassword: '123456'
  });
  const ok = res.status >= 400 && res.status < 500; // validation error expected
  return { name: 'Sanitize input (no server error)', ok, details: `status=${res.status}` };
}

async function run() {
  const tests = [
    testHelmetCSP,
    testUploadsCorsNotWildcard,
    testLoginRateLimit,
    testSanitizeDoesNotCrash
  ];
  const results = [];
  for (const t of tests) {
    try {
      results.push(await t());
    } catch (e) {
      results.push({ name: t.name || 'unnamed', ok: false, details: e.message });
    }
  }
  const passed = results.filter(r => r.ok).length;
  console.log('Security smoke test results:');
  for (const r of results) {
    console.log(`- ${r.ok ? '✔' : '✖'} ${r.name}: ${r.details}`);
  }
  if (passed !== results.length) process.exitCode = 1;
}

run();


