import express from "express";
import { pool } from "./db.js";

const router = express.Router();

router.get("/employees", async (req, res) => {
    try{
        const [rows] = await pool.query(`
            SELECT employee_id, first_name, last_name, department_id, employee_role, hire_date, salary
            FROM Employees
            ORDER BY salary DESC
            `);
        
        res.json(rows);
    } catch (error){
        console.error("Error fetching employees:", error);
        res.status(500).json({message: "Database query failed."});
    }
});

export default router;