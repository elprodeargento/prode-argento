FROM node:22-alpine AS builder
WORKDIR /app

# Workspace manifests para que npm ci resuelva @prode/* internos
COPY package.json package-lock.json          ./
COPY packages/db/package.json                ./packages/db/
COPY packages/shared/package.json            ./packages/shared/
COPY apps/api/package.json                   ./apps/api/

RUN npm ci

# Fuente
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Buildear desde el dir de la API (nest lee nest-cli.json relativo al CWD)
WORKDIR /app/apps/api
RUN npm run build

# Verificación: falla el build si no se generó el entry point
RUN test -f dist/main.js || (echo "ERROR: dist/main.js no fue generado" && exit 1)

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Solo prod deps del workspace hoisted
COPY --from=builder /app/node_modules         ./node_modules

# @prode/db es import type — erased en compilación, no se necesita en runtime
# El dist compilado es puro JS sin referencias a @prode/*
COPY --from=builder /app/apps/api/dist        ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
