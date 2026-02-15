const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdWithAddresses(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { first_name, last_name, email, phone_number, country } = req.body;

    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    await User.update(userId, {
      first_name,
      last_name,
      email,
      phone_number,
      country
    });

    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await User.getAddresses(userId);

    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const addressData = req.body;

    const addressId = await User.createAddress(userId, addressData);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { id: addressId }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;
    const addressData = req.body;

    const updated = await User.updateAddress(userId, addressId, addressData);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.addressId;

    const deleted = await User.deleteAddress(userId, addressId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getConsents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const consents = await User.getConsents(userId);

    res.json({
      success: true,
      data: consents
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMarketingConsent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { marketing_emails } = req.body;

    await User.updateMarketingConsent(userId, marketing_emails);

    res.json({
      success: true,
      message: 'Marketing preferences updated'
    });
  } catch (error) {
    next(error);
  }
};
