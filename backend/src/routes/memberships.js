import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

// PUBLIC — LIST MEMBERSHIP TYPES
router.get("/types", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        mt.plan_id AS plan_id,
        mt.name,
        mt.price,
        mt.discount_amt,
        mt.duration_months,
        mt.people_included,
        mt.description,
        mt.is_active,
        mt.is_featured,
        mt.display_order,
        CASE 
          WHEN mt.plan_id = (
            SELECT plan_id 
            FROM Membership_records 
            GROUP BY plan_id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
          ) THEN 1 
          ELSE 0 
        END AS is_top
      FROM Membership_Types mt
      WHERE mt.is_active = 1
      ORDER BY COALESCE(mt.display_order, 9999), mt.name
    `);

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load membership types" });
  }
});

// CHECK ACTIVE MEMBERSHIP
router.get("/active", requireAuth, async (req, res) => {
  try {
    const visitorId =
      req.user?.visitor_id ??
      req.user?.user_id ??
      req.user?.id;

    const [rows] = await pool.query(
      `SELECT mr.records_id, mr.plan_id, mt.name, mr.start_date, mr.end_date, mr.status, mr.price_at_purchase
       FROM Membership_records mr
       JOIN Membership_Types mt ON mt.plan_id = mr.plan_id
       WHERE mr.visitor_id = ?
         AND mr.status = 'active'
         AND mr.end_date >= CURDATE()
       ORDER BY mr.end_date DESC
       LIMIT 1`,
      [visitorId]
    );

    res.json(rows.length ? rows[0] : null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to check active membership" });
  }
});

// PURCHASE MEMBERSHIP
router.post("/purchase", requireAuth, async (req, res) => {
  const { plan_id } = req.body;

  if (!plan_id) {
    return res.status(400).json({ message: "plan_id required" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const userId = req.user?.user_id ?? req.user?.id ?? null;

    const visitorId = req.user?.visitor_id ?? null;


    if (!userId && !visitorId) {
      await conn.rollback();
      return res.status(400).json({ message: "User or Visitor ID missing" });
    }

    const [active] = await conn.query(
      `SELECT 1 FROM Membership_records
     WHERE status = 'active'
       AND end_date >= CURDATE()
       AND (
            (visitor_id IS NOT NULL AND visitor_id = ?) OR
            (user_id IS NOT NULL AND user_id = ?)
       )
     LIMIT 1`,
      [visitorId || null, userId || null]
    );

    if (active.length) {
      await conn.rollback();
      return res.status(409).json({ message: "You already have an active membership." });
    }

    const [plans] = await conn.query(
      `SELECT plan_id, price, discount_amt, duration_months, is_active
       FROM Membership_Types
       WHERE plan_id = ?`,
      [plan_id]
    );

    if (!plans.length || !plans[0].is_active) {
      await conn.rollback();
      return res.status(400).json({ message: "Invalid or inactive plan." });
    }

    const plan = plans[0];
    const finalPrice = Number(plan.price ?? 0) - Number(plan.discount_amt ?? 0);

    const [insert] = await conn.query(
      `INSERT INTO Membership_records
     (visitor_id, user_id, plan_id, start_date, end_date, status, price_at_purchase, created_at)
   VALUES
     (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? MONTH), 'active', ?, CURDATE())`,
      [
        visitorId || null,
        userId || null,
        plan.plan_id,
        plan.duration_months,
        finalPrice
      ]
    );


    await conn.commit();

    res.status(201).json({
      records_id: insert.insertId,
      plan_id: plan.plan_id,
      start_date: new Date().toISOString().slice(0, 10),
      message: "Membership activated",
    });

  } catch (e) {
    await conn.rollback();
    console.error("Membership Purchase ERROR:", e.sqlMessage || e.message || e);
    res.status(500).json({
      message: e.sqlMessage || e.message || "Purchase failed",
    });
  } finally {
    conn.release();
  }
});

// ADMIN — CREATE MEMBERSHIP TYPE
router.post("/types", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const {
    name, price, discount_amt = 0, duration_months,
    people_included = 1, description = "", is_active = 1,
    is_featured = 0, display_order = null
  } = req.body;

  try {
    const [r] = await pool.query(
      `INSERT INTO Membership_Types
        (name, price, discount_amt, duration_months, people_included,
         description, is_active, is_featured, display_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURDATE())`,
      [name, price, discount_amt, duration_months, people_included,
        description, is_active, is_featured, display_order]
    );

    res.status(201).json({ plan_id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Create failed" });
  }
});

// ADMIN — UPDATE MEMBERSHIP
router.put("/types/:planId", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { planId } = req.params;

  const fields = [
    "name", "price", "discount_amt", "duration_months", "people_included",
    "description", "is_active", "is_featured", "display_order"
  ];

  const sets = [];
  const values = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }

  if (!sets.length) {
    return res.status(400).json({ message: "No updates" });
  }

  try {
    const [r] = await pool.query(
      `UPDATE Membership_Types 
       SET ${sets.join(", ")}, updated_at = CURDATE()
       WHERE plan_id = ?`,
      [...values, planId]
    );

    res.status(200).json({ affected: r.affectedRows });
  } catch (e) {
    console.error("PUT /types/:planId", e);
    res.status(500).json({ message: "Update failed" });
  }
});

// ADMIN — DELETE MEMBERSHIP TYPE
router.delete("/types/:planId", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { planId } = req.params;

  try {
    await pool.query(`DELETE FROM Membership_Types WHERE plan_id = ?`, [planId]);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("DELETE /types/:planId", e);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
