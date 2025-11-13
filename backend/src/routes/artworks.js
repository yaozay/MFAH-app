import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [artworks] = await pool.execute(
      `SELECT 
        aw.artwork_id,
        aw.title,
        aw.artist_id,
        ar.full_name AS artist_name,
        aw.year_created,
        aw.art_type,
        aw.acquisition_date,
        aw.estimated_price,
        aw.image_url,
        c.collection_id,
        c.collection_name
      FROM Artworks aw
      LEFT JOIN Artists ar ON aw.artist_id = ar.artist_id
      LEFT JOIN Collection_Artworks ca ON aw.artwork_id = ca.artwork_id
      LEFT JOIN Collections c ON ca.collection_id = c.collection_id
      WHERE aw.deleted_at IS NULL
      ORDER BY aw.title`
    );
    const [artists] = await pool.execute(
      `SELECT artist_id, full_name FROM Artists WHERE deleted_at IS NULL`
    );

    const [collections] = await pool.execute(
      `SELECT collection_id, collection_name FROM Collections`
    );

    res.json({
      artworks,         
      artists,          
      collections        
    });

  } catch (err) {
    console.error("GET /artworks error:", err);
    res.status(500).json({ error: "Failed to fetch artworks" });
  }
});

router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      title,
      artist_id = null,
      year_created = null,
      art_type = null,
      acquisition_date = null,
      estimated_price = null,
      image_url = null,
      collection_id 
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!collection_id)                
      return res.status(400).json({ error: "Collection is required" });

    await conn.beginTransaction(); 

    const [result] = await conn.execute(
      `INSERT INTO Artworks
        (title, artist_id, year_created, art_type, acquisition_date, estimated_price, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, artist_id, year_created, art_type, acquisition_date, estimated_price, image_url]
    );

    const artworkId = result.insertId;

    await conn.execute(                 
      `INSERT INTO Collection_Artworks (collection_id, artwork_id)
       VALUES (?, ?)`,
      [collection_id, artworkId]
    );

    await conn.commit();  

    res.status(201).json({ message: "Artwork created", id: result.insertId });
  } catch (err) {
    await conn.rollback();              
    console.error("POST /artworks error:", err);

    if (err.sqlState === "45000") {
      return res.status(400).json({ error: err.sqlMessage });
    }

    res.status(500).json({ error: "Failed to create artwork" });
  }finally {
    conn.release();                    
  }
});

router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      title,
      artist_id = null,
      year_created = null,
      art_type = null,
      acquisition_date = null,
      estimated_price = null,
      image_url = null,
      collection_id 
    } = req.body || {};

    if (!title) return res.status(400).json({ error: "Title is required" });
    
    if (!collection_id)                 
      return res.status(400).json({ error: "Collection is required" });

    await conn.beginTransaction();

    await conn.execute(
      `UPDATE Artworks
         SET title=?, artist_id=?, year_created=?, art_type=?, acquisition_date=?, estimated_price=?, image_url=?
       WHERE artwork_id=? AND deleted_at IS NULL`,
      [title, artist_id, year_created, art_type, acquisition_date, estimated_price, image_url, id]
    );
    await conn.execute(
      `INSERT INTO Collection_Artworks (artwork_id, collection_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE collection_id = VALUES(collection_id)`,
      [id, collection_id]
    );
    
     await conn.commit();  

    res.json({ message: "Artwork updated" });
  } catch (err) {
    await conn.rollback();
    console.error("PUT /artworks/:id error:", err);
    res.status(500).json({ error: "Failed to update artwork" });
  }finally {
    conn.release();                    
  }
});

router.delete("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE Artworks SET deleted_at = NOW() WHERE artwork_id = ?", [id]);
    res.json({ message: "Artwork deleted" });
  } catch (err) {
    console.error("DELETE /artworks/:id error:", err);
    res.status(500).json({ error: "Failed to delete artwork" });
  }
});

router.get("/deleted", requireAuth, requireAnyRole(["admin"]), async (_req, res) => {
  try {
    const [artworks] = await pool.execute(
      `SELECT 
         aw.artwork_id,
         aw.title,
         ar.full_name AS artist_name,
         aw.year_created,
         aw.art_type,
         aw.acquisition_date,
         aw.estimated_price,
         aw.deleted_at
       FROM Artworks aw
       LEFT JOIN Artists ar ON aw.artist_id = ar.artist_id
       WHERE aw.deleted_at IS NOT NULL
       ORDER BY aw.deleted_at DESC`
    );
    res.json(artworks); 
  } catch (err) {
    console.error("GET /artworks/deleted error:", err);
    res.status(500).json({ error: "Failed to fetch deleted artworks" });
  }
});

router.patch("/:id/restore", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      "UPDATE Artworks SET deleted_at = NULL WHERE artwork_id = ?",
      [id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Artwork not found or not deleted" });

    res.json({ message: "Artwork restored successfully" });
  } catch (err) {
    console.error("PATCH /artworks/:id/restore error:", err);
    res.status(500).json({ error: "Failed to restore artwork" });
  }
});

export default router;
