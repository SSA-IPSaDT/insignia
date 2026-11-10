# =============================================================================
# Production Dockerfile for @insignia/app (SvelteKit with svelte-adapter-bun)
# =============================================================================

FROM oven/bun:1.4.4 AS base
WORKDIR /app

# -----------------------------------------------------------------------------
# 1. Загрузка всех зависимостей (включая dev-зависимости для сборки Vite)
# -----------------------------------------------------------------------------
FROM base AS deps
COPY package.json bun.lock bunfig.toml ./
COPY apps/app/package.json ./apps/app/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/logger/package.json ./packages/logger/
COPY infra/env/package.json ./infra/env/

RUN bun install --frozen-lockfile

# -----------------------------------------------------------------------------
# 2. Сборка продакшен-бандла SvelteKit
# -----------------------------------------------------------------------------
FROM deps AS builder
COPY packages/ ./packages/
COPY infra/env/ ./infra/env/
COPY apps/app/ ./apps/app/
COPY tsconfig.json ./

WORKDIR /app/apps/app
RUN bun run build

# -----------------------------------------------------------------------------
# 3. Финальный легковесный образ для запуска
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app/apps/app

ENV NODE_ENV=production
ENV PORT=3000

# Копируем скомпилированное приложение SvelteKit (вывод svelte-adapter-bun)
COPY --from=builder /app/apps/app/build ./build
COPY --from=builder /app/apps/app/package.json ./package.json
COPY --from=deps /app/node_modules /app/node_modules

USER bun
EXPOSE 3000

CMD ["bun", "./build/index.js"]
