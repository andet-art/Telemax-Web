// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,  // Changed from DB_PASSWORD to DB_PASS
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONN_LIMIT || 10,
  queueLimit: process.env.DB_QUEUE_LIMIT || 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('✓ Database connected successfully to', process.env.DB_NAME);
  connection.release();
});

module.exports = promisePool;