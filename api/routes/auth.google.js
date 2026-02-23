import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../db.js"; // adjust path if yours differs

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const firstName = payload?.given_name || "";
    const lastName = payload?.family_name || "";
    const googleSub = payload?.sub;

    if (!email || !googleSub) return res.status(401).json({ message: "Invalid Google token" });
    if (!emailVerified) return res.status(401).json({ message: "Google email not verified" });

    const [rows] = await pool.execute(
      "SELECT id, first_name, last_name, email, provider, google_sub FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    let user = rows[0];

    if (!user) {
      const [result] = await pool.execute(
        `INSERT INTO users
         (first_name, last_name, email, password, provider, google_sub, is_verified, email_verified_at, last_login, is_active, marketing_emails, is_18_plus)
         VALUES (?, ?, ?, NULL, 'google', ?, 1, NOW(), NOW(), 1, 0, 1)`,
        [firstName, lastName, email, googleSub]
      );

      user = { id: result.insertId, first_name: firstName, last_name: lastName, email };
    } else {
      if (!user.google_sub) {
        await pool.execute(
          "UPDATE users SET google_sub = ?, provider = 'google', is_verified = 1, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = ?",
          [googleSub, user.id]
        );
      }
      await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return res.json({
      token,
      user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email },
    });
  } catch (err) {
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

export default router;