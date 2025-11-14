import { Router } from "express";
import { pool } from "../db.js";
// import { requireAuth } from "../utils/requireAuth.js";
// import { requireAnyRole } from "../utils/authorize.js";
import { stringify } from "csv-stringify/sync";

const router = Router();

/* -------------------------------------------------------------------------- */
/* (A) Artworks per Artist per Collection (3+ tables)                         */
/* -------------------------------------------------------------------------- */

router.get(
  "/artworks-per-artist",
  /* requireAuth, requireAnyRole(["admin","employee"]), */
  async (_req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT
          ar.artist_id,
          ar.full_name AS artist_name,
          c.collection_id,
          c.collection_name,
          COUNT(DISTINCT a.artwork_id) AS artwork_count,
          COALESCE(SUM(a.estimated_price), 0) AS total_value
        FROM Artists ar
        LEFT JOIN Artworks a
          ON a.artist_id = ar.artist_id
        LEFT JOIN Collection_Artworks ca
          ON ca.artwork_id = a.artwork_id
        LEFT JOIN Collections c
          ON c.collection_id = ca.collection_id
        GROUP BY
          ar.artist_id,
          ar.full_name,
          c.collection_id,
          c.collection_name
        ORDER BY
          artwork_count DESC,
          ar.full_name ASC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("GET /reports/artworks-per-artist error:", err);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  }
);


/* -------------------------------------------------------------------------- */
/* (B) Modern Artworks (after 1900)                                           */
/* -------------------------------------------------------------------------- */

router.get(
  "/modern-artworks",
  /* requireAuth, requireAnyRole(["admin","employee"]) */
  async (_req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          title,
          year_created,
          art_type,
          estimated_price
        FROM Artworks
        WHERE year_created >= 1900
        ORDER BY year_created ASC;
      `);

      res.json(rows);
    } catch (err) {
      console.error("GET /reports/modern-artworks error:", err);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* (C1) Basic Employees CSV                                                   */
/* -------------------------------------------------------------------------- */

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
      ...rows.map((r) =>
        [
          r.employee_id,
          r.first_name,
          r.last_name,
        ]
          .map((v) => (v ?? "").toString().replaceAll('"', '""'))
          .map((v) => (/["\n,]/.test(v) ? `"${v}"` : v))
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

/* -------------------------------------------------------------------------- */
/* (C2) Employee Filters w/ Salary + CSV                                      */
/* -------------------------------------------------------------------------- */

router.get(
  "/employees",
  /* requireAuth, requireAnyRole(["admin"]) */
  async (req, res) => {
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
      const sortDir = dir.toLowerCase() === "desc" ? "DESC" : "ASC";

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSz = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 10));
      const offset = (pageNum - 1) * pageSz;

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

      const countSql = `
        SELECT COUNT(*) AS total
        FROM Employees e
        LEFT JOIN Departments d ON d.department_id = e.department_id
        ${whereSql};
      `;
      const [countRows] = await pool.query(countSql, params);
      const total = countRows[0]?.total ?? 0;

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
        LIMIT ? OFFSET ?;
      `;

      const [rows] = await pool.query(dataSql, [...params, pageSz, offset]);

      if (format === "csv") {
        const header = [
          "employee_id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "employee_role",
          "department_name",
          "hire_date",
          "salary",
        ];

        const csv = [
          header.join(","),
          ...rows.map((r) =>
            [
              r.employee_id,
              r.first_name,
              r.last_name,
              r.email,
              r.phone,
              r.employee_role,
              r.department_name,
              r.hire_date?.toISOString?.().slice(0, 10) || r.hire_date || "",
              r.salary,
            ]
              .map((v) => (v ?? "").toString().replaceAll('"', '""'))
              .map((v) => (/["\n,]/.test(v) ? `"${v}"` : v))
              .join(",")
          ),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=employees.csv");
        return res.status(200).send(csv);
      }

      return res.json({ total, page: pageNum, pageSize: pageSz, rows });
    } catch (err) {
      console.error("GET /reports/employees error:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch report" });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* (D) Exhibition Popularity Report                                           */
/* -------------------------------------------------------------------------- */

router.get("/exhibition-popularity", async (req, res) => {
  try {
    const {
      q = "",
      from = "",
      to = "",
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
      start_date: "e.start_date",
      end_date: "e.end_date",
    };

    const sortCol = SORT_MAP[sort] || SORT_MAP.total_revenue;
    const sortDir = String(dir).toLowerCase() === "asc" ? "ASC" : "DESC";

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 10));
    const offset = (pageNum - 1) * pageSz;

    const exhibitWhere = [];
    const exhibitParams = [];

    if (q) {
      exhibitWhere.push("e.title LIKE ?");
      exhibitParams.push(`%${q}%`);
    }

    if (from && to) {
      exhibitWhere.push("(e.end_date >= ? AND e.start_date <= ?)");
      exhibitParams.push(from, to);
    } else if (from) {
      exhibitWhere.push("e.end_date >= ?");
      exhibitParams.push(from);
    } else if (to) {
      exhibitWhere.push("e.start_date <= ?");
      exhibitParams.push(to);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = to || today.toISOString().slice(0, 10);

    exhibitWhere.push("e.end_date IS NOT NULL");
    exhibitWhere.push("e.end_date <= ?");
    exhibitParams.push(cutoff);

    const exhibitWhereSql = exhibitWhere.length
      ? `WHERE ${exhibitWhere.join(" AND ")}`
      : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM Exhibitions e
      ${exhibitWhereSql};
    `;

    const [countRows] = await pool.query(countSql, exhibitParams);
    const total = Number(countRows?.[0]?.total || 0);

    const salesDateConds = [];
    const salesParams = [];

    if (from) {
      salesDateConds.push("ts.visit_date >= ?");
      salesParams.push(from);
    }
    if (to) {
      salesDateConds.push("ts.visit_date <= ?");
      salesParams.push(to);
    }

    const salesDateSql =
      salesDateConds.length > 0
        ? `AND ${salesDateConds.join(" AND ")}`
        : "";

        const dataSql = `
      SELECT 
        e.exhibition_id,
        e.title,
        e.start_date,
        e.end_date,
        DATEDIFF(e.end_date, e.start_date) + 1 AS run_days,
        COALESCE(s.total_tickets, 0) AS total_tickets,
        COALESCE(s.total_revenue, 0.00) AS total_revenue,
        (
          SELECT tt.name
          FROM Ticket_Sales ts
          JOIN Ticket_Type tt
            ON tt.ticket_type_id = ts.ticket_type_id
          WHERE ts.visit_date BETWEEN e.start_date AND e.end_date
          GROUP BY ts.ticket_type_id
          ORDER BY SUM(ts.ticket_amount) DESC
          LIMIT 1
        ) AS top_ticket_type
      FROM Exhibitions e
      LEFT JOIN (
        SELECT 
          e2.exhibition_id,
          SUM(ts.ticket_amount) AS total_tickets,
          SUM(ts.purchase_price) AS total_revenue
        FROM Ticket_Sales ts
        JOIN Exhibitions e2 
          ON ts.visit_date BETWEEN e2.start_date AND e2.end_date
        WHERE 1=1
        ${salesDateSql}
        GROUP BY e2.exhibition_id
      ) s ON s.exhibition_id = e.exhibition_id
      ${exhibitWhereSql}
      ORDER BY ${sortCol} ${sortDir}, e.exhibition_id ASC
      LIMIT ? OFFSET ?;
    `;

    const [rows] = await pool.query(
      dataSql,
      [...exhibitParams, ...salesParams, pageSz, offset]
    );


    if (format === "csv") {
      const header = [
        "exhibition_id",
        "title",
        "start_date",
        "end_date",
        "run_days",
        "total_tickets",
        "total_revenue",
      ];

      const fmtDate = (v) => {
        if (!v) return "";
        const d = new Date(v);
        return isNaN(d) ? String(v) : d.toISOString().slice(0, 10);
      };

      const csv = [
        header.join(","),
        ...rows.map((r) =>
          [
            r.exhibition_id,
            (r.title ?? "").toString().replaceAll('"', '""'),
            fmtDate(r.start_date),
            fmtDate(r.end_date),
            r.run_days,
            r.total_tickets,
            Number(r.total_revenue || 0).toFixed(2),
          ]
            .map((v) => (v ?? "").toString().replaceAll('"', '""'))
            .map((v) => (/["\n,]/.test(v) ? `"${v}"` : v))
            .join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=exhibition_popularity.csv"
      );
      return res.status(200).send(csv);
    }

    res.json({ total, page: pageNum, pageSize: pageSz, rows });
  } catch (err) {
    console.error("GET /reports/exhibition-popularity error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

/* -------------------------------------------------------------------------- */
/* (E) Admin Metrics Helpers                                                  */
/* -------------------------------------------------------------------------- */

async function getTicketSales(pool, start, end) {
  const sql = `
    SELECT COALESCE(SUM(ts.purchase_price), 0) AS ticket_sales
    FROM Ticket_Sales ts
    WHERE ts.visit_date >= ?
      AND ts.visit_date < DATE_ADD(?, INTERVAL 1 DAY);
  `;
  const [[row]] = await pool.query(sql, [start, end]);
  return Number(row.ticket_sales || 0);
}


async function countNewMemberships(pool, start, end) {
  const [cols] = await pool.query(`SHOW COLUMNS FROM Membership_records`);
  const has = (n) => cols.some((c) => c.Field === n);

  const dateCol = has("start_date")
    ? "start_date"
    : has("purchased_date")
    ? "purchased_date"
    : has("created_at")
    ? "created_at"
    : null;

  if (!dateCol) return 0;

  const sql = `
    SELECT COUNT(*) AS new_memberships
    FROM Membership_records mr
    WHERE mr.${dateCol} >= ?
      AND mr.${dateCol} < DATE_ADD(?, INTERVAL 1 DAY);
  `;
  const [[row]] = await pool.query(sql, [start, end]);
  return Number(row.new_memberships || 0);
}

/* -------------------------------------------------------------------------- */
/* (F) Admin Metrics Endpoint                                                 */
/* -------------------------------------------------------------------------- */

router.get("/admin-metrics", async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "start and end are required (YYYY-MM-DD)" });
  }

  try {
    // 🔹 Total visitors this month = unique visitors with a visit_date in range
    const [[{ total_visitors }]] = await pool.query(
      `
      SELECT COUNT(DISTINCT ts.visitor_id) AS total_visitors
      FROM Ticket_Sales ts
      WHERE ts.visit_date >= ?
        AND ts.visit_date < DATE_ADD(?, INTERVAL 1 DAY);
      `,
      [start, end]
    );

    // 🔹 Ticket sales this month, using visit_date
    const ticket_sales = await getTicketSales(pool, start, end);

    // 🔹 Shop sales logic stays the same
    const [[{ shop_sales }]] = await pool.query(
      `
      SELECT COALESCE(SUM(g.total_price), 0) AS shop_sales
      FROM Gift_Shop_Transactions g
      WHERE g.sale_date >= ?
        AND g.sale_date < DATE_ADD(?, INTERVAL 1 DAY);
      `,
      [start, end]
    );

    const new_memberships = await countNewMemberships(pool, start, end);

    res.json({
      total_visitors: Number(total_visitors || 0),
      ticket_sales,
      shop_sales: Number(shop_sales || 0),
      new_memberships,
    });
  } catch (err) {
    console.error("GET /reports/admin-metrics error:", err);
    res.status(500).json({ error: "Failed to fetch admin metrics" });
  }
});


/* -------------------------------------------------------------------------- */
/* (G) Member Gift Shop Purchases                                             */
/* -------------------------------------------------------------------------- */

router.get("/member-giftshop-purchases", async (req, res) => {
  const { start, end } = req.query;

  try {
    let sql = `
      SELECT 
        mt.name AS membership_type,
        COUNT(gst.transaction_id) AS total_transactions,
        ROUND(AVG(gst.total_price), 2) AS avg_purchase_value,
        COALESCE(SUM(gst.total_price), 0) AS total_spent
      FROM Membership_records mr
      JOIN Membership_Types mt ON mr.plan_id = mt.plan_id
      JOIN Visitors v ON v.visitor_id = mr.visitor_id
      LEFT JOIN Gift_Shop_Transactions gst ON gst.visitor_id = v.visitor_id
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

/* -------------------------------------------------------------------------- */
/* (H) Supplier Gift Shop Sales                                               */
/* -------------------------------------------------------------------------- */

router.get("/supplier-giftshop-sales", async (req, res) => {
  const { start, end } = req.query;

  try {
    let sql = `
      SELECT 
        s.name AS supplier_name,
        COALESCE(SUM(gst.total_price), 0) AS total_sales,
        COUNT(DISTINCT gst.transaction_id) AS total_transactions,
        COUNT(DISTINCT sp.product_id) AS unique_products_sold
      FROM Gift_Shop_Transactions gst
      JOIN Shop_Products sp ON gst.product_id = sp.product_id
      JOIN Supplier_Products sup ON sp.product_id = sup.product_id
      JOIN Suppliers s ON sup.supplier_id = s.supplier_id
    `;

    const params = [];

    if (start && end) {
      sql += `
        WHERE gst.sale_date >= ?
        AND gst.sale_date < DATE_ADD(?, INTERVAL 1 DAY)
      `;
      params.push(start, end);
    }

    sql += `
      GROUP BY s.name
      ORDER BY total_sales DESC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/supplier-giftshop-sales error:", err);
    res.status(500).json({ error: "Failed to fetch supplier gift shop sales report" });
  }
});

/* -------------------------------------------------------------------------- */
/* (I) Collection Value Report                                                */
/* -------------------------------------------------------------------------- */

router.get("/collection-value", async (req, res) => {
  const { from, to } = req.query;

  try {
    const params = [];
    let dateSql = "";

    if (from && to) {
      dateSql = "AND a.acquisition_date >= ? AND a.acquisition_date < DATE_ADD(?, INTERVAL 1 DAY)";
      params.push(from, to);
    } else if (from) {
      dateSql = "AND a.acquisition_date >= ?";
      params.push(from);
    } else if (to) {
      dateSql = "AND a.acquisition_date < DATE_ADD(?, INTERVAL 1 DAY)";
      params.push(to);
    }

    const sql = `
      SELECT 
        c.collection_id,
        c.collection_name,
        COUNT(a.artwork_id) AS total_artworks,
        COALESCE(SUM(a.estimated_price), 0) AS total_collection_value
      FROM Collections c
      LEFT JOIN Collection_Artworks ca 
        ON c.collection_id = ca.collection_id
      LEFT JOIN Artworks a 
        ON ca.artwork_id = a.artwork_id
      WHERE 1=1
      ${dateSql}
      GROUP BY c.collection_id, c.collection_name
      ORDER BY total_collection_value DESC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /reports/collection-value error:", err);
    res.status(500).json({ error: "Failed to fetch collection value report" });
  }
});

export default router;
