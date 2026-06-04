# ---------------------------------------------------
# STAGE 1: BUILDER
# ---------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm config set strict-ssl false && npm install -g @nestjs/cli && npm ci

COPY . .

RUN npm run build

# ---------------------------------------------------
# STAGE 2: PRODUCTION
# ---------------------------------------------------
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm config set strict-ssl false && npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]