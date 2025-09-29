# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
COPY package.json package-lock.json ./
# Install ALL dependencies (including dev) needed for build
RUN npm install

# ---- Builder Stage ----
FROM base AS builder
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source code
COPY . .
# --- THIS IS THE FIX ---
# Generate the Prisma Client based on your schema
RUN npx prisma generate
# --- END FIX ---
# Build the TypeScript code.
RUN npm run build

# ---- Production Stage ----
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy production node_modules from the 'deps' stage after pruning dev deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copy the generated Prisma client and schema
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json .
COPY tsconfig.json .

# Set up the entrypoint script
COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 8000

CMD ["npm", "start"]