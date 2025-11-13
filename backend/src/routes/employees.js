// backend/src/routes/employees.js
import { Router } from "express";
import { pool } from "../db.js";
import bcrypt from "bcryptjs"; // for password hashing

const router = Router();

// helpers
const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const phoneRe = /^\d{10}$/;
const ROLES = new Set(["curator", "manager", "security", "guide"]);
const ACCOUNT_ROLES = new Set(["admin", "employee"]);

function clean(val) {
  return val === undefined ? null : val;
}

//helper to load a user row by id (used to keep email in sync)
async function getUserById(user_id) {
  const [[u]] = await pool.query(
    "SELECT user_id, email, role, is_active FROM Users WHERE user_id = ?",
    [user_id]
  );
  return u || null;
}

//GET /api/employees -> list employees with filters + joined user info
router.get("/", /* requireAuth, requireAnyRole(["admin"]), */ async (req, res) => {
  try {
    const {
      q = "",
      department_id = "",
      role = "",
      sort = "id",
      dir = "asc",
      page = "1",
      pageSize = "1000",
    } = req.query || {};

    const where = [];
    const params = [];

    if (q) {
      where.push(`(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (department_id) {
      where.push(`e.department_id = ?`);
      params.push(Number(department_id));
    }
    if (role) {
      where.push(`e.employee_role = ?`);
      params.push(role);
    }

    const orderBy =
      sort === "first" ? `e.first_name` :
      sort === "last" ? `e.last_name` :
      sort === "role" ? `e.employee_role` :
      sort === "email" ? `e.email` :
      `e.employee_id`;

    const direction = String(dir).toLowerCase() === "desc" ? "DESC" : "ASC";
    const limit = Math.max(1, Number(pageSize) || 1000);
    const offset = Math.max(0, ((Number(page) || 1) - 1) * limit);

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.employee_role,
        e.department_id,
        e.hire_date,
        e.user_id,
        e.SSN,
        e.salary,
        e.date_of_birth,
        e.address,
        u.role AS user_role,
        u.is_active
      FROM Employees e
      LEFT JOIN Users u ON u.user_id = e.user_id
      ${whereSql}
      ORDER BY ${orderBy} ${direction}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [[{ cnt }]] = await pool.query(
      `
      SELECT COUNT(*) AS cnt
      FROM Employees e
      LEFT JOIN Users u ON u.user_id = e.user_id
      ${whereSql}
      `,
      params
    );

    res.json({ rows, total: cnt, page: Number(page) || 1, pageSize: limit });
  } catch (err) {
    console.error("GET /employees error:", err);
    res.status(500).json({ error: "Failed to load employees" });
  }
});

//GET /api/employees/:id -> single employee with joined user info
router.get("/:id", /* requireAuth, requireAnyRole(["admin"]), */ async (req, res) => {
  const id = Number(req.params.id || 0);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [[row]] = await pool.query(
      `
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.employee_role,
        e.department_id,
        e.hire_date,
        e.user_id,
        e.SSN,
        e.salary,
        e.date_of_birth,
        e.address,
        u.role AS user_role,
        u.is_active
      FROM Employees e
      LEFT JOIN Users u ON u.user_id = e.user_id
      WHERE e.employee_id = ?
      `,
      [id]
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("GET /employees/:id error:", err);
    res.status(500).json({ error: "Failed to load employee" });
  }
});

// POST /api/employees  -> create (also create linked Users row if needed)
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
      user_id = null,
      ssn = null,              // NOTE: lowercase to match frontend
      salary = null,
      date_of_birth = null,
      address = null,

      // extra fields from EmployeeForm when ADDING
      account_role = "employee",      // "admin" | "employee"
      account_password = null,
    } = req.body || {};

    // basic validation
    if (!first_name?.trim())
      return res.status(400).json({ error: "first_name is required" });
    if (!last_name?.trim())
      return res.status(400).json({ error: "last_name is required" });
    if (email && !emailRe.test(email))
      return res.status(400).json({ error: "Invalid email" });
    if (phone && !phoneRe.test(String(phone)))
      return res.status(400).json({ error: "Phone must be 10 digits" });
    if (employee_role && !ROLES.has(employee_role))
      return res.status(400).json({ error: "Invalid role" });
    if (ssn && !/^\d{9}$/.test(String(ssn)))
      return res.status(400).json({ error: "SSN must be 9 digits" });
    if (salary != null && isNaN(Number(salary)))
      return res.status(400).json({ error: "salary must be a number" });

    let finalEmail = clean(email);
    let finalUserId = user_id ? Number(user_id) : null;
    let createdUserId = null; // track temp user so we can clean up on failure

    // If no user_id is provided, auto-create a linked Users row using account_* fields
    if (!finalUserId) {
      // For new employees, we require email + password to make their login
      if (!finalEmail) {
        return res.status(400).json({
          error: "Email is required when creating a login account for an employee",
        });
      }
      if (!account_password || String(account_password).length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters",
        });
      }

      // Ensure account_role is one of the allowed user roles (admin/employee)
      const roleToUse = ACCOUNT_ROLES.has(account_role)
        ? account_role
        : "employee";

      // Create Users row
      const hash = await bcrypt.hash(String(account_password), 10);
      const [userResult] = await pool.query(
        `
        INSERT INTO Users
          (first_name, last_name, email, password, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        `,
        [
          first_name.trim(),
          last_name.trim(),
          finalEmail,
          hash,
          roleToUse,
        ]
      );

      finalUserId = userResult.insertId;
      createdUserId = finalUserId;
    }

    // If linking to an existing user, enforce email consistency
    if (finalUserId) {
      const userRow = await getUserById(finalUserId);
      if (!userRow)
        return res.status(400).json({ error: "Linked user_id does not exist" });

      if (finalEmail && finalEmail !== userRow.email) {
        return res.status(400).json({
          error: "Employee email must match linked user's email",
        });
      }
      finalEmail = finalEmail || userRow.email;
    }

    if (finalEmail && !emailRe.test(finalEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    try {
      const [result] = await pool.query(
        `
        INSERT INTO Employees
          (first_name, last_name, email, phone, employee_role, department_id,
           hire_date, user_id, SSN, salary, date_of_birth, address)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `,
        [
          first_name.trim(),
          last_name.trim(),
          finalEmail,
          clean(phone),
          clean(employee_role),
          department_id ? Number(department_id) : null,
          hire_date || null,
          finalUserId,
          ssn ? String(ssn) : null,
          salary != null ? Number(salary) : null,
          date_of_birth || null,
          address || null,
        ]
      );

      const newId = result.insertId;
      res.status(201).json({ employee_id: newId, user_id: finalUserId });
    } catch (e) {
      // if employee insert fails, clean up newly-created User so you don't get orphans
      if (createdUserId) {
        try {
          await pool.query("DELETE FROM Users WHERE user_id = ?", [createdUserId]);
        } catch (cleanupErr) {
          console.error("Failed to cleanup user after employee insert error:", cleanupErr);
        }
      }
      throw e;
    }
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
      user_id = undefined,
      ssn = null,
      salary = null,
      date_of_birth = null,
      address = null,
    } = req.body || {};

    if (!first_name?.trim()) return res.status(400).json({ error: "first_name is required" });
    if (!last_name?.trim()) return res.status(400).json({ error: "last_name is required" });
    if (email && !emailRe.test(email)) return res.status(400).json({ error: "Invalid email" });
    if (phone && !phoneRe.test(String(phone))) return res.status(400).json({ error: "Phone must be 10 digits" });
    if (employee_role && !ROLES.has(employee_role)) return res.status(400).json({ error: "Invalid role" });
    if (ssn && !/^\d{9}$/.test(String(ssn))) return res.status(400).json({ error: "SSN must be 9 digits" });
    if (salary != null && isNaN(Number(salary))) return res.status(400).json({ error: "salary must be a number" });

    let finalEmail = clean(email);
    let finalUserIdSqlFragment = "";
    const params = [
      first_name.trim(),
      last_name.trim(),
      // email goes after we compute it
      clean(phone),
      clean(employee_role),
      department_id ? Number(department_id) : null,
      hire_date || null,
      ssn ? String(ssn) : null,
      salary != null ? Number(salary) : null,
      date_of_birth || null,
      address || null,
    ];

    if (user_id !== undefined) {
      const linkId = user_id ? Number(user_id) : null;
      if (linkId) {
        const userRow = await getUserById(linkId);
        if (!userRow) return res.status(400).json({ error: "Linked user_id does not exist" });

        if (finalEmail && finalEmail !== userRow.email) {
          return res.status(400).json({ error: "Employee email must match linked user's email" });
        }
        finalEmail = finalEmail || userRow.email;
      }
      finalUserIdSqlFragment = ", user_id = ?";
    }

    if (finalEmail && !emailRe.test(finalEmail)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const [result] = await pool.query(
      `
      UPDATE Employees
      SET first_name = ?, 
          last_name = ?, 
          email = ?, 
          phone = ?, 
          employee_role = ?, 
          department_id = ?, 
          hire_date = ?,
          SSN = ?, 
          salary = ?, 
          date_of_birth = ?, 
          address = ?
      ${finalUserIdSqlFragment}
      WHERE employee_id = ?
      `,
      user_id !== undefined
        ? [
            ...params.slice(0, 2),
            finalEmail,
            ...params.slice(2),
            user_id ? Number(user_id) : null,
            id,
          ]
        : [
            ...params.slice(0, 2),
            finalEmail,
            ...params.slice(2),
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
