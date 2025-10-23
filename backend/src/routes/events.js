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

    // Convert MySQL date + time into full JS Dates
    const events = rows.map((event) => {
      const start = new Date(event.event_date);
      const timeParts = event.event_time
        ? event.event_time.split(":")
        : ["09", "00", "00"];
      start.setHours(Number(timeParts[0]), Number(timeParts[1]));

      // Default: 2-hour event duration
      const end = new Date(start);
      end.setHours(start.getHours() + 2);

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

export default router;
