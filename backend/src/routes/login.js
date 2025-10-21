import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "7d";


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [rows] = await pool.execute(
      "SELECT user_id, email, password, role, first_name, last_name FROM Users WHERE email = ?",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const dbUser = rows[0];

    const ok = await bcrypt.compare(password, dbUser.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const payload = {
      sub: dbUser.user_id,
      email: dbUser.email,
      role: dbUser.role, // 'admin' | 'employee' | 'visitor'
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });

    return res.json({
      accessToken,
      user: {
        user_id: dbUser.user_id,
        email: dbUser.email,
        role: dbUser.role,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
      },
    });
  } catch (e) {
    console.error("login error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/me", requireAuth, async (req, res) => {
  // req.user is set by requireAuth
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, async (req, res) => {
  res.status(204).end();
});

router.get(
  "/protected/admin-or-employee",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  (req, res) => {
    res.json({ ok: true, message: `Hello ${req.user.role}` });
  }
);

export default router;
