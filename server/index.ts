import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import flash from "connect-flash";
import { pool } from "./db.js";
import { registerRoutes } from "./routes.js";

const app = express();

// Path setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  }),
);
app.use(flash());

// API routes
await registerRoutes(app);

// Serve static files from Vite build
const distPath = path.join(__dirname, "../dist/client");
app.use(express.static(distPath));

// Handle all other routes (SPA support)
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
