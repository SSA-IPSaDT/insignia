# @insignia/tsconfig

Общие конфигурации TypeScript для всех проектов монорепозитория **Insignia**.

---

## 🎯 Назначение

Обеспечивает консистентные правила компиляции, строгий контроль типов и единообразные настройки для всех приложений (`apps/*`) и библиотек (`packages/*`).

---

## 📐 Ключевые опции компилятора

- `strict: true` — максимальный уровень статической проверки типов.
- `target: ESNext` & `module: Preserve` — использование современных возможностей ECMAScript.
- `moduleResolution: bundler` — поддержка современного разрешения модулей для сборщиков и рантайма Bun.
- `verbatimModuleSyntax: true` — требование явного синтаксиса `import type` для типов, предотвращающее появление лишнего сгенерированного JS-кода.
- `noUncheckedIndexedAccess: true` — безопасная работа с массивами и объектами (индексы возвращают `T | undefined`).

## 📦 Доступные пресеты

| Пресет           | Файл                           | Назначение                                                                                              |
| :--------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Базовый**      | `@insignia/tsconfig/base.json` | Изоморфный строгий конфиг без платформенных типов (для `@insignia/contracts`).                          |
| **Bun Backend**  | `@insignia/tsconfig/bun.json`  | Серверный конфиг с нативными типами Bun (для `apps/api`, `apps/bot`, `packages/database`, `infra/env`). |
| **Web Frontend** | `@insignia/tsconfig/web.json`  | Клиентский конфиг с типами DOM и браузерного API (для `apps/web`).                                      |

---

## 🚀 Использование в подпроектах

В `tsconfig.json` любого модуля монорепозитория указывается подходящий пресет:

```json
// apps/api/tsconfig.json или apps/bot/tsconfig.json:
{
    "extends": "@insignia/tsconfig/bun.json",
    "include": ["src/**/*"]
}

// packages/contracts/tsconfig.json:
{
    "extends": "@insignia/tsconfig/base.json",
    "include": ["src/**/*"]
}
```
