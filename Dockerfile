# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable

# Copy lockfiles (add .npmrc/.pnpmfile.cjs if you use them)
COPY package.json pnpm-lock.yaml ./

# Install all deps (dev+prod) for build
RUN pnpm install --frozen-lockfile

# --- builder ---
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
RUN corepack enable

# Bring deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client (ok if prisma not used; the || true avoids failing in non-prisma repos)
RUN pnpm prisma generate || true

# Next build (must have output: 'standalone' in next.config.js)
RUN pnpm build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone server + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public


# Non-root
RUN adduser -D -H -u 1001 appuser
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
