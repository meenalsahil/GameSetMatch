import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import flash from "connect-flash";
import cors from "cors";
import { pool } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();

// Path setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS so frontend can call backend from another port (like Vite dev server)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Vite default ports
    credentials: true,
  })
);

// Sessions
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);
app.use(flash());

// API routes
await registerRoutes(app);

// Serve static files from Vite build (for production)
const distPath = path.join(__dirname, "../dist/client");
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
