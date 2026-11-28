const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Mounted at /api/auth
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, me);

module.exports = router;
