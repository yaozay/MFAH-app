import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// GET /api/tickets — return all active ticket types
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT ticket_type_id, name, description, total_price, is_active, created_at, updated_at
      FROM Ticket_Type
      WHERE is_active = 1
      ORDER BY name;
    `);
    res.json(rows); // MUST return valid JSON for frontend fetch
  } catch (err) {
    console.error("GET /tickets error:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

export default router;
