import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

// (A) LIST — any authenticated user can view
router.get("/", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT artist_id, full_name, birth_year, death_year, nationality, bio
      FROM Artists
      ORDER BY full_name;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /artists error:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

// (B) CREATE — admin + employee
router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { full_name, birth_year, death_year, nationality, bio } = req.body || {};

    if (!full_name) {
      return res.status(400).json({ error: "Full name is required" });
    }

    console.log("POST /artists body:", req.body); // debug

    await pool.execute(
      `INSERT INTO Artists (full_name, birth_year, death_year, nationality, bio)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, birth_year ?? null, death_year ?? null, nationality ?? null, bio ?? null]
    );

    res.status(201).json({ message: "Artist created successfully" });
  } catch (err) {
    console.error("POST /artists error:", err);
    res.status(500).json({ error: "Failed to create artist" });
  }
});

// (C) UPDATE — admin + employee
router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, birth_year, death_year, nationality, bio } = req.body || {};

    await pool.execute(
      `UPDATE Artists
       SET full_name = ?, birth_year = ?, death_year = ?, nationality = ?, bio = ?
       WHERE artist_id = ?`,
      [full_name, birth_year ?? null, death_year ?? null, nationality ?? null, bio ?? null, id]
    );

    res.json({ message: "Artist updated successfully" });
  } catch (err) {
    console.error("PUT /artists/:id error:", err);
    res.status(500).json({ error: "Failed to update artist" });
  }
});

// (D) DELETE — admin only
router.delete("/:id", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM Artists WHERE artist_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artist not found" });
    }

    res.json({ message: "Artist deleted successfully" });
  } catch (err) {
    console.error("DELETE /artists/:id error:", err);
    res.status(500).json({ error: "Failed to delete artist" });
  }
});

export default router;
