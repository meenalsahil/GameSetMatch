import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
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
      secure: false, // true only behind HTTPS
      sameSite: "lax",
    },
  }),
);

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Register backend API routes
const server = await registerRoutes(app);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// Serve the React frontend (dist folder)
const clientBuildPath = path.join(process.cwd(), "dist");
app.use(express.static(clientBuildPath));

// Fallback to React index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Start the HTTP server
const port = parseInt(process.env.PORT || "5050", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`[express] serving on port ${port}`);
});
