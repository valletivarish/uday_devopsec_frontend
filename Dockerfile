# ============================================================================
# Frontend Dockerfile - Order Processing & Management UI
#
# Multi-stage build for the React/Vite frontend.
# Stage 1: Build the production bundle with Vite.
# Stage 2: Serve the static files with Nginx for optimal performance.
#
# Author: Uday Kiran Reddy Dodda (x25166484)
# ============================================================================

# ---------- Stage 1: Build the React application ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the production-optimised static bundle
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:1.27-alpine AS production

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration that proxies /api to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage into the Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to verify Nginx is serving the frontend
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
