import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get("/types", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ticket_type_id AS id, name, description, total_price, is_active
       FROM Ticket_Type
       WHERE is_active = 1
       ORDER BY name`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Failed to load ticket types" });
  }
});

router.get("/active", requireAuth, async (req, res) => {
  try {
    const visitorId = req.user.id;
    const [rows] = await pool.query(
      `SELECT tr.ticket_record_id, tr.ticket_type_id, tt.name,
              tr.purchase_date, tr.expiry_date, tr.status, tr.price_at_purchase
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
    res.status(500).json({ message: "Failed to check active ticket" });
  }
});

router.post("/purchase", requireAuth, async (req, res) => {
  const { tickets } = req.body || {};

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return res.status(400).json({ error: "tickets array required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userId = req.user?.user_id ?? req.user?.id ?? null;
    let visitorId = req.user?.visitor_id ?? null;

    if (!visitorId) {
      const [[userRow]] = await conn.query(
        "SELECT email, first_name, last_name FROM Users WHERE user_id = ?",
        [userId]
      );

      const [existing] = await conn.query(
        "SELECT visitor_id FROM Visitors WHERE email = ? LIMIT 1",
        [userRow.email]
      );

      if (existing.length > 0) {
        visitorId = existing[0].visitor_id;
      } else {
        const [insertV] = await conn.query(
          "INSERT INTO Visitors (first_name, last_name, email) VALUES (?, ?, ?)",
          [userRow.first_name || "", userRow.last_name || "", userRow.email]
        );
        visitorId = insertV.insertId;
      }
    }

    for (const t of tickets) {
      const ticketTypeId = t.ticket_type_id;
      const qty = Number(t.quantity ?? t.amount ?? 1);

      const [[ticketType]] = await conn.query(
        "SELECT total_price FROM Ticket_Type WHERE ticket_type_id = ?",
        [ticketTypeId]
      );

      const totalPrice = Number(ticketType.total_price) * qty;

      await conn.query(
        `INSERT INTO Ticket_Sales
          (visitor_id, user_id, ticket_amount, purchased_date, visit_date, purchase_price, ticket_type_id)
         VALUES (?, ?, ?, CURDATE(), CURDATE(), ?, ?)`,
        [visitorId, userId, qty, totalPrice, ticketTypeId]
      );
    }

    await conn.commit();
    res.json({ message: "Ticket purchase successful" });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

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
    res.status(500).json({ message: "Create failed" });
  }
});

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
    res.status(200).json({ affected: r.affectedRows });
  } catch (e) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/types/:ticketTypeId", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { ticketTypeId } = req.params;
  try {
    await pool.query(
      `DELETE FROM Ticket_Type WHERE ticket_type_id = ?`,
      [ticketTypeId]
    );
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
