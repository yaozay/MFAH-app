import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT product_id, sku, name, category, price, quantity, image_url, active, deleted_at
      FROM Shop_Products
      WHERE deleted_at IS NULL
      ORDER BY name ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching shop products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/deleted", requireAuth, requireAnyRole(["admin"]), async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT product_id, sku, name, category, price, quantity, image_url, deleted_at
      FROM Shop_Products
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching deleted shop products:", err);
    res.status(500).json({ error: "Failed to fetch deleted products" });
  }
});

router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { sku, name, category, price, quantity, image_url, supplier_id } = req.body;
  if (!name || price == null)
    return res.status(400).json({ error: "Name and price are required." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await pool.query(
      `
        INSERT INTO Shop_Products (sku, name, category, price, quantity, image_url, active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
      `,
      [sku, name, category, price, quantity || 0, image_url]
    );
    const productId = result.insertId;
    if (supplier_id) {
      await conn.query(
        `INSERT INTO Supplier_Products (supplier_id, product_id) VALUES (?, ?)`,
        [supplier_id, productId]
      );
    }
    await conn.commit();
    res.status(201).json({ message: "Product added", id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  } finally {
    conn.release();
  }
});

router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;
  const { sku, name, category, price, quantity, image_url, active = true, supplier_id } = req.body;

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `
        UPDATE Shop_Products
        SET sku = ?, name = ?, category = ?, price = ?, quantity = ?, image_url = ?, active = ?
        WHERE product_id = ? AND deleted_at IS NULL
      `,
      [sku, name, category, price, quantity, image_url, active, id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Product not found or deleted" });
    }

    await conn.query(`DELETE FROM Supplier_Products WHERE product_id = ?`, [id]);

    if (supplier_id) {
      await conn.query(
        `INSERT INTO Supplier_Products (supplier_id, product_id) VALUES (?, ?)`,
        [supplier_id, id]
      );
    }

    await conn.commit();
    res.json({ message: "Product updated" });

  } catch (err) {
    await conn.rollback();
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});


router.delete("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE Shop_Products SET deleted_at = NOW(), active = FALSE WHERE product_id = ? AND deleted_at IS NULL",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found or already deleted" });

    res.json({ message: "Product soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.patch("/:id/restore", requireAuth, requireAnyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE Shop_Products SET deleted_at = NULL, active = TRUE WHERE product_id = ? AND deleted_at IS NOT NULL",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found or already active" });

    res.json({ message: "Product restored successfully" });
  } catch (err) {
    console.error("Error restoring product:", err);
    res.status(500).json({ error: "Failed to restore product" });
  }
});

router.get("/suppliers", requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT supplier_id, name 
      FROM Suppliers 
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).json({ error: "Failed to load suppliers" });
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

    // FIXED: Always pull user ID from JWT `sub`
    const userId = req.user?.sub ?? null;

    let visitorId = req.user?.visitor_id ?? null;

    // Resolve visitor_id
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

    // Insert tickets
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


export default router;
