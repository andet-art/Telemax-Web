const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number, 
      date_of_birth, 
      country,
      marketing_emails 
    } = userData;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (
        first_name, last_name, email, password, 
        phone_number, date_of_birth, country, 
        is_18_plus, marketing_emails, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, NOW())
    `;

    const [result] = await db.execute(query, [
      first_name,
      last_name,
      email,
      hashedPassword,
      phone_number || null,
      date_of_birth || null,
      country || null,
      marketing_emails || false
    ]);
    
    return result.insertId;
  }

  static async createAddress(userId, addressData) {
    const {
      address_type = 'both',
      full_address,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      is_default = true
    } = addressData;

    const query = `
      INSERT INTO addresses (
        user_id, address_type, full_address, address_line1,
        address_line2, city, state_province, postal_code,
        country, is_default
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      userId,
      address_type,
      full_address,
      address_line1 || null,
      address_line2 || null,
      city || null,
      state_province || null,
      postal_code || null,
      country || null,
      is_default
    ]);

    return result.insertId;
  }

  static async createConsent(userId, consentData) {
    const { consent_type, is_accepted, ip_address, user_agent } = consentData;

    const query = `
      INSERT INTO user_consents (user_id, consent_type, is_accepted, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      userId,
      consent_type,
      is_accepted,
      ip_address || null,
      user_agent || null
    ]);

    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT 
        id, first_name, last_name, email, phone_number,
        date_of_birth, country, is_active, marketing_emails,
        email_verified_at, created_at, last_login
      FROM users 
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findByIdWithAddresses(id) {
    const userQuery = `
      SELECT 
        id, first_name, last_name, email, phone_number,
        date_of_birth, country, is_active, marketing_emails,
        email_verified_at, created_at, last_login
      FROM users 
      WHERE id = ?
    `;
    
    const addressQuery = `SELECT * FROM addresses WHERE user_id = ?`;

    const [userRows] = await db.execute(userQuery, [id]);
    const [addressRows] = await db.execute(addressQuery, [id]);

    if (userRows[0]) {
      userRows[0].addresses = addressRows;
    }

    return userRows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll() {
    const query = `
      SELECT 
        id, first_name, last_name, email, phone_number,
        country, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async update(id, userData) {
    const { first_name, last_name, email, phone_number, country } = userData;
    const query = `
      UPDATE users 
      SET first_name = ?, last_name = ?, email = ?, phone_number = ?, country = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [
      first_name, 
      last_name, 
      email, 
      phone_number || null, 
      country || null, 
      id
    ]);
    return result.affectedRows;
  }

  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows;
  }

  static async getAddresses(userId) {
    const query = 'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC';
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async getConsents(userId) {
    const query = 'SELECT * FROM user_consents WHERE user_id = ?';
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async updateAddress(userId, addressId, addressData) {
    const {
      address_type,
      full_address,
      address_line1,
      address_line2,
      city,
      state_province,
      postal_code,
      country,
      is_default
    } = addressData;

    const query = `
      UPDATE addresses 
      SET address_type = ?, full_address = ?, address_line1 = ?,
          address_line2 = ?, city = ?, state_province = ?,
          postal_code = ?, country = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await db.execute(query, [
      address_type || 'shipping',
      full_address,
      address_line1 || null,
      address_line2 || null,
      city || null,
      state_province || null,
      postal_code || null,
      country || null,
      is_default || false,
      addressId,
      userId
    ]);

    return result.affectedRows;
  }

  static async deleteAddress(userId, addressId) {
    const query = 'DELETE FROM addresses WHERE id = ? AND user_id = ?';
    const [result] = await db.execute(query, [addressId, userId]);
    return result.affectedRows;
  }

  static async updateMarketingConsent(userId, marketing_emails) {
    const query = 'UPDATE users SET marketing_emails = ? WHERE id = ?';
    const [result] = await db.execute(query, [marketing_emails, userId]);
    return result.affectedRows;
  }
}

module.exports = User;
