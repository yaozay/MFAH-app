import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

// (A) LIST — any authenticated role can view
router.get("/", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
         aw.artwork_id,
         aw.title,
         aw.artist_id,
         ar.full_name AS artist_name,
         aw.year_created,
         aw.art_type,
         aw.acquisition_date,
         aw.estimated_price
       FROM Artworks aw
       LEFT JOIN Artists ar ON aw.artist_id = ar.artist_id
       ORDER BY aw.title`
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /artworks error:", err);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

// (B) CREATE — admin + employee
router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const {
      title,
      artist_id = null,
      year_created = null,
      art_type = null,
      acquisition_date = null,
      estimated_price = null,
    } = req.body || {};

    if (!title) return res.status(400).json({ error: "Title is required" });

    await pool.execute(
      `INSERT INTO Artworks
         (title, artist_id, year_created, art_type, acquisition_date, estimated_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artist_id || null, year_created || null, art_type || null, acquisition_date || null, estimated_price || null]
    );

    res.status(201).json({ message: "Artwork created" });
  } catch (err) {
    console.error("POST /artworks error:", err);
    res.status(500).json({ error: "Failed to create artwork" });
  }
});

// (C) UPDATE — admin + employee
router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      artist_id = null,
      year_created = null,
      art_type = null,
      acquisition_date = null,
      estimated_price = null,
    } = req.body || {};

    if (!title) return res.status(400).json({ error: "Title is required" });

    await pool.execute(
      `UPDATE Artworks
       SET title=?, artist_id=?, year_created=?, art_type=?, acquisition_date=?, estimated_price=?
       WHERE artwork_id=?`,
      [title, artist_id, year_created, art_type, acquisition_date, estimated_price, id]
    );

    res.json({ message: "Artwork updated" });
  } catch (err) {
    console.error("PUT /artworks/:id error:", err);
    res.status(500).json({ error: "Failed to update artwork" });
  }
});

// (D) DELETE — admin only
router.delete("/:id", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM Artworks WHERE artwork_id=?", [id]);
    res.json({ message: "Artwork deleted" });
  } catch (err) {
    console.error("DELETE /artworks/:id error:", err);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

export default router;
