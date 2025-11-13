import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../utils/requireAuth.js";
import { requireAnyRole } from "../utils/authorize.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireAnyRole(["employee", "admin"]),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT n.notification_id, n.message, n.created_at, n.is_read,
               p.name AS product_name
        FROM Notifications n
        LEFT JOIN Shop_Products p ON n.product_id = p.product_id
        WHERE n.type = 'low_stock'
        ORDER BY n.created_at DESC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  }
);


router.patch("/:id/read", requireAuth, requireAnyRole(["employee", "admin"]), async (req, res) => {
  const notificationId = req.params.id;

  try {
    const [[notif]] = await pool.query(
      "SELECT product_id FROM Notifications WHERE notification_id = ?",
      [notificationId]
    );
    if (!notif) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const [[prod]] = await pool.query(
      "SELECT quantity, name FROM Shop_Products WHERE product_id = ?",
      [notif.product_id]
    );
    if (!prod) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (prod.quantity <= 5) {
      return res.status(400).json({
        error: `Cannot resolve alert. "${prod.name}" still has low stock (${prod.quantity} left).`,
      });
    }

    const [result] = await pool.query(
      "UPDATE Notifications SET is_read = TRUE WHERE notification_id = ?",
      [notificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: `Alert resolved for "${prod.name}"` });
  } catch (err) {
    console.error("Error resolving notification:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});


export default router;
