const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number, 
      date_of_birth, 
      country,
      shipping_address,
      billing_address,
      billing_same_as_shipping,
      marketing_emails,
      terms_accepted,
      privacy_accepted,
      age_verified
    } = req.body;

    // Validate required consents
    if (!terms_accepted || !privacy_accepted || !age_verified) {
      return res.status(400).json({
        success: false,
        message: 'You must accept terms of service, privacy policy, and verify age'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const userId = await User.create({ 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number, 
      date_of_birth, 
      country,
      marketing_emails: marketing_emails || false
    });

    // Create shipping address if provided
    if (shipping_address && shipping_address.trim()) {
      await User.createAddress(userId, {
        address_type: billing_same_as_shipping ? 'both' : 'shipping',
        full_address: shipping_address,
        country: country,
        is_default: true
      });
    }

    // Create separate billing address if provided and different
    if (billing_address && billing_address.trim() && !billing_same_as_shipping) {
      await User.createAddress(userId, {
        address_type: 'billing',
        full_address: billing_address,
        country: country,
        is_default: false
      });
    }

    // Get IP and user agent for consent tracking
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    // Record terms of service consent
    await User.createConsent(userId, {
      consent_type: 'terms_of_service',
      is_accepted: true,
      ip_address,
      user_agent
    });

    // Record privacy policy consent
    await User.createConsent(userId, {
      consent_type: 'privacy_policy',
      is_accepted: true,
      ip_address,
      user_agent
    });

    // Record age verification consent
    await User.createConsent(userId, {
      consent_type: 'age_verification',
      is_accepted: true,
      ip_address,
      user_agent
    });

    // Record marketing consent if opted in
    if (marketing_emails) {
      await User.createConsent(userId, {
        consent_type: 'marketing_emails',
        is_accepted: true,
        ip_address,
        user_agent
      });
    }

    // Generate JWT token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        first_name,
        last_name,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};