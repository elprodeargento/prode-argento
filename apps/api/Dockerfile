FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json          ./
COPY packages/db/package.json                ./packages/db/
COPY packages/shared/package.json            ./packages/shared/
COPY apps/api/package.json                   ./apps/api/

RUN npm ci

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api
RUN /app/node_modules/.bin/nest build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules                   ./node_modules

# nest infiere rootDir=/app por los path mappings a ../../packages/
# por eso el output queda en dist/apps/api/src/ en lugar de dist/
COPY --from=builder /app/apps/api/dist/apps/api/src     ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
