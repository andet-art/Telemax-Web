const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
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
      billing_same_as_shipping,
      marketing_emails,
      terms_accepted,
      privacy_accepted,
      age_verified
    } = req.body;

    if (!terms_accepted || !privacy_accepted || !age_verified) {
      return res.status(400).json({
        success: false,
        message: 'You must accept terms of service, privacy policy, and verify age'
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

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

    if (shipping_address) {
      await User.createAddress(userId, {
        address_type: billing_same_as_shipping ? 'both' : 'shipping',
        full_address: shipping_address,
        country: country
      });
    }

    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    await User.createConsent(userId, {
      consent_type: 'terms_of_service',
      is_accepted: true,
      ip_address,
      user_agent
    });

    await User.createConsent(userId, {
      consent_type: 'privacy_policy',
      is_accepted: true,
      ip_address,
      user_agent
    });

    await User.createConsent(userId, {
      consent_type: 'age_verification',
      is_accepted: true,
      ip_address,
      user_agent
    });

    if (marketing_emails) {
      await User.createConsent(userId, {
        consent_type: 'marketing_emails',
        is_accepted: true,
        ip_address,
        user_agent
      });
    }

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

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await User.updateLastLogin(user.id);

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
    next(error);
  }
};
