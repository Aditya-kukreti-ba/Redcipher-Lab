# ─── RedCipher Labs — Backend Dockerfile ──────────────────────────────────────
# Multi-stage build for Oracle Cloud (ARM64 / AMD64 compatible)

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source files
COPY server.js auth.js db.js flags.js ./

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Expose backend port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
