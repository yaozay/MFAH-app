import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ping } from "./db.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import artistsRouter from "./routes/artists.js";
import artworksRouter from "./routes/artworks.js";
import eventsRouter from "./routes/events.js";
import reportsRouter from "./routes/reports.js";
import employeesRouter from "./routes/employees.js";
import venuesRouter from "./routes/venues.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

// both local dev and Vercel production
const allowedOrigins = [
  "http://localhost:5173",
  "https://mfah-app.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error(`CORS blocked for origin: ${origin}`)
        );
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());


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
app.use("/api/artists", artistsRouter);
app.use("/api/artworks", artworksRouter);
app.use("/api/events", eventsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/venues", venuesRouter);


app.use("/api/employees", employeesRouter);


app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
