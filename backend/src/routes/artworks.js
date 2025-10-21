import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();


router.get("/", requireAuth, async (_req, res) => {
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
});

router.post(
  "/",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
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
      [
        title,
        artist_id || null,
        year_created || null,
        art_type || null,
        acquisition_date || null,     
        estimated_price || null,     
      ]
    );

    res.status(201).json({ message: "Artwork created" });
  }
);

router.put(
  "/:id",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
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
       SET title=?,
           artist_id=?,
           year_created=?,
           art_type=?,
           acquisition_date=?,
           estimated_price=?
       WHERE artwork_id=?`,
      [
        title,
        artist_id || null,
        year_created || null,
        art_type || null,
        acquisition_date || null,
        estimated_price || null,
        id,
      ]
    );

    res.json({ message: "Artwork updated" });
  }
);

// (D) DELETE — admin only
router.delete(
  "/:id",
  requireAuth,
  requireAnyRole(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    await pool.execute("DELETE FROM Artworks WHERE artwork_id=?", [id]);
    res.json({ message: "Artwork deleted" });
  }
);

export default router;
