import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import wishRoutes from './routes/wishes.js';
import categoryRoutes from './routes/categories.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Swagger docs ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WishMap API',
      version: '1.0.0',
      description: 'API для управления желаниями',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./server/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/wishes', authenticate, wishRoutes);
app.use('/api/categories', authenticate, categoryRoutes);

// --- Health check ---
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// --- Start ---
connectDB(process.env.MONGO_URI, process.env.DB_NAME ?? 'wishmap')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
