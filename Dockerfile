# Dockerfile for Next.js 15 (React 19) on Coolify
# - Builds with Node 22
# - Upgrades npm to v11 to match local behavior
# - Generic runtime (no need for output:'standalone', but see note below)

FROM node:22-bookworm-slim AS deps
WORKDIR /app

# System deps once
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl git && \
    rm -rf /var/lib/apt/lists/*

# Match local npm behavior
RUN npm i -g npm@11 && npm -v

# Install JS deps deterministically
COPY package*.json ./
RUN npm ci

# ---------- Build ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Create production node_modules for runtime
RUN npm prune --omit=dev

# ---------- Runtime ----------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Ensure Next binds to all interfaces in container
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Native deps commonly needed at runtime (e.g., Prisma/openssl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy only what's needed to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./        # ok if file doesn't exist
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]

# ---- OPTIONAL (smaller image) ----
# If your next.config.* has:  output: 'standalone'
# Replace the four COPYs above with:
# COPY --from=builder /app/.next/standalone ./
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/public ./public
# CMD ["node", "server.js"]
