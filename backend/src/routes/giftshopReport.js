import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireAnyRole(["admin", "employee"]),
  async (req, res) => {
    try {
      const { start, end, product_id } = req.query;

      const filters = [];
      const params = [];

      if (start) {
        filters.push("t.sale_date >= ?");
        params.push(start);
      }

      if (end) {
        filters.push("t.sale_date <= ?");
        params.push(end);
      }

      if (product_id) {
        filters.push("t.product_id = ?");
        params.push(product_id);
      }

      const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      const [rows] = await pool.query(
        `
        SELECT
          t.transaction_id,
          t.sale_date,
          t.total_price,
          t.quantity,
          CASE 
            WHEN t.quantity > 0 THEN t.total_price / t.quantity
            ELSE 0
          END AS unit_price,
          p.name AS product_name,
          s.supplier_id,
          s.name AS supplier_name
        FROM Gift_Shop_Transactions t
        JOIN Shop_Products p 
          ON t.product_id = p.product_id
        LEFT JOIN Supplier_Products sp 
          ON p.product_id = sp.product_id
        LEFT JOIN Suppliers s 
          ON sp.supplier_id = s.supplier_id
        ${where}
        ORDER BY t.sale_date DESC;
        `,
        params
      );

      if (!rows.length) {
        return res.json({
          summary: {
            totalRevenue: 0,
            totalTransactions: 0,
            productsSold: 0,
            bestGrossingItem: null,
            worstGrossingItem: null,
            mostSoldItem: null,
            leastSoldItem: null,
            bestSupplier: null,
            worstSupplier: null,
            mostSoldSupplier: null,
            leastSoldSupplier: null,
          },
          results: [],
        });
      }

      // ================================
      // Summary calculations
      // ================================
      const totalRevenue = rows.reduce(
        (sum, r) => sum + Number(r.total_price || 0),
        0
      );

      const totalTransactions = rows.length;

      const productsSold = rows.reduce(
        (sum, r) => sum + Number(r.quantity || 0),
        0
      );

      // Revenue & quantity by product
      const revenueByProduct = {};
      const quantityByProduct = {};

      // Revenue & quantity by supplier
      const revenueBySupplier = {};
      const quantityBySupplier = {};

      for (const r of rows) {
        const unitPrice = Number(r.unit_price || 0);
        const qty = Number(r.quantity || 0);
        const productName = r.product_name || "Unknown Product";
        const supplierName = r.supplier_name || "Unknown Supplier";

        // Product revenue/quantity
        revenueByProduct[productName] =
          (revenueByProduct[productName] || 0) + unitPrice * qty;

        quantityByProduct[productName] =
          (quantityByProduct[productName] || 0) + qty;

        // Supplier revenue/quantity
        revenueBySupplier[supplierName] =
          (revenueBySupplier[supplierName] || 0) + unitPrice * qty;

        quantityBySupplier[supplierName] =
          (quantityBySupplier[supplierName] || 0) + qty;
      }


      const sortedRevenue = Object.entries(revenueByProduct).sort(
        (a, b) => b[1] - a[1]
      );
      const sortedQuantity = Object.entries(quantityByProduct).sort(
        (a, b) => b[1] - a[1]
      );

      const sortedSupplierRevenue = Object.entries(revenueBySupplier).sort(
        (a, b) => b[1] - a[1]
      );
      const sortedSupplierQuantity = Object.entries(quantityBySupplier).sort(
        (a, b) => b[1] - a[1]
      );

      res.json({
        summary: {
          totalRevenue,
          totalTransactions,
          productsSold,
          bestGrossingItem: sortedRevenue[0] || null,
          worstGrossingItem: sortedRevenue.length
            ? sortedRevenue[sortedRevenue.length - 1]
            : null,
          mostSoldItem: sortedQuantity[0] || null,
          leastSoldItem: sortedQuantity.length
            ? sortedQuantity[sortedQuantity.length - 1]
            : null,

          bestSupplier: sortedSupplierRevenue[0] || null,
          worstSupplier: sortedSupplierRevenue.length
            ? sortedSupplierRevenue[sortedSupplierRevenue.length - 1]
            : null,
          mostSoldSupplier: sortedSupplierQuantity[0] || null,
          leastSoldSupplier: sortedSupplierQuantity.length
            ? sortedSupplierQuantity[sortedSupplierQuantity.length - 1]
            : null,
        },
        results: rows,
      });
    } catch (err) {
      console.error("Error fetching giftshop report:", err);
      res.status(500).json({ error: "Failed to fetch giftshop report" });
    }
  }
);

export default router;
