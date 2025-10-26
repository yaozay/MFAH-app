// backend/src/routes/employees.js
import { Router } from "express";
import { pool } from "../db.js";


const router = Router();

// helpers
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phoneRe = /^\d{10}$/;
const ROLES = new Set(["curator", "manager", "security", "guide"]);

function clean(val) {
  return val === undefined ? null : val;
}

// GET /api/employees/:id  -> return single employee
router.get("/:id", /* requireAuth, requireAnyRole(["admin","employee"]), */ async (req, res) => {
  const id = Number(req.params.id || 0);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.employee_role,
        e.hire_date,
        e.department_id
      FROM Employees e
      WHERE e.employee_id = ?
      `,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /employees/:id error:", err);
    res.status(500).json({ error: "Failed to load employee" });
  }
});

// POST /api/employees  -> create
router.post("/", /* requireAuth, requireAnyRole(["admin"]), */ async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email = null,
      phone = null,
      employee_role = null,
      department_id = null,
      hire_date = null,
    } = req.body || {};

    // basic validation
    if (!first_name?.trim()) return res.status(400).json({ error: "first_name is required" });
    if (!last_name?.trim()) return res.status(400).json({ error: "last_name is required" });
    if (email && !emailRe.test(email)) return res.status(400).json({ error: "Invalid email" });
    if (phone && !phoneRe.test(String(phone))) return res.status(400).json({ error: "Phone must be 10 digits" });
    if (employee_role && !ROLES.has(employee_role)) return res.status(400).json({ error: "Invalid role" });

    const [result] = await pool.query(
      `
      INSERT INTO Employees
        (first_name, last_name, email, phone, employee_role, department_id, hire_date)
      VALUES (?,?,?,?,?,?,?)
      `,
      [
        first_name.trim(),
        last_name.trim(),
        clean(email),
        clean(phone),
        clean(employee_role),
        department_id ? Number(department_id) : null,
        hire_date || null,
      ]
    );

    const newId = result.insertId;
    res.status(201).json({ employee_id: newId });
  } catch (err) {
    console.error("POST /employees error:", err);
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// PUT /api/employees/:id  -> update
router.put("/:id", /* requireAuth, requireAnyRole(["admin"]), */ async (req, res) => {
  const id = Number(req.params.id || 0);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const {
      first_name,
      last_name,
      email = null,
      phone = null,
      employee_role = null,
      department_id = null,
      hire_date = null,
    } = req.body || {};

    if (!first_name?.trim()) return res.status(400).json({ error: "first_name is required" });
    if (!last_name?.trim()) return res.status(400).json({ error: "last_name is required" });
    if (email && !emailRe.test(email)) return res.status(400).json({ error: "Invalid email" });
    if (phone && !phoneRe.test(String(phone))) return res.status(400).json({ error: "Phone must be 10 digits" });
    if (employee_role && !ROLES.has(employee_role)) return res.status(400).json({ error: "Invalid role" });

    const [result] = await pool.query(
      `
      UPDATE Employees
      SET first_name = ?, last_name = ?, email = ?, phone = ?, employee_role = ?, department_id = ?, hire_date = ?
      WHERE employee_id = ?
      `,
      [
        first_name.trim(),
        last_name.trim(),
        clean(email),
        clean(phone),
        clean(employee_role),
        department_id ? Number(department_id) : null,
        hire_date || null,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("PUT /employees/:id error:", err);
    res.status(500).json({ error: "Failed to update employee" });
  }
});

// DELETE /api/employees/:id  -> delete
router.delete("/:id", /* requireAuth, requireAnyRole(["admin"]), */ async (req, res) => {
  const id = Number(req.params.id || 0);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [result] = await pool.query(`DELETE FROM Employees WHERE employee_id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /employees/:id error:", err);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

export default router;
