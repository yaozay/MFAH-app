import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT artist_id, full_name, birth_year, death_year, nationality, bio
      FROM Artists
      WHERE deleted_at IS NULL
      ORDER BY full_name;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /artists error:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
});

router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { full_name, birth_year, death_year, nationality, bio } = req.body || {};

    if (!full_name) {
      return res.status(400).json({ error: "Full name is required" });
    }

    await pool.execute(
      `INSERT INTO Artists (full_name, birth_year, death_year, nationality, bio)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name.trim(), birth_year ?? null, death_year ?? null, nationality ?? null, bio ?? null]
    );

    res.status(201).json({ message: "Artist created successfully" });
  } catch (err) {
    console.error("POST /artists error:", err);
    res.status(500).json({ error: "Failed to create artist" });
  }
});

router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, birth_year, death_year, nationality, bio } = req.body || {};

    await pool.execute(
      `UPDATE Artists
       SET full_name = ?, birth_year = ?, death_year = ?, nationality = ?, bio = ?
       WHERE artist_id = ? AND deleted_at IS NULL`,
      [full_name, birth_year ?? null, death_year ?? null, nationality ?? null, bio ?? null, id]
    );

    res.json({ message: "Artist updated successfully" });
  } catch (err) {
    console.error("PUT /artists/:id error:", err);
    res.status(500).json({ error: "Failed to update artist" });
  }
});

router.delete("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      `UPDATE Artists SET deleted_at = NOW() WHERE artist_id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artist not found or already deleted" });
    }

    res.json({ message: "Artist deleted successfully" });
  } catch (err) {
    console.error("DELETE /artists/:id error:", err);
    res.status(500).json({ error: "Failed to delete artist" });
  }
});

router.get("/deleted", requireAuth, requireAnyRole(["admin"]), async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT artist_id, full_name, birth_year, death_year, nationality, bio, deleted_at
      FROM Artists
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /artists/deleted error:", err);
    res.status(500).json({ error: "Failed to fetch deleted artists" });
  }
});

router.patch("/:id/restore", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      `UPDATE Artists SET deleted_at = NULL WHERE artist_id = ? AND deleted_at IS NOT NULL`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Artist not found or not deleted" });
    }

    res.json({ message: "Artist restored successfully" });
  } catch (err) {
    console.error("PATCH /artists/:id/restore error:", err);
    res.status(500).json({ error: "Failed to restore artist" });
  }
});

export default router;
