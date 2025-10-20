import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const {
  DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT,
  DB_SSL
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: Number(DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: DB_SSL === "true" ? { rejectUnauthorized: true } : undefined
});

// Simple helper to test connectivity
export async function ping() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}
