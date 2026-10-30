---
name: insignia-conventions
description: Verifies adherence to Insignia code conventions including arrow functions, fail-fast env, and structured logging.
---

# Insignia Code Conventions

Скилл для проверки соответствия кодовой базы стандартам проекта Insignia.

## 📋 Обязательные соглашения

1. **Стрелочные функции повсеместно**:
    - Любые функции, методы и утилиты пишутся с использованием стрелочного синтаксиса:
        ```typescript
        // ✅ Правильно:
        export const calculateTotal = (items: Item[]): number => { ... };

        // ❌ Неправильно:
        export function calculateTotal(items: Item[]): number { ... }
        ```
    - Исключение: генераторы `function*`.

2. **Работа с переменными окружения (`@insignia/env`)**:
    - Никогда не использовать сырые `process.env` или `Bun.env` напрямую в сервисах.
    - Импортировать прокси-синглтон из `@insignia/env`:
        ```typescript
        import { apiEnv } from '@insignia/env';
        console.log(apiEnv.API_PORT);
        ```

3. **Логирование (`@insignia/logger`)**:
    - Использовать фабрику логгера с явным пространством имён:
        ```typescript
        import { createLogger } from '@insignia/logger';
        const logger = createLogger('api');
        logger.info('Сообщение', { data: 123 });
        ```

4. **HTTP-клиент (Ky)**:
    - Взаимодействие между клиентами (`apps/web`, `apps/bot`) и API осуществляется через Ky с типизацией:
        ```typescript
        const user = await api.get('users/me').json<UserDto>();
        ```

5. **Обязательное тестирование (`bun:test`)**:
    - Любая продуктовая логика, схемы контрактов, роуты и утилиты должны сопровождаться модульными тестами:
        ```typescript
        import { describe, expect, test } from 'bun:test';

        describe('User Module', () => {
            test('validates user DTO correctly', () => {
                expect(userDtoSchema.safeParse(data).success).toBe(true);
            });
        });
        ```
    - Запуск тестов: `bun test` или `moon run :test`.

6. **Секреты и локальная разработка (`fnox.local.toml`)**:
    - Локальные токены и переопределения переменных сохраняются через скрипт:
        ```bash
        bun run fnox:set BOT_TOKEN 123456:ABC-DEF
        ```
    - Запрещено коммитить секреты или сырые `.env` файлы в репозиторий.

7. **Избирательный запуск сервисов (Moonrepo)**:
    - Разработчик запускает только нужный для его роли стек:
        - `bun run dev:api` — только бэкенд API (`apps/api`).
        - `bun run dev:bot` — бот вместе с API (`apps/bot` + `apps/api`).
        - `bun run dev:web` — веб-интерфейс вместе с API (`apps/web` + `apps/api`).
        - `bun run dev:all` — весь стек целиком.
