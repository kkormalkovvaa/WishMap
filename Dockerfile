# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install frontend dependencies first (leverage cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy Vite config and source
COPY vite.config.js index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Build frontend
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

# Install server dependencies
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev

# Serve built frontend files
COPY --from=builder /app/dist ./dist

# Uploads directory
RUN mkdir -p /usr/src/app/server/uploads

# Switch to non-root user
USER appuser

EXPOSE 5000

CMD ["node", "server/index.js"]
