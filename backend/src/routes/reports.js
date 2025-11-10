import { Router } from "express";
import { pool } from "../db.js";
// import { requireAuth } from "../utils/requireAuth.js";
// import { requireAnyRole } from "../utils/authorize.js";
import { stringify } from "csv-stringify/sync";

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

// (B) Report: artworks created after 1900
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

// (C1) CSV: basic employees export
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
    res.setHeader("Content-Disposition", 'attachment; filename="employee_basic_report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error("GET /api/reports/employees.csv error:", err);
    res.status(500).send("Failed to generate report backend");
  }
});

// (C2) Employees: filter/sort/paginate (now includes salary + CSV option)
router.get("/employees"/*, requireAuth, requireAnyRole(["admin"])*/, async (req, res) => {
  try {
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

    // Sorting whitelist (added salary)
    const SORT_MAP = {
      id: "e.employee_id",
      name: "e.last_name",
      role: "e.employee_role",
      dept: "department_name",
      hired: "e.hire_date",
      phone: "e.phone",
      salary: "e.salary",
    };
    const sortCol = SORT_MAP[sort] || SORT_MAP.id;
    const sortDir = String(dir).toLowerCase() === "desc" ? "DESC" : "ASC";

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset  = (pageNum - 1) * pageSz;

    // WHERE builder
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

    // Count total
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Employees e
      LEFT JOIN Departments d ON d.department_id = e.department_id
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total ?? 0;

    // Page data (now selecting salary)
    const dataSql = `
      SELECT
        e.employee_id,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.employee_role,
        e.hire_date,
        e.salary,
        d.name AS department_name
      FROM Employees e
      LEFT JOIN Departments d ON d.department_id = e.department_id
      ${whereSql}
      ORDER BY ${sortCol} ${sortDir}, e.employee_id ASC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [...params, pageSz, offset]);

    // CSV or JSON
    if (format === "csv") {
      const header = [
        "employee_id","first_name","last_name","email","phone","employee_role","department_name","hire_date","salary"
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
            (r.hire_date && r.hire_date.toISOString?.().slice(0,10)) || r.hire_date || "",
            r.salary
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
// (D) Exhibition Popularity — date-robust + exact ticket-type labels + exhibition run-date filter
router.get("/exhibition-popularity", async (req, res) => {
  try {
    const {
      q = "",
      from = "",           // YYYY-MM-DD (optional)
      to = "",             // YYYY-MM-DD (optional)
      sort = "total_revenue",
      dir = "desc",
      page = "1",
      pageSize = "10",
      format = "json",
    } = req.query;

    const SORT_MAP = {
      title: "e.title",
      run_days: "run_days",
      total_tickets: "total_tickets",
      total_revenue: "total_revenue",
      adult: "adult",
      senior: "senior",
      youth: "youth",
      child: "child",
      start_date: "e.start_date",
      end_date: "e.end_date",
    };
    const sortCol = SORT_MAP[sort] || SORT_MAP.total_revenue;
    const sortDir = String(dir).toLowerCase() === "asc" ? "ASC" : "DESC";

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset  = (pageNum - 1) * pageSz;

    // ---- Title search (on Exhibitions) ----
    const where = [];
    const whereParams = [];
    if (q) {
      where.push("e.title LIKE ?");
      whereParams.push(`%${q}%`);
    }

    // ---- Exhibition run-date filter (overlap with [from, to]) ----
    // Keep only exhibitions that intersect the requested date window.
    const exhibitDateConds = [];
    const exhibitDateParams = [];
    if (from && to) {
      exhibitDateConds.push("(e.end_date >= ? AND e.start_date <= ?)");
      exhibitDateParams.push(from, to);
    } else if (from) {
      exhibitDateConds.push("e.end_date >= ?");
      exhibitDateParams.push(from);
    } else if (to) {
      exhibitDateConds.push("e.start_date <= ?");
      exhibitDateParams.push(to);
    }

    const combinedWhereParts = [...where, ...exhibitDateConds];
    const combinedWhereParams = [...whereParams, ...exhibitDateParams];
    const whereSql = combinedWhereParts.length ? `WHERE ${combinedWhereParts.join(" AND ")}` : "";

    // ---- Ticket sales date filter (works for DATE or DATETIME) ----
    const salesDateWhere = [];
    const salesDateParams = [];
    if (from) {
      salesDateWhere.push(`DATE(t.date) >= ?`);
      salesDateParams.push(from);
    }
    if (to) {
      salesDateWhere.push(`DATE(t.date) <= ?`);
      salesDateParams.push(to);
    }
    const salesDateSql = salesDateWhere.length ? `WHERE ${salesDateWhere.join(" AND ")}` : "";

    // ---- Count exhibitions AFTER applying title + run-date filters ----
    const countSql = `
      SELECT COUNT(*) AS total
      FROM Exhibitions e
      ${whereSql}
    `;
    const [countRows] = await pool.query(countSql, combinedWhereParams);
    const total = Number(countRows?.[0]?.total || 0);

    // ---- Data: filter Ticket_Sales in subquery; LEFT JOIN preserves zero-sales rows ----
    const dataSql = `
      SELECT
        e.exhibition_id,
        e.title,
        e.start_date,
        e.end_date,
        DATEDIFF(e.end_date, e.start_date) + 1 AS run_days,
        0 AS adult,   -- no ticket_type in Ticket_Sales; keep 0s or remove these columns
        0 AS senior,
        0 AS youth,
        0 AS child,
        COALESCE(SUM(fs.ticket_amount), 0) AS total_tickets,
        COALESCE(SUM(fs.purchase_price * fs.ticket_amount), 0.00) AS total_revenue
      FROM Exhibitions e
      LEFT JOIN Ticket_Sales fs
        ON fs.visit_date BETWEEN e.start_date AND e.end_date
      GROUP BY e.exhibition_id, e.title, e.start_date, e.end_date
      ORDER BY total_revenue DESC, e.exhibition_id ASC
      LIMIT ? OFFSET ?;
    `;
    const [rows] = await pool.query(
      dataSql,
      [...salesDateParams, ...combinedWhereParams, pageSz, offset]
    );

    if (format === "csv") {
      const header = [
        "exhibition_id","title","start_date","end_date",
        "run_days","total_tickets","total_revenue",
        "adult","senior","youth","child"
      ];
      const toMMDDYYYY = (d) => {
        if (!d) return "";
        const date = typeof d === "string" ? new Date(d) : d;
        if (isNaN(date)) return "";
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
      };
      const csv = [
        header.join(","),
        ...rows.map((r) =>
          [
            r.exhibition_id,
            r.title,
            toMMDDYYYY(r.start_date),
            toMMDDYYYY(r.end_date),
            r.run_days,
            r.total_tickets,
            (Number(r.total_revenue || 0)).toFixed(2),
            r.adult, r.senior, r.youth, r.child
          ]
          .map(v => (v ?? "").toString().replaceAll('"','""'))
          .map(v => /[",\n]/.test(v) ? `"${v}"` : v)
          .join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=exhibition_popularity.csv");
      return res.status(200).send(csv);
    }

    return res.json({ total, page: pageNum, pageSize: pageSz, rows });
  } catch (err) {
    console.error("GET /reports/exhibition-popularity error:", err);
    return res.status(500).json({ error: err?.message || "Failed to fetch report" });
  }
});

// --- helpers ---------------------------------------------------------------

// Ticket sales: purchase_price * ticket_amount over purchased_date
async function getTicketSales(pool, start, end) {
  const sql = `
    SELECT COALESCE(SUM(t.purchase_price * t.ticket_amount), 0) AS ticket_sales
    FROM Ticket_Sales t
    WHERE t.purchased_date >= ? AND t.purchased_date < DATE_ADD(?, INTERVAL 1 DAY)
  `;
  const [[row]] = await pool.query(sql, [start, end]);
  return Number(row.ticket_sales || 0);
}

// Count new memberships from Membership_records
async function countNewMemberships(pool, start, end) {
  // detect which date column Membership_records has
  const [cols] = await pool.query(`SHOW COLUMNS FROM Membership_records`);
  const has = (n) => cols.some(c => c.Field === n);
  const dateCol = has('start_date')
    ? 'start_date'
    : has('purchased_date')
    ? 'purchased_date'
    : has('created_at')
    ? 'created_at'
    : null;

  if (!dateCol) {
    // no usable date column; treat as 0 rather than 500
    return 0;
  }

  const sql = `
    SELECT COUNT(*) AS new_memberships
    FROM Membership_records mr
    WHERE mr.${dateCol} >= ? AND mr.${dateCol} < DATE_ADD(?, INTERVAL 1 DAY)
  `;
  const [[row]] = await pool.query(sql, [start, end]);
  return Number(row.new_memberships || 0);
}

// (Optional) revenue from memberships this period
async function getMembershipRevenue(pool, start, end) {
  // If records already store the charge, sum that; otherwise join to Types.price
  const [cols] = await pool.query(`SHOW COLUMNS FROM Membership_records`);
  const has = (n) => cols.some(c => c.Field === n);
  const dateCol = has('start_date') ? 'start_date' :
                  has('purchased_date') ? 'purchased_date' : 'created_at';

  if (has('amount') || has('total_price')) {
    const amountExpr = has('amount') ? 'mr.amount' : 'mr.total_price';
    const sql = `
      SELECT COALESCE(SUM(${amountExpr}), 0) AS membership_revenue
      FROM Membership_records mr
      WHERE mr.${dateCol} >= ? AND mr.${dateCol} < DATE_ADD(?, INTERVAL 1 DAY)
    `;
    const [[row]] = await pool.query(sql, [start, end]);
    return Number(row.membership_revenue || 0);
  } else {
    // join on plan price from Membership_Types
    // assumes Membership_records has plan_id
    const sql = `
      SELECT COALESCE(SUM(mt.price), 0) AS membership_revenue
      FROM Membership_records mr
      JOIN Membership_Types mt ON mt.plan_id = mr.plan_id
      WHERE mr.${dateCol} >= ? AND mr.${dateCol} < DATE_ADD(?, INTERVAL 1 DAY)
    `;
    const [[row]] = await pool.query(sql, [start, end]);
    return Number(row.membership_revenue || 0);
  }
}


router.get("/admin-metrics", async (req, res) => {
  const { start, end } = req.query; // YYYY-MM-DD
  if (!start || !end) {
    return res.status(400).json({ error: "start and end are required (YYYY-MM-DD)" });
  }

  try {
    // Total Visitors
    const [[{ total_visitors }]] = await pool.query(
      `SELECT COUNT(*) AS total_visitors
         FROM Visitors v
        WHERE v.last_visit >= ? AND v.last_visit < DATE_ADD(?, INTERVAL 1 DAY)`,
      [start, end]
    );

    const ticket_sales = await getTicketSales(pool, start, end);

    // Gift shop sales (keep if g.total_price exists)
    const [[{ shop_sales }]] = await pool.query(
      `SELECT COALESCE(SUM(g.total_price), 0) AS shop_sales
         FROM Gift_Shop_Transactions g
        WHERE g.sale_date >= ? AND g.sale_date < DATE_ADD(?, INTERVAL 1 DAY)`,
      [start, end]
    );

    const new_memberships = await countNewMemberships(pool, start, end);

    // Optional: include membership revenue if you want it on the dashboard
    // const membership_revenue = await getMembershipRevenue(pool, start, end);

    res.json({
      total_visitors: Number(total_visitors || 0),
      ticket_sales,
      shop_sales: Number(shop_sales || 0),
      new_memberships,
      // membership_revenue,
    });
  } catch (err) {
    console.error("GET /reports/admin-metrics error:", err);
    res.status(500).json({ error: "Failed to fetch admin metrics" });
  }
});

// (E) Report: Member Gift Shop Purchases
router.get("/member-giftshop-purchases", async (req, res) => {
  const { start, end } = req.query; // optional date filters YYYY-MM-DD

  try {
    let sql = `
      SELECT 
        mt.name AS membership_type,
        COUNT(gst.transaction_id) AS total_transactions,
        ROUND(AVG(gst.total_price), 2) AS avg_purchase_value,
        COALESCE(SUM(gst.total_price), 0) AS total_spent
      FROM Membership_records mr
      JOIN Membership_Types mt 
        ON mr.plan_id = mt.plan_id
      JOIN Visitors v 
        ON v.visitor_id = mr.visitor_id
      LEFT JOIN Gift_Shop_Transactions gst 
        ON gst.visitor_id = v.visitor_id
    `;

    const params = [];

    if (start && end) {
      sql += `
        AND gst.sale_date >= ?
        AND gst.sale_date < DATE_ADD(?, INTERVAL 1 DAY)
      `;
      params.push(start, end);
    }

    sql += `
      GROUP BY mt.name
      ORDER BY total_spent DESC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/member-giftshop-purchases error:", err);
    res.status(500).json({ error: "Failed to fetch member gift shop purchases report" });
  }
});



export default router;

