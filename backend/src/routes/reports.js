import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

// (A) Report: number of artworks per artist
router.get("/artworks-per-artist", requireAuth, requireAnyRole(["admin","employee"]), async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.artist_id, a.full_name AS artist_name, COUNT(w.artwork_id) AS artwork_count
      FROM Artists a
      LEFT JOIN Artworks w ON a.artist_id = w.artist_id
      GROUP BY a.artist_id, a.full_name
      ORDER BY artwork_count DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/artworks-per-artist error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// (B) Report: artworks created after 1900 (example “modern” filter)
router.get("/modern-artworks", requireAuth, requireAnyRole(["admin","employee"]), async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT title, year_created, art_type, estimated_price
      FROM Artworks
      WHERE year_created >= 1900
      ORDER BY year_created ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/modern-artworks error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

export default router;
