import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.user_id ?? req.user?.id ?? null;


    let visitorId = req.user?.visitor_id ?? null;

    if (!visitorId && userId) {
      const [[userRow]] = await pool.query(
        "SELECT email, first_name, last_name FROM Users WHERE user_id = ?",
        [userId]
      );

      if (userRow) {
        const [existingVisitor] = await pool.query(
          "SELECT visitor_id FROM Visitors WHERE email = ? LIMIT 1",
          [userRow.email]
        );

        if (existingVisitor.length > 0) {
          visitorId = existingVisitor[0].visitor_id;
        }
      }
    }

    if (!userId && !visitorId) {
      return res.status(400).json({ message: "Missing user identity." });
    }


    const [memberships] = await pool.query(
      `SELECT 
          'membership' AS type,
          mr.records_id AS id,
          mt.name AS name,
          mr.start_date,
          mr.end_date,
          mr.status,
          mr.price_at_purchase AS price,
          mr.created_at
        FROM Membership_records mr
        JOIN Membership_Types mt ON mt.plan_id = mr.plan_id
        WHERE (mr.user_id = ? OR mr.visitor_id = ?)
        ORDER BY mr.created_at DESC`,
      [userId, visitorId]
    );

    const [giftshop] = await pool.query(
      `SELECT
          'giftshop' AS type,
          gt.transaction_id AS id,
          p.name,
          p.image_url,
          gt.quantity,
          gt.total_price AS price,
          gt.sale_date AS created_at
        FROM Gift_Shop_Transactions gt
        JOIN Shop_Products p ON p.product_id = gt.product_id
        WHERE (gt.visitor_id = ? OR gt.user_id = ?)
        ORDER BY gt.sale_date DESC`,
      [visitorId, userId]
    );

    const [tickets] = await pool.query(
      `SELECT
          'ticket' AS type,
          ts.sale_id AS id,
          tt.name AS name,
          ts.ticket_amount AS quantity,
          ts.purchase_price AS price,
          ts.purchased_date AS created_at,
          ts.visit_date
        FROM Ticket_Sales ts
        JOIN Ticket_Type tt ON tt.ticket_type_id = ts.ticket_type_id
        WHERE (ts.visitor_id = ? OR ts.user_id = ?)
        ORDER BY ts.purchased_date DESC`,
      [visitorId, userId]
    );

    const merged = [...memberships, ...giftshop, ...tickets]
      .filter(Boolean)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(merged);
  } catch (err) {
    console.error("Purchase History Error:", err);
    res.status(500).json({ message: "Failed to load purchase history" });
  }
});

export default router;
