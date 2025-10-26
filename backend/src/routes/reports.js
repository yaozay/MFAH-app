import { Router } from "express";
import { pool } from "../db.js";
//import { requireAuth } from "../utils/requireAuth.js";
//import { requireAnyRole } from "../utils/authorize.js";

import { stringify } from "csv-stringify/sync"; // npm i csv-stringify


const router = Router();

// (A) Report: number of artworks per artist
router.get("/artworks-per-artist"/*, requireAuth, requireAnyRole(["admin","employee"])*/, async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT a.artist_id, a.full_name AS artist_name, COUNT(w.artwork_id) AS artwork_count
      FROM Artists a
      LEFT JOIN Artworks w ON a.artist_id = w.artist_id
      GROUP BY a.artist_id, a.full_name
      ORDER BY artwork_count DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/artworks-per-artist error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// (B) Report: artworks created after 1900 (example “modern” filter)
router.get("/modern-artworks"/*, requireAuth, requireAnyRole(["admin","employee"])*/, async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT title, year_created, art_type, estimated_price
      FROM Artworks
      WHERE year_created >= 1900
      ORDER BY year_created ASC;
    `);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/modern-artworks error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

router.get("/employees.csv", async (_req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT 
        e.employee_id,
        e.first_name,
        e.last_name
      FROM Employees e
      ORDER BY e.employee_id;
    `);

    const header = ["employee_id", "first_name", "last_name"];

    const csv = [
      header.join(","), 
      ...rows.map(r =>
        [r.employee_id, r.first_name, r.last_name]
          .map(v => (v ?? "").toString().replaceAll('"', '""')) 
          .map(v => /[",\n]/.test(v) ? `"${v}"` : v)           
          .join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="employee_basic_report.csv"'
    );

    res.status(200).send(csv);
  } catch (err) {
    console.error("GET /api/reports/employees.csv error:", err);
    res.status(500).send("Failed to generate report backend");
  }
});

//Admin employee Request (This is queries the employee tables)

router.get("/employees", /* requireAuth, requireAnyRole(["admin","employee"]), */ async (req, res) => {
  try {
    // 1) Read query params
    const {
      q = "",
      department_id = "",
      role = "",
      sort = "id",
      dir = "asc",
      page = "1",
      pageSize = "10",
      format = "json",
    } = req.query;

    // 2) Sorting whitelist
    const SORT_MAP = {
      id: "e.employee_id",
      name: "e.last_name",
      role: "e.employee_role",
      dept: "department_name",  // alias we select below
      hired: "e.hire_date",
      phone: "e.phone",
    };
    const sortCol = SORT_MAP[sort] || SORT_MAP.id;
    const sortDir = String(dir).toLowerCase() === "desc" ? "DESC" : "ASC";

    // 3) Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset  = (pageNum - 1) * pageSz;

    // 4) WHERE builder
    const where = [];
    const params = [];

    if (q) {
      where.push("(e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (department_id) {
      where.push("e.department_id = ?");
      params.push(department_id);
    }
    if (role) {
      where.push("e.employee_role = ?");
      params.push(role);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 5) Count total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Employees e
      LEFT JOIN Departments d ON d.department_id = e.department_id
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total ?? 0;

    // 6) Page data
    const dataSql = `
      SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.employee_role,
        e.hire_date,
        d.name AS department_name
      FROM Employees e
      LEFT JOIN Departments d ON d.department_id = e.department_id
      ${whereSql}
      ORDER BY ${sortCol} ${sortDir}, e.employee_id ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [...params, pageSz, offset]);

    // 7) CSV or JSON
    if (format === "csv") {
      const header = [
        "employee_id","first_name","last_name","email","phone_number","employee_role","department_name","hire_date"
      ];
      const csv = [
        header.join(","),
        ...rows.map(r =>
          [
            r.employee_id,
            r.first_name,
            r.last_name,
            r.email,
            r.phone,
            r.employee_role,
            r.department_name,
            (r.hire_date && r.hire_date.toISOString?.().slice(0,10)) || r.hire_date || ""
          ]
          .map(v => (v ?? "").toString().replaceAll('"', '""'))
          .map(v => /[",\n]/.test(v) ? `"${v}"` : v)
          .join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=employees.csv");
      return res.status(200).send(csv);
    }

    // Default JSON for UI
    return res.json({ total, page: pageNum, pageSize: pageSz, rows });
  } catch (err) {
    console.error("GET /reports/employees error:", err);
    return res.status(500).json({ error: err?.message || "Failed to fetch report" });
  }
});

export default router;
