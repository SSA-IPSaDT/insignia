# Docker & Контейнеризация (infra/docker)

Конфигурации контейнеризации и оркестрации Docker для платформы **Insignia**.

---

## 🎯 Назначение

- **Локальная разработка (Development)**: Запуск только необходимых внешних инфраструктурных сервисов (PostgreSQL) без оверхеда на контейнеризацию приложений (код приложений запускается локально через Bun).
- **Продакшен (Production)**: Многоэтапные образы на базе `oven/bun:1.4.4` для деплоя сервисов в изолированных контейнерах.

---

## 📁 Структура директории

- `docker.compose.yml` — Compose-файл для локальной инфраструктуры разработчика (PostgreSQL).
- `docker.compose.prod.yml` — Полный продакшен стек (`postgres`, `api`, `web`, `bot`).
- `Dockerfile.api` — Продакшен образ бэкенда (`apps/api` на базе Elysia и Bun).
- `Dockerfile.bot` — Продакшен образ Telegram-бота (`apps/bot` на Bun).
- `Dockerfile.web` — Продакшен образ SvelteKit (`apps/web` с `svelte-adapter-bun`).

---

## 🚀 Использование

### Локальная разработка: запуск базы данных

```bash
# Запуск контейнера PostgreSQL в фоновом режиме:
docker compose -f infra/docker/docker.compose.yml up -d

# Проверка статуса healthcheck:
docker compose -f infra/docker/docker.compose.yml ps

# Остановка:
docker compose -f infra/docker/docker.compose.yml down
```

### Сборка и тестирование продакшен-образов

> **Важно**: Сборка Dockerfile запускается из **корня монорепозитория**, так как контекст сборки требует доступа к `packages/*` и `infra/*`:

```bash
# Сборка API:
docker build -f infra/docker/Dockerfile.api -t insignia-api:latest .

# Сборка Web (SvelteKit):
docker build -f infra/docker/Dockerfile.web -t insignia-web:latest .

# Сборка Telegram-бота:
docker build -f infra/docker/Dockerfile.bot -t insignia-bot:latest .

# Запуск полного продакшен-стека:
docker compose -f infra/docker/docker.compose.prod.yml up -d --build
```
