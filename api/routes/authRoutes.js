const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 🔥 ADD THESE 2 IMPORTS
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // adjust if your db export differs

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================================
   VALIDATIONS
================================ */

const registerValidation = [
  body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone_number').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('date_of_birth').optional().isDate().withMessage('Please provide a valid date of birth'),
  body('country').optional().trim().isLength({ min: 2 }).withMessage('Please provide a valid country'),
  body('marketing_emails').optional().isBoolean(),
  body('terms_accepted').optional().isBoolean(),
  body('privacy_accepted').optional().isBoolean(),
  body('age_verified').optional().isBoolean()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

/* ================================
   GOOGLE LOGIN ROUTE
================================ */

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const firstName = payload?.given_name || '';
    const lastName = payload?.family_name || '';
    const googleSub = payload?.sub;

    if (!email || !googleSub)
      return res.status(401).json({ message: "Invalid Google token" });

    if (!emailVerified)
      return res.status(401).json({ message: "Google email not verified" });

    // Check if user exists
    const [rows] = await pool.execute(
      "SELECT id, first_name, last_name, email, provider, google_sub FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    let user = rows[0];

    if (!user) {
      // Create Google user
      const [result] = await pool.execute(
        `INSERT INTO users
        (first_name, last_name, email, password, provider, google_sub, is_verified, email_verified_at, last_login, is_active, marketing_emails, is_18_plus)
        VALUES (?, ?, ?, NULL, 'google', ?, 1, NOW(), NOW(), 1, 0, 1)`,
        [firstName, lastName, email, googleSub]
      );

      user = {
        id: result.insertId,
        first_name: firstName,
        last_name: lastName,
        email
      };
    } else {
      // Link Google if not linked
      if (!user.google_sub) {
        await pool.execute(
          "UPDATE users SET google_sub = ?, provider = 'google', is_verified = 1 WHERE id = ?",
          [googleSub, user.id]
        );
      }

      await pool.execute(
        "UPDATE users SET last_login = NOW() WHERE id = ?",
        [user.id]
      );
    }

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

/* ================================
   MAIN ROUTES
================================ */

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Aliases
router.post('/signup', registerValidation, authController.register);
router.post('/signin', loginValidation, authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;