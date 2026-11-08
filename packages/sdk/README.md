# @insignia/sdk

Официальный клиентский изоморфный SDK платформы **Insignia**. Обеспечивает строго типизированное и безопасное сетевое взаимодействие сервисов (`apps/web`, `apps/admin`, `apps/bot`) с бэкендом (`apps/api`) на базе HTTP-клиента **Ky** и контрактов **@insignia/contracts**.

---

## 🎯 Назначение

- Предоставление высокоуровневого, удобного ООП-клиента в стиле `api.health.check()`, `api.user.get(...)` для всех сервисов платформы и внешних интеграций.
- Реализация **Result Pattern**: методы SDK возвращают предсказуемый союз `{ success: true, data } | { success: false, error }`, исключая необходимость перехвата сырых HTTP-исключений в бизнес-коде.
- Полная автономность: единственная внешняя зависимость в рантайме — библиотека **Ky**. Нулевая зависимость от Zod на клиенте (**Zero Zod in Client Bundle**).
- Автоматический резолвинг базового адреса подключения к API (`PUBLIC_API_URL`) в различных средах выполнения.

---

## 📐 Архитектурные особенности

1. **Изоморфность (Universal Runtime)**: Клиент работает одинаково надёжно как в браузере (SvelteKit Web / Mini App), так и в серверной среде Bun / Node.js (Telegram Bot, SvelteKit SSR).
2. **Динамический резолвинг URL**:
    - Поддерживает явную передачу `baseUrl` (`createInsigniaClient({ baseUrl: 'http://...' })`);
    - Поддерживает связку `host` + `port` с взаимоисключающей типизацией;
    - Автоматически считывает `process.env.PUBLIC_API_URL` / `Bun.env.PUBLIC_API_URL` при их наличии в среде.
3. **Двухуровневая аутентификация**:
    - `auth` — передача пользовательского JWT-токена в заголовок `Authorization: Bearer <token>`;
    - `signet` — передача межсервисного токена в фирменный заголовок `Insignia-Signet: <token>` для M2M-запросов.
4. **Интеграция с SSR (SvelteKit)**: Поддерживает передачу кастомного `fetch` (`event.fetch`) для сохранения контекста сессий и кук во время серверного рендеринга.
5. **Модульность на базе `BaseModule`**: Каждый доменный модуль (`HealthModule`, `UserModule`) изолирует свои маршруты и возвращает типизированные DTO.

---

## 🚀 Использование

### 1. Инициализация в браузере или боте

```typescript
import { createInsigniaClient } from '@insignia/sdk';

// Создание экземпляра клиента с указанием адреса или авторезолвингом
export const api = createInsigniaClient({
    baseUrl: 'http://localhost:51000',
});

// Проверка состояния системы (Result Pattern)
const result = await api.health.check();

if (result.success) {
    console.log(
        `Статус API: ${result.data.status}, аптайм: ${result.data.uptime} с`,
    );
} else {
    console.error(`Ошибка [${result.error.code}]: ${result.error.message}`);
}
```

### 2. Инициализация в SvelteKit SSR (`+page.server.ts`)

```typescript
import { PUBLIC_API_URL } from '$app/env/public';
import { createInsigniaClient } from '@insignia/sdk';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
    // В SSR передаем event.fetch для сквозной авторизации и инвалидации кеша
    const api = createInsigniaClient({ baseUrl: PUBLIC_API_URL, fetch });
    const result = await api.health.check();

    return { result };
};
```

### 3. Межсервисное взаимодействие (M2M) с токеном Signet

```typescript
import { createInsigniaClient } from '@insignia/sdk';

const api = createInsigniaClient({
    baseUrl: 'http://localhost:51000',
    signet: 'internal-service-secret-key',
});
```

---

## 🛡️ Обработка результатов и ошибок (Result Pattern)

Методы SDK **гарантированно никогда не выбрасывают исключений наружу (No Uncaught Exceptions)** — ни при ошибках сервера, ни при падении сети, ни при таймаутах. Все методы возвращают дискриминированное объединение `InsigniaSdkResult<TData, TCode>`.

### 1. Простая обработка в одну линию

Поля `code`, `message`, `status` и `type` присутствуют **всегда**:

```typescript
const res = await api.health.check();

if (res.success) {
    console.log('Статус:', res.data.status);
} else {
    // Единый доступ к ошибке без вложенных try/catch:
    console.error(
        `[${res.error.type}] HTTP ${res.error.status} (${res.error.code}): ${res.error.message}`,
    );
}
```

### 2. Четыре категории ошибок (`res.error.type`)

При необходимости точечной реакции поле `type` автоматически сужает тип ошибки в TypeScript:

| Категория (`type`) | `status`  | Описание и примеры кодов                                                                                             |
| :----------------- | :-------- | :------------------------------------------------------------------------------------------------------------------- |
| **`api`**          | `4xx/5xx` | Осознанный ответ бэкенда по контракту (`VALIDATION_ERROR`, `SERVICES_UNAVAILABLE`, `NOT_FOUND`). Включает `details`. |
| **`network`**      | `0`       | Сетевой сбой до связи с сервером (`TIMEOUT`, `OFFLINE`, `CONNECTION_REFUSED`, `ABORTED`). Включает `cause`.          |
| **`http`**         | `502/504` | Неконтрактный ответ прокси/шлюза (Nginx, Cloudflare, WAF: `BAD_GATEWAY`, `GATEWAY_TIMEOUT`). Включает `rawBody`.     |
| **`parse`**        | `200`     | Ошибка парсинга поврежденного JSON-ответа (`PARSE_ERROR`).                                                           |

```typescript
if (!res.success) {
    if (res.error.type === 'network') {
        // Показываем плашку «Проверьте подключение к интернету»
        showToast('Сеть недоступна, повторите позже');
    } else if (res.error.type === 'http') {
        // Ошибка инфраструктуры/прокси
        showToast('Сервис временно недоступен (шлюз 502/504)');
    } else if (res.error.type === 'api') {
        // Бизнес-ошибка от сервера
        showToast(`Ошибка API: ${res.error.message}`);
    }
}
```

---

## 🛠️ Разработка и сборка

```bash
# Проверка типов:
bun check

# Запуск тестов:
bun test tests

# Сборка дистрибутива:
bun run build

# Форматирование кода:
bun fmt
```
