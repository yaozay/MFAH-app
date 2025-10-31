import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = express.Router();

//  Get all users 
router.get("/", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const [rows] = await pool.query(
    "SELECT user_id, first_name, last_name, email, role, created_at, updated_at FROM Users"
  );
  res.json(rows);
});

//  Add a new user
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
