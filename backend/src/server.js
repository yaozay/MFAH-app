import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ping } from "./db.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// health route checks DB too
app.get("/api/health", async (_, res) => {
  try {
    const ok = await ping();
    res.json({ ok });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// auth routes
app.use("/api/auth", registerRouter);
app.use("/api/auth", loginRouter);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
