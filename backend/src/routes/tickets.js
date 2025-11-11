import { Router } from "express";
import { pool } from "../db.js"; 
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

// PUBLIC

// Get all active ticket types
router.get("/types", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ticket_type_id AS id, name, description, total_price, is_active
       FROM Ticket_Type
       WHERE is_active = 1
       ORDER BY name` // Removed 'display_order' from ORDER BY clause
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load ticket types" });
  }
});

// VISITOR

// Get active ticket for the logged-in visitor
router.get("/active", requireAuth, async (req, res) => {
  try {
    const visitorId = req.user.id;
    const [rows] = await pool.query(
      `SELECT tr.ticket_record_id, tr.ticket_type_id, tt.name, tr.purchase_date, tr.expiry_date, tr.status, tr.price_at_purchase
       FROM Ticket_Records tr
       JOIN Ticket_Type tt ON tt.ticket_type_id = tr.ticket_type_id
       WHERE tr.visitor_id = ? 
         AND tr.status = 'active'
         AND tr.expiry_date >= CURDATE()
       ORDER BY tr.expiry_date DESC
       LIMIT 1`,
      [visitorId]
    );
    if (rows.length === 0) return res.json(null);
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to check active ticket" });
  }
});

// Purchase a ticket
router.post("/purchase", requireAuth, async (req, res) => {
  const { ticket_type_id } = req.body;
  if (!ticket_type_id) return res.status(400).json({ message: "ticket_type_id required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const visitorId = req.user.id;

    const [active] = await conn.query(
      `SELECT 1 FROM Ticket_Records
       WHERE visitor_id = ?
         AND status = 'active'
         AND expiry_date >= CURDATE()
       LIMIT 1`,
      [visitorId]
    );
    if (active.length) {
      await conn.rollback();
      return res.status(409).json({ message: "You already have an active ticket." });
    }

    const [ticket] = await conn.query(
      `SELECT ticket_type_id, total_price, is_active
       FROM Ticket_Type WHERE ticket_type_id = ?`,
      [ticket_type_id]
    );
    if (!ticket.length || !ticket[0].is_active) {
      await conn.rollback();
      return res.status(400).json({ message: "Invalid or inactive ticket type." });
    }

    const selectedTicket = ticket[0];
    const finalPrice = selectedTicket.total_price;

    const [insert] = await conn.query(
      `INSERT INTO Ticket_Records
         (visitor_id, ticket_type_id, purchase_date, expiry_date, status, price_at_purchase, created_at)
       VALUES
         (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active', ?, NOW(3))`, // 30-day ticket validity as an example
      [visitorId, selectedTicket.ticket_type_id, finalPrice]
    );

    await conn.commit();

    res.status(201).json({
      ticket_record_id: insert.insertId,
      ticket_type_id: selectedTicket.ticket_type_id,
      purchase_date: new Date().toISOString().slice(0, 10),
      message: "Ticket purchased successfully",
    });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ message: "Purchase failed" });
  } finally {
    conn.release();
  }
});

// ADMIN

// Create a new ticket type
router.post("/types", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { name, description, total_price, is_active = 1 } = req.body;

  try {
    const [r] = await pool.query(
      `INSERT INTO Ticket_Type
        (name, description, total_price, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(3), NOW(3))`,
      [name, description, total_price, is_active]
    );
    res.status(201).json({ ticket_type_id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Create failed" });
  }
});

// Update an existing ticket type
router.put("/types/:ticketTypeId", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { ticketTypeId } = req.params;
  const fields = ["name", "description", "total_price", "is_active"];
  const sets = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (!sets.length) return res.status(400).json({ message: "No updates" });

  try {
    const [r] = await pool.query(
      `UPDATE Ticket_Type SET ${sets.join(", ")}, updated_at = NOW(3)
       WHERE ticket_type_id = ?`,
      [...values, ticketTypeId]
    );
    return res.status(200).json({ affected: r.affectedRows });
  } catch (e) {
    console.error("PUT /types/:ticketTypeId", e);
    return res.status(500).json({ message: "Update failed" });
  }
});

// Delete a ticket type
router.delete("/types/:ticketTypeId", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { ticketTypeId } = req.params;
  try {
    await pool.query(`DELETE FROM Ticket_Type WHERE ticket_type_id = ?`, [ticketTypeId]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("DELETE /types/:ticketTypeId", e);
    return res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
