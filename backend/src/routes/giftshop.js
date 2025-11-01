import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT product_id, sku, name, category, price, quantity, active, image_url
      FROM Shop_Products
      WHERE active = TRUE
      ORDER BY name ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching shop products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


router.post("/", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { sku, name, category, price, quantity, active = true, image_url } = req.body;

  if (!name || price == null)
    return res.status(400).json({ error: "Name and price are required." });

  try {
    const [result] = await pool.query(
      `
        INSERT INTO Shop_Products (sku, name, category, price, quantity, active, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [sku, name, category, price, quantity || 0, active, image_url]
    );

    res.status(201).json({ message: "Product added", id: result.insertId });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
}
);

router.put("/:id", requireAuth, requireAnyRole(["admin", "employee"]),
  async (req, res) => {
    const { id } = req.params;
    const { sku, name, category, price, quantity, image_url, active = true } =
      req.body;

    try {
      const [result] = await pool.query(
        `
          UPDATE Shop_Products
          SET sku = ?, name = ?, category = ?, price = ?, quantity = ?, image_url = ?, active = ?
          WHERE product_id = ?
        `,
        [sku, name, category, price, quantity, image_url, active, id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Product not found" });

      res.json({ message: "Product updated" });
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


router.delete("/:id", requireAuth, requireAnyRole(["admin", "employee"]), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM Shop_Products WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
);

export default router;
