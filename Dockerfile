FROM oven/bun:alpine AS deps
WORKDIR /app

COPY package.json ./
RUN bun install

FROM oven/bun:alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN bunx prisma generate
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN adduser -D -H -u 1001 appuser
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
    