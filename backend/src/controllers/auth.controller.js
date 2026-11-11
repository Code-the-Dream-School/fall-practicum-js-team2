const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

// The only user fields that are ever sent back to the client.
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
async function register(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email =
    typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (name.length > 30) {
    return res.status(400).json({ error: 'Name must be 30 characters or fewer.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
    });
    return res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    // P2002 = unique constraint violation (email already registered)
    if (err.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists.' });
    }
    console.error('register failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const email =
    typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Compare against a dummy hash when the email is unknown so the
    // response time does not reveal whether the account exists.
    const hash = user ? user.hashedPassword : await bcrypt.hash('dummy-password', SALT_ROUNDS);
    const passwordMatches = await bcrypt.compare(password, hash);
    if (!user || !passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    console.error('login failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /api/auth/me  (requires a valid token; see auth middleware)
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('me failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/logout
// Tokens are stateless, so logging out means the client discards its
// token. This endpoint exists so the client has one clear call to make.
function logout(req, res) {
  return res.json({ message: 'Logged out.' });
}

module.exports = { register, login, me, logout };
