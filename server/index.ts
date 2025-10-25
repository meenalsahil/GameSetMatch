import express, { type Request, type Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename =
  typeof __dirname === "undefined"
    ? fileURLToPath(import.meta.url)
    : __filename;
const __dirnameLocal =
  typeof __dirname === "undefined" ? path.dirname(__filename) : __dirname;

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessions (Postgres-backed)
const PgSession = connectPg(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      onError: (err) => console.error("Session store error:", err),
    }),
    secret: process.env.SESSION_SECRET || "development-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: false, // set true if behind HTTPS with trust proxy
      sameSite: "lax",
    },
  }),
);

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Simple health checks
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/", (_req, res) => res.status(200).send("server: ok"));

// Register all API routes on the same app instance
const server = await registerRoutes(app);

// Error handler (last)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// Start the HTTP server (THIS keeps the process alive)
const port = parseInt(process.env.PORT || "5000", 10);
server.listen({ port, host: "0.0.0.0", reusePort: true }, () =>
  console.log(`[express] serving on port ${port}`),
);
