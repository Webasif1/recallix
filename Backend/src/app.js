import express from "express";
import authRouter from "./routes/auth.route.js";
import itemRoutes from "./routes/item.route.js";
import morgan from "morgan";
import cookie from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { responseMessage } from "./utils/responseMessage.js";

const app = express();

// Resolved from this file, not from process.cwd(), so the build is served
// correctly no matter which directory the process was started in.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

// In production the frontend is served from this same origin, so the browser
// never issues a cross-origin request — these entries exist for local dev and
// for the browser extension.
const allowedOrigins = [
  "chrome-extension://oanhpfjblpgdfnnfgkfjhakcchnmjhfc",
  "https://recallix.onrender.com",
  "https://recallix-3xvg.onrender.com",
  "https://69d224a1c1d67ef51d7855d3--recallixgg.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.EXTRA_CORS_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter(Boolean) ?? []),
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use(cookie());
app.use(morgan("dev"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/api/health", (req, res) => {
  responseMessage(res, {
    status: 200,
    message: "ok",
    success: true,
    data: { uptime: process.uptime() },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemRoutes);

// An unmatched /api/* path must answer JSON. Previously it fell through to the
// SPA fallback below and returned index.html, so a typo'd endpoint handed the
// client HTML where it expected JSON.
app.use("/api", (req, res) => {
  responseMessage(res, {
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    success: false,
    error: "Not found",
  });
});

// SPA fallback — every non-API route renders the client
app.use((req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Central error handler. Express 5 forwards rejected async handlers here; with
// no handler registered they surfaced as an HTML stack trace.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  responseMessage(res, {
    status: err.status || 500,
    message: "Something went wrong on our end",
    success: false,
    error:
      process.env.NODE_ENV === "production" ? "Internal error" : err.message,
  });
});

export default app;
