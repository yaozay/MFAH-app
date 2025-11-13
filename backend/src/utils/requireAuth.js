import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.user_id;

    // Look up the user (to check is_active)
    const [rows] = await pool.query(
      "SELECT user_id, email, role, is_active FROM Users WHERE user_id = ?",
      [userId]
    );
    const dbUser = rows[0];
    if (!dbUser) return res.status(401).json({ error: "User not found" });

    // Block inactive accounts
    if (dbUser.is_active === 0) return res.status(403).json({ error: "Account is inactive" });

    req.user = 
    { 
      sub: dbUser.user_id, 
      user_id: dbUser.user_id, 
      email: dbUser.email, 
      role: dbUser.role 
    };
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
