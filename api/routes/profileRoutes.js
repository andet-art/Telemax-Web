const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const profileValidation = [
  body('first_name').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('last_name').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone_number').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('country').optional().trim()
];

const addressValidation = [
  body('full_address').trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
  body('address_type').optional().isIn(['shipping', 'billing', 'both']).withMessage('Invalid address type'),
  body('country').optional().trim()
];

router.get('/', profileController.getProfile);
router.put('/', profileValidation, profileController.updateProfile);
router.get('/addresses', profileController.getAddresses);
router.post('/addresses', addressValidation, profileController.addAddress);
router.put('/addresses/:addressId', addressValidation, profileController.updateAddress);
router.delete('/addresses/:addressId', profileController.deleteAddress);
router.get('/consents', profileController.getConsents);
router.put('/marketing', profileController.updateMarketingConsent);

module.exports = router;
