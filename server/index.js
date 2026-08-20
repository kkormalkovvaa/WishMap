import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import wishRoutes from "./routes/wishes.js";
import categoryRoutes from "./routes/categories.js";
import { authenticate } from "./middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;

// --- Ensure uploads directory exists ---
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- Security & performance middleware ---
app.use(helmet());

const corsOrigin =
  process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()) || "*";
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

// --- Rate limiter for auth routes ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Слишком много попыток авторизации. Повторите позже." },
});
app.use("/api/auth", authLimiter);

// --- Swagger docs ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WishMap API",
      version: "1.0.0",
      description: "API для управления желаниями",
    },
    servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./server/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/wishes", wishRoutes);
app.use("/api/categories", authenticate, categoryRoutes);

// --- Health check ---
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// --- Serve frontend static files in production ---
const clientDist = path.join(__dirname, "../../dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// --- Global error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "Внутренняя ошибка сервера",
  });
});

// --- Start ---
connectDB(process.env.MONGO_URI, process.env.DB_NAME ?? "wishmap")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
