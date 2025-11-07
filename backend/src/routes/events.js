import express from "express";
import { pool } from "../db.js";

const router = express.Router();

//  Get all events
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        event_id AS id,
        title,
        event_date,
        event_time,
        description,
        venue_id
      FROM Events
      ORDER BY event_date ASC;
    `);

    const events = rows.map((event) => {
      const start = new Date(event.event_date);
      const timeParts = event.event_time
        ? event.event_time.split(":")
        : ["09", "00", "00"];
      start.setHours(Number(timeParts[0]), Number(timeParts[1]));

      const end = new Date(start);
      end.setHours(start.getHours() + 10);

      return {
        id: event.id,
        title: event.title,
        start,
        end,
        description: event.description,
        venue_id: event.venue_id,
      };
    });

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, event_date, event_time, description, venue_id } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: "Title and event_date are required." });
    }

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
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_date, event_time, description, venue_id } = req.body;

    if (!title || !event_date) {
      return res.status(400).json({ error: "Title and event_date are required." });
    }

    const [result] = await pool.query(
      `UPDATE Events
       SET title = ?, event_date = ?, event_time = ?, description = ?, venue_id = ?
       WHERE event_id = ?`,
      [title, event_date, event_time || null, description || null, venue_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM Events WHERE event_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});


export default router;
