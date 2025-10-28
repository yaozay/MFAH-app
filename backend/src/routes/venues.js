import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        venue_id,
        name,
        location
      FROM Venues
      ORDER BY name ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching venues:", err);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
});

export default router;
