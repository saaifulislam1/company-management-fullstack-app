# ---- Base Stage ----
FROM node:18-slim AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
COPY package.json package-lock.json ./
# Install ALL dependencies (dev + prod) since build needs Next.js
RUN npm install

# ---- Builder Stage ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Pass build-time API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
# Build the Next.js app (standalone mode enabled in next.config.js)
RUN npm run build

# ---- Production Stage ----
FROM base AS production
ENV NODE_ENV=production

# Optional: create a non-root user (recommended for security)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only the minimal required files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

# Expose Next.js port
EXPOSE 3000

# Start Next.js
CMD ["node", "server.js"]
