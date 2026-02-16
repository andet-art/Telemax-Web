const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

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

// Main routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Aliases for frontend compatibility
router.post('/signup', registerValidation, authController.register);
router.post('/signin', loginValidation, authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;