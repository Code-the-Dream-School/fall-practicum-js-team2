const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';
const RESET_TOKEN_TTL = '30m';
// Where password reset links point. The frontend dev server by default;
// set FRONTEND_URL in deployed environments.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Used for login when the email is unknown so we still run bcrypt.compare without hashing per request.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

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

// Password reset tokens are stateless JWTs like the login tokens, but
// short-lived and marked with a purpose so a login token can never be
// used to reset a password (and a reset token never works as a login).
function signResetToken(user) {
  return jwt.sign(
    { sub: user.id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: RESET_TOKEN_TTL }
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
    const hash = user ? user.hashedPassword : DUMMY_PASSWORD_HASH;
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

// POST /api/auth/forgot-password
// Always answers with the same generic message, whether or not the
// email is registered, so this endpoint never reveals which emails
// have accounts (same idea as the generic 401 in login).
async function forgotPassword(req, res) {
  const email =
    typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const resetLink = `${FRONTEND_URL}/reset-password?token=${signResetToken(user)}`;
      // TODO(email): there is no email provider wired up yet, so for now
      // the reset link is printed to the server console instead of being
      // emailed. Send this link through the mailer once one exists.
      console.log(`[password reset] Reset link for ${user.email}: ${resetLink}`);
    }
    return res.json({
      message:
        'If an account with that email exists, a password reset link is on its way.',
    });
  } catch (err) {
    console.error('forgotPassword failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/reset-password
// Verifies the reset token, then replaces the user's password hash.
async function resetPassword(req, res) {
  const token = typeof req.body.token === 'string' ? req.body.token : '';
  const newPassword =
    typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    payload = null;
  }
  // Expired, tampered with, or not a reset token at all: one generic
  // message, so the response never hints at which part failed.
  if (!payload || payload.purpose !== 'password-reset') {
    return res.status(400).json({
      error: 'This reset link is invalid or has expired. Please request a new one.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: payload.sub },
      data: { hashedPassword },
    });
    return res.json({ message: 'Your password has been reset. You can now sign in.' });
  } catch (err) {
    // P2025 = record not found (account deleted after the link was sent)
    if (err.code === 'P2025') {
      return res.status(400).json({
        error: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }
    console.error('resetPassword failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { register, login, me, logout, forgotPassword, resetPassword };
