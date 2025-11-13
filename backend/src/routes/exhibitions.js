import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();


router.get("/recent", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.exhibition_id, e.title, e.start_date, e.end_date,
        e.venue_id, v.name AS venue_name,
        e.organizer, e.description, e.image_url
      FROM Exhibitions e
      LEFT JOIN Venues v ON e.venue_id = v.venue_id
      WHERE e.end_date >= CURDATE() 
         OR e.start_date >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH)
      ORDER BY e.start_date ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching recent exhibitions:", err);
    res.status(500).json({ error: "Failed to fetch recent exhibitions" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.exhibition_id, e.title, e.start_date, e.end_date,
        e.venue_id, e.organizer, e.description, e.image_url,
        v.name AS venue_name
      FROM Exhibitions e
      LEFT JOIN Venues v ON e.venue_id = v.venue_id
      WHERE e.deleted_at IS NULL
      ORDER BY e.start_date ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching exhibitions:", err);
    res.status(500).json({ error: "Failed to fetch exhibitions" });
  }
});

router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { title, start_date, end_date, venue_id, organizer, description, image_url } = req.body;

  if (!title || !start_date)
    return res.status(400).json({ error: "Title and start date are required." });

  try {
    const [result] = await pool.query(
      `
        INSERT INTO Exhibitions (title, start_date, end_date, venue_id, organizer, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [title, start_date, end_date || null, venue_id || null, organizer || null, description || null, image_url || null]
    );

    res.status(201).json({ message: "Exhibition added", id: result.insertId });
  } catch (err) {
    console.error("Error adding exhibition:", err);
    res.status(500).json({ error: "Failed to add exhibition" });
  }
});

router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, venue_id, organizer, description, image_url } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE Exhibitions
      SET title = ?, start_date = ?, end_date = ?, venue_id = ?, organizer = ?, description = ?, image_url = ?
      WHERE exhibition_id = ? AND deleted_at IS NULL
      `,
      [title, start_date, end_date || null, venue_id || null, organizer || null, description || null, image_url || null, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Exhibition not found or deleted" });

    res.json({ message: "Exhibition updated successfully" });
  } catch (err) {
    console.error("Error updating exhibition:", err);
    res.status(500).json({ error: "Failed to update exhibition" });
  }
});

router.get("/deleted", requireAuth, requireAnyRole(["admin"]), async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.exhibition_id, e.title, e.start_date, e.end_date,
        e.venue_id, v.name AS venue_name,
        e.organizer, e.description, e.image_url, e.deleted_at
      FROM Exhibitions e
      LEFT JOIN Venues v ON e.venue_id = v.venue_id
      WHERE e.deleted_at IS NOT NULL
      ORDER BY e.deleted_at DESC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching deleted exhibitions:", err);
    res.status(500).json({ error: "Failed to fetch deleted exhibitions" });
  }
});

router.delete("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE Exhibitions SET deleted_at = NOW() WHERE exhibition_id = ? AND deleted_at IS NULL",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Exhibition not found or already deleted" });

    res.json({ message: "Exhibition soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting exhibition:", err);
    res.status(500).json({ error: "Failed to delete exhibition" });
  }
});

router.patch("/:id/restore", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE Exhibitions SET deleted_at = NULL WHERE exhibition_id = ? AND deleted_at IS NOT NULL",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Exhibition not found or already active" });

    res.json({ message: "Exhibition restored successfully" });
  } catch (err) {
    console.error("Error restoring exhibition:", err);
    res.status(500).json({ error: "Failed to restore exhibition" });
  }
});

export default router;
