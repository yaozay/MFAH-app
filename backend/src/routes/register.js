import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = Router();


router.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // sanitize role
    const allowed = ["admin", "employee", "visitor"];
    const finalRole = allowed.includes(role) ? role : "visitor";

    // check duplicate
    const [existing] = await pool.execute(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 11);

    await pool.execute(
      `INSERT INTO Users (email, password, role, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [email, hash, finalRole, first_name || null, last_name || null]
    );

    const [rows] = await pool.execute(
      "SELECT user_id, email, role, first_name, last_name, created_at, updated_at FROM Users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    return res.status(201).json({ user });
  } catch (e) {
    console.error("register error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
