import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

/**
 * Returns detailed revenue report:
 * - ticket sales
 * - membership purchases
 * - gift shop transactions
 */
router.get(
  "/",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
    try {
      const { q, type, start, end } = req.query;

      let conditions = [];
      let params = [];

      if (q) {
        conditions.push(`(customer_name LIKE ? OR item_name LIKE ?)`);
        params.push(`%${q}%`, `%${q}%`);
      }
      if (type) {
        conditions.push(`
          transaction_type COLLATE utf8mb4_0900_ai_ci = ? COLLATE utf8mb4_0900_ai_ci
      `);
        params.push(type);
      }

      if (start) {
        conditions.push(`transaction_date >= ?`);
        params.push(start);
      }

      if (end) {
        conditions.push(`transaction_date <= ?`);
        params.push(end);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      // ⬇ Fetch rows
      const [rows] = await pool.query(
        `
        SELECT 
          transaction_id,
          transaction_type,
          visitor_id,
          customer_name,
          transaction_date,
          item_name,
          quantity,
          unit_price,
          total_amount
        FROM vw_revenue_detailed
        ${whereClause}
        ORDER BY transaction_date DESC;
        `,
        params
      );

      // ⬇ Compute totals
      const totals = {
        tickets: 0,
        memberships: 0,
        giftshop: 0,
        grand_total: 0,
      };

      rows.forEach((r) => {
        const amt = Number(r.total_amount || 0);

        if (r.transaction_type === "ticket") totals.tickets += amt;
        if (r.transaction_type === "membership") totals.memberships += amt;
        if (r.transaction_type === "giftshop") totals.giftshop += amt;

        totals.grand_total += amt;
      });

      res.json({ rows, totals });
    } catch (err) {
      console.error("Error fetching revenue:", err);
      res.status(500).json({ error: "Failed to load revenue" });
    }
  }
);


export default router;
