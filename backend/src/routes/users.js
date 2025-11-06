import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = express.Router();


router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, first_name, last_name, email, role, created_at, updated_at FROM Users WHERE user_id = ?",
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
      "SELECT user_id, first_name, last_name, email, role, created_at, updated_at FROM Users WHERE user_id = ?",
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

//admin
// Get all users
router.get("/", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, first_name, last_name, email, role, created_at, updated_at FROM Users"
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
    await pool.query(
      "INSERT INTO Users (first_name, last_name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
      [first_name, last_name, email, hash, role || "visitor"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete user
router.delete("/:id", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM Users WHERE user_id = ?", [id]);
  res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
