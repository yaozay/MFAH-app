import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = express.Router();


router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, first_name, last_name, email, role, is_active, created_at, updated_at FROM Users WHERE user_id = ?",
    [req.user.sub]
  );
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json(rows[0]);
});

router.patch("/me", requireAuth, async (req, res) => {
  const { first_name = "", last_name = "" } = req.body || {};
  try {
    await pool.query(
      "UPDATE Users SET first_name = ?, last_name = ?, updated_at = NOW() WHERE user_id = ?",
      [first_name.trim(), last_name.trim(), req.user.user_id]
    );
    const [rows] = await pool.query(
      "SELECT user_id, first_name, last_name, email, role, is_active, created_at, updated_at FROM Users WHERE user_id = ?",
      [req.user.user_id]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// change my password
router.post("/me/password", requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password)
    return res.status(400).json({ error: "Missing fields" });
  if (String(new_password).length < 8)
    return res.status(400).json({ error: "New password must be at least 8 characters" });

  try {
    const [[row]] = await pool.query(
      "SELECT password FROM Users WHERE user_id = ?",
      [req.user.user_id]
    );
    if (!row) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(current_password, row.password);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query(
      "UPDATE Users SET password = ?, updated_at = NOW() WHERE user_id = ?",
      [hash, req.user.user_id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to change password" });
  }
});

//admin-------------------



// Get all users
router.get("/", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, first_name, last_name, email, role, is_active, created_at, updated_at FROM Users"
  );
  res.json(rows);
});

// Add a new user
router.post("/", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email or password" });
  try {
    const hash = await bcrypt.hash(password, 10);
    //capture insertId and return it to caller
    const [result] = await pool.query(
      "INSERT INTO Users (first_name, last_name, email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())",
      [first_name, last_name, email, hash, role || "visitor"]
    );
    //include user_id in response
    res.json({ success: true, user_id: result.insertId });
  } catch (err) {
    console.error(err);
    // optional: duplicate email check
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// general update route for admins to edit user profile fields
router.patch("/:id", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    role,
    is_active, // optional; if provided, must be 0 or 1
  } = req.body || {};

  // Build dynamic SET clause safely
  const fields = [];
  const vals = [];

  if (first_name !== undefined) {
    fields.push("first_name = ?");
    vals.push(String(first_name).trim());
  }
  if (last_name !== undefined) {
    fields.push("last_name = ?");
    vals.push(String(last_name).trim());
  }
  if (email !== undefined) {
    fields.push("email = ?");
    vals.push(String(email).trim());
  }
  if (role !== undefined) {
    // Simple server-side guard
    const allowed = new Set(["admin", "employee", "visitor"]);
    if (!allowed.has(role)) return res.status(400).json({ error: "Invalid role" });
    fields.push("role = ?");
    vals.push(role);
  }
  if (is_active !== undefined) {
    if (!(is_active === 0 || is_active === 1)) {
      return res.status(400).json({ error: "is_active must be 0 or 1" });
    }
    fields.push("is_active = ?");
    vals.push(is_active);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No updatable fields provided" });
  }

  fields.push("updated_at = NOW()");
  const sql = `UPDATE Users SET ${fields.join(", ")} WHERE user_id = ?`;
  vals.push(id);

  try {
    const [result] = await pool.query(sql, vals);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

// New route to toggle is_active (enable/disable)
router.patch("/:id/active", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body || {};

  if (is_active !== 0 && is_active !== 1) {
    return res.status(400).json({ error: "is_active must be 0 or 1" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Users SET is_active = ?, updated_at = NOW() WHERE user_id = ?",
      [is_active, id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

export default router;
