import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import generateTestsRouter from "./routes/generateTests.js";
import suitesRouter from "./routes/suites.js";
import healthRouter from "./routes/health.js";

const app = express();
const PORT = process.env.PORT || 5001;

// ── Global Middleware ──────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// Stricter rate limit on generation endpoint
const genLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: "Generation rate limit reached. Wait a minute and try again.",
  },
});
app.use("/api/generate-tests", genLimiter);

// Request Logger
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use("/api", authRouter);
app.use("/api", generateTestsRouter);
app.use("/api", suitesRouter);
app.use("/api", healthRouter);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "Bug-Wise API is running",
    version: "1.0.0",
    docs: {
      health: "GET  /api/health",
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
      me: "GET  /api/auth/me",
      generate: "POST /api/generate-tests",
      suites: "GET  /api/suites",
      stats: "GET  /api/suites/stats",
    },
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──────────────────────────────────────────────────
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════╗`);
    console.log(`  ║     🐛 Bug-Wise API v1.0.0           ║`);
    console.log(`  ║     Running on port ${PORT}              ║`);
    console.log(`  ╚══════════════════════════════════════╝\n`);

    if (!process.env.OPENAI_API_KEY) {
      console.warn("  ⚠️  WARNING: OPENAI_API_KEY is not set in .env\n");
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("change-this")) {
      console.warn("  ⚠️  WARNING: Set a strong JWT_SECRET in .env\n");
    }
  });
}

start();

export default app;
