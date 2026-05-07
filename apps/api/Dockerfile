FROM node:22-alpine AS builder
WORKDIR /app

# Workspace manifests (layer cache)
COPY package.json package-lock.json          ./
COPY packages/db/package.json                ./packages/db/
COPY packages/shared/package.json            ./packages/shared/
COPY apps/api/package.json                   ./apps/api/

RUN npm ci

# Source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build desde el directorio de la API para que nest-cli.json lo encuentre
RUN cd apps/api && npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules hoisted del workspace
COPY --from=builder /app/node_modules          ./node_modules

# Paquetes internos (los symlinks de @prode/db y @prode/shared apuntan acá)
COPY --from=builder /app/packages/db           ./packages/db
COPY --from=builder /app/packages/shared       ./packages/shared

# Output del build
COPY --from=builder /app/apps/api/dist         ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
