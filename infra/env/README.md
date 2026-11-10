# @insignia/env

Пакет декларативной схемы, типизации и строгой валидации переменных окружения платформы **Insignia**.

---

## 🎯 Назначение

- Устранение прямых обращений к нетипизированным `process.env` или `Bun.env` по всей кодовой базе.
- Валидация обязательных переменных на этапе старта сервиса с выводом сообщений об ошибках при отсутствующих ключах.
- Строгая типизация через схемы **Zod**.
- Ленивая валидация через прокси (`createLazyEnv`), исключающая падения сервисов из-за переменных соседних приложений.

---

## 🚀 Использование в сервисах

```typescript
import { baseEnvSchema, createLazyEnv, parseEnv } from '@insignia/env';

// Валидация с немедленным вызовом:
const config = parseEnv(baseEnvSchema);

// Либо ленивый прокси-синглтон:
const env = createLazyEnv(baseEnvSchema);
console.log(env.NODE_ENV);
```

### 🌐 Публичные переменные и Vite / SvelteKit (`@insignia/env/public`)

Для фронтенд-приложений (`apps/app`, `apps/admin`), использующих Vite и SvelteKit, предоставляется подмодуль `@insignia/env/public`:

```typescript
import { populateProcessEnv, publicEnvSchema } from '@insignia/env/public';

// Проброс в process.env для Vite:
populateProcessEnv(env);
```
