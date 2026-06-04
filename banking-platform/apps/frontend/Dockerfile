# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app
RUN npm config set strict-ssl false

# ---------- deps ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_TELEMETRY_DISABLED=1
# NODE_TLS_REJECT_UNAUTHORIZED=0 covers SWC binary download (uses Node.js fetch)
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build

# ---------- production ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# standalone output — only ships what's needed (no node_modules in runner)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8000
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
