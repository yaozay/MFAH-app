import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = express.Router();

router.get("/public", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.event_id AS id,
        e.title,
        e.event_date,
        e.event_time,
        e.description,
        v.name AS venue_name
      FROM Events e
      LEFT JOIN Venues v ON e.venue_id = v.venue_id
      WHERE e.deleted_at IS NULL
        AND e.approved = 1
      ORDER BY e.event_date ASC;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});


router.get(
  "/",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          e.event_id,
          e.title,
          e.event_date,
          e.event_time,
          e.venue_id,
          v.name AS venue_name,
          e.description,
          e.approved,
          e.deleted_at
        FROM Events e
        LEFT JOIN Venues v ON e.venue_id = v.venue_id
        WHERE e.deleted_at IS NULL
        ORDER BY e.event_date ASC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("Error loading events:", err);
      res.status(500).json({ error: "Failed to load events" });
    }
  }
);

router.post(
  "/",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
    try {
      const { title, event_date, event_time, description, venue_id } = req.body;

      if (!title || !event_date)
        return res.status(400).json({ error: "Title and event_date are required." });

      const [result] = await pool.query(
        `INSERT INTO Events (title, event_date, event_time, description, venue_id)
         VALUES (?, ?, ?, ?, ?)`,
        [title, event_date, event_time || null, description || null, venue_id || null]
      );

      res.status(201).json({ message: "Event created", id: result.insertId });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

router.put("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, event_date, event_time, venue_id, description } = req.body;

  try {

    await pool.query(
      `UPDATE Events 
       SET title = ?, event_date = ?, event_time = ?, venue_id = ?, description = ?, approved = 0
       WHERE event_id = ?`,
      [title, event_date, event_time, venue_id, description, id]
    );

    res.json({ message: "Event updated and sent back to pending approval." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
});


router.delete(
  "/:id",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE Events SET deleted_at = NOW() WHERE event_id = ? AND deleted_at IS NULL",
        [id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Event not found or already deleted" });

      res.json({ message: "Event soft-deleted successfully" });
    } catch (err) {
      console.error("DELETE /events/:id error:", err);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);


router.get(
  "/deleted",
  requireAuth,
  requireAnyRole(["admin"]),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          event_id AS id,
          title,
          event_date,
          event_time,
          description,
          venue_id,
          deleted_at
        FROM Events
        WHERE deleted_at IS NOT NULL
        ORDER BY deleted_at DESC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("GET /events/deleted error:", err);
      res.status(500).json({ error: "Failed to fetch deleted events" });
    }
  }
);


router.patch(
  "/:id/restore",
  requireAuth,
  requireAnyRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE Events SET deleted_at = NULL WHERE event_id = ? AND deleted_at IS NOT NULL",
        [id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Event not found or not deleted" });

      res.json({ message: "Event restored successfully" });
    } catch (err) {
      console.error("PATCH /events/:id/restore error:", err);
      res.status(500).json({ error: "Failed to restore event" });
    }
  }
);


router.patch(
  "/:id/approve",
  requireAuth,
  requireAnyRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        "UPDATE Events SET approved = 1 WHERE event_id = ? AND approved = 0",
        [id]
      );

      if (!result.affectedRows)
        return res.status(400).json({ error: "Event already approved or not found" });

      res.json({ message: "Event approved" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to approve event" });
    }
  }
);


router.get(
  "/pending",
  requireAuth,
  requireAnyRole(["admin"]),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          e.event_id,
          e.title,
          e.event_date,
          e.event_time,
          e.venue_id,
          v.name AS venue_name,
          e.description,
          e.approved
        FROM Events e
        LEFT JOIN Venues v ON e.venue_id = v.venue_id
        WHERE e.approved = 0 AND e.deleted_at IS NULL
        ORDER BY e.event_date ASC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("Error loading pending events:", err);
      res.status(500).json({ error: "Failed to load pending events" });
    }
  }
);


router.patch(
  "/:id/reject",
  requireAuth,
  requireAnyRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [[event]] = await pool.query(
        "SELECT event_id FROM Events WHERE event_id = ? AND deleted_at IS NULL",
        [id]
      );

      if (!event)
        return res.status(404).json({ error: "Event not found" });

      await pool.query(
        "UPDATE Events SET approved = -1 WHERE event_id = ?",
        [id]
      );

      res.json({ success: true, message: "Event rejected" });
    } catch (err) {
      console.error("Reject event error:", err);
      res.status(500).json({ error: "Failed to reject event" });
    }
  }
);

export default router;
