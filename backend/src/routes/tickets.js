import { Router } from "express";
import { pool } from "../db.js";


const router = Router();


router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT ticket_type_id, name, description, total_price, is_active, created_at, updated_at
      FROM Ticket_Type
      WHERE is_active = 1
      ORDER BY name;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /tickets error:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

//from here on, admins only

// get all data)
router.get("/all", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT ticket_type_id, name, description, total_price, is_active, created_at, updated_at
      FROM Ticket_Type
      ORDER BY name;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /tickets/all error:", err);
    res.status(500).json({ error: "Failed to fetch ticket types" });
  }
});

// add ticket_type
router.post("/", async (req, res) => {
  const { name, description, total_price } = req.body;
  if (!name || !total_price) return res.status(400).json({ error: "Name and price required" });

  try {
    await pool.execute(`
      INSERT INTO Ticket_Type (name, description, total_price, is_active)
      VALUES (?, ?, ?, 1)
    `, [name, description || "", total_price]);

    res.json({ success: true });
  } catch (err) {
    console.error("POST /tickets error:", err);
    res.status(500).json({ error: "Failed to create ticket type" });
  }
});

// update ticket_type
router.put("/:id", async (req, res) => {
  const { name, description, total_price, is_active } = req.body;
  try {
    await pool.execute(`
      UPDATE Ticket_Type
      SET name=?, description=?, total_price=?, is_active=?, updated_at=NOW()
      WHERE ticket_type_id=?
    `, [name, description || "", total_price, is_active, req.params.id]);

    res.json({ success: true });
  } catch (err) {
    console.error("PUT /tickets error:", err);
    res.status(500).json({ error: "Failed to update ticket type" });
  }
});

// delete ticket_type (or set inactive)
router.delete("/:id", async (req, res) => {
  try {
    await pool.execute(`DELETE FROM Ticket_Type WHERE ticket_type_id=?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /tickets error:", err);
    res.status(500).json({ error: "Failed to delete ticket type" });
  }
});

export default router;
