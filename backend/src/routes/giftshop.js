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
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items array required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get user_id from JWT
    const userId = req.user?.sub ?? null;

    // Resolve visitor_id
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

    // Process purchase items
    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity) {
        throw new Error("Each item must include product_id and quantity");
      }

      // Get product info
      const [[p]] = await conn.query(
        "SELECT price, quantity FROM Shop_Products WHERE product_id = ?",
        [product_id]
      );

      if (!p) throw new Error("Product not found");
      if (p.quantity < quantity) throw new Error("Not enough stock");

      const totalPrice = p.price * quantity;

      await conn.query(
        `
          INSERT INTO Gift_Shop_Transactions
            (department_id, visitor_id, product_id, quantity, sale_date, total_price, user_id)
          VALUES
            (5, ?, ?, ?, CURDATE(), ?, ?)
        `,
        [visitorId, product_id, quantity, totalPrice, userId]
      );

      // Update product stock
      await conn.query(
        `
          UPDATE Shop_Products
          SET quantity = quantity - ?
          WHERE product_id = ?
        `,
        [quantity, product_id]
      );
    }

    await conn.commit();
    res.json({ message: "Gift shop purchase complete" });

  } catch (err) {
    await conn.rollback();
    console.error("Gift shop purchase error:", err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});


export default router;
