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
app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  // Remove default Strict-Transport-Security for local dev to avoid mixed-content issues
  if (process.env.NODE_ENV !== "production") {
    res.removeHeader("strict-transport-security");
  }
  next();
});

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5174", "http://localhost:5173"];

// Always allow Swagger UI origin
// corsOrigins.push("http://localhost:5000");
corsOrigins.push("https://wishmap-ogk2.onrender.com");

app.use(cors({ origin: corsOrigins, credentials: true }));

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
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:5000",
        description: "Сервер",
      },
    ],
    // servers: [{ url: "http://localhost:5000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Wish: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            categoryId: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["active", "in_progress", "completed"],
            },
            deadline: { type: "string", format: "date-time", nullable: true },
            image: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        WishInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            categoryId: { type: "string" },
            status: {
              type: "string",
              enum: ["active", "in_progress", "completed"],
            },
            deadline: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            color: { type: "string" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            color: { type: "string" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, "routes", "*.js").replace(/\\/g, "/")],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

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
