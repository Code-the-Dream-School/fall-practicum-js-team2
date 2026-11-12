/**
 * Smoke test for the auth endpoints.
 *
 * Boots the real Express app on a random port, runs the checks below
 * against the database in DATABASE_URL, and removes the throwaway user
 * it created. Safe to run against a dev database.
 *
 * Usage:  npm run smoke:auth
 */
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const run = `smoke${Date.now()}`;
const user = {
  name: 'Smoke Tester',
  email: `${run}@example.com`,
  password: 'sup3r-secret',
};

let passed = 0;
let failed = 0;
function check(label, ok, extra = '') {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${label} ${extra}`);
  }
}

async function main() {
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;

  const call = async (path, { method = 'GET', body, token } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    console.log('auth smoke test');

    const reg = await call('/register', { method: 'POST', body: user });
    check('register returns 201', reg.status === 201, `got ${reg.status}`);
    check(
      'register returns the public user (numeric id, no password hash)',
      typeof reg.data.user?.id === 'number' &&
        reg.data.user?.email === user.email &&
        !('hashedPassword' in (reg.data.user || {})) &&
        !('hashed_password' in (reg.data.user || {}))
    );
    check('register returns a token', typeof reg.data.token === 'string');
    const token = reg.data.token;

    const dup = await call('/register', { method: 'POST', body: user });
    check('duplicate email returns 409', dup.status === 409, `got ${dup.status}`);

    const longName = await call('/register', {
      method: 'POST',
      body: { ...user, email: `${run}-2@example.com`, name: 'x'.repeat(31) },
    });
    check('name over 30 chars returns 400', longName.status === 400, `got ${longName.status}`);

    const shortPw = await call('/register', {
      method: 'POST',
      body: { ...user, email: `${run}-3@example.com`, password: 'short' },
    });
    check('short password returns 400', shortPw.status === 400, `got ${shortPw.status}`);

    const wrongPw = await call('/login', {
      method: 'POST',
      body: { email: user.email, password: 'wrong-password' },
    });
    check('login with wrong password returns 401', wrongPw.status === 401, `got ${wrongPw.status}`);

    const unknown = await call('/login', {
      method: 'POST',
      body: { email: `nobody-${run}@example.com`, password: user.password },
    });
    check(
      'login with unknown email returns the same generic 401',
      unknown.status === 401 && unknown.data.error === wrongPw.data.error,
      `got ${unknown.status} "${unknown.data.error}"`
    );

    const good = await call('/login', {
      method: 'POST',
      body: { email: user.email, password: user.password },
    });
    check('login with correct password returns 200 + token', good.status === 200 && typeof good.data.token === 'string', `got ${good.status}`);

    const meRes = await call('/me', { token });
    check('GET /me with token returns the user', meRes.status === 200 && meRes.data.user?.email === user.email, `got ${meRes.status}`);

    const meNoToken = await call('/me');
    check('GET /me without token returns 401', meNoToken.status === 401, `got ${meNoToken.status}`);

    const meBadToken = await call('/me', { token: 'not-a-real-token' });
    check('GET /me with a bad token returns 401', meBadToken.status === 401, `got ${meBadToken.status}`);

    const stored = await prisma.user.findUnique({ where: { email: user.email } });
    check(
      'password is stored as a bcrypt hash, not plain text',
      !!stored && /^\$2[aby]\$/.test(stored.hashedPassword) && stored.hashedPassword !== user.password
    );

    const out = await call('/logout', { method: 'POST', token });
    check('logout returns 200', out.status === 200, `got ${out.status}`);
  } finally {
    await prisma.user.deleteMany({ where: { email: { contains: run } } });
    await prisma.$disconnect();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
