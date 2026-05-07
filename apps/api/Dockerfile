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

# Invocar nest con path absoluto para evitar problemas de PATH en workspace
RUN /app/node_modules/.bin/nest build

# Debug: mostrar dónde quedó el output
RUN find /app -name "main.js" 2>/dev/null || echo "main.js no encontrado en ningún lado"

RUN test -f dist/main.js || (echo "ERROR: dist/main.js no generado" && exit 1)

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules         ./node_modules
COPY --from=builder /app/apps/api/dist        ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
