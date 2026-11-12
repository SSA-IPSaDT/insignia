import type { ProblemDocument } from './types';

export const TELEGRAM_PROBLEMS: readonly ProblemDocument[] = [
    {
        code: 'TELEGRAM_ACCOUNT_NOT_FOUND',
        slug: 'telegram-account-not-found',
        title: 'Аккаунт Telegram не найден',
        status: 404,
        category: 'telegram',
        categoryLabel: 'Интеграция с Telegram',
        summary:
            'Привязанный аккаунт Telegram с указанным идентификатором не найден в системе.',
        description:
            'Возникает при попытке получить информацию о привязке Telegram к профилю пользователя по уникальному идентификатору записи (UUIDv7) или при операции отвязки аккаунта, если запись отсутствует или была удалена.',
        causes: [
            'Указан неверный идентификатор привязки Telegram.',
            'Аккаунт Telegram был ранее отвязан от пользователя.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Повторить авторизацию через Telegram Mini App',
                description:
                    'Выполните повторный вход через Telegram WebApp для автоматической синхронизации профиля.',
            },
        ],
        architectureNotes: [
            'Связь между пользователем и Telegram-аккаунтом хранится в таблице TelegramAccount с каскадным удалением при удалении пользователя.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/telegram-account-not-found',
            title: 'Аккаунт Telegram не найден',
            status: 404,
            detail: 'Аккаунт Telegram не найден.',
            instance:
                '/v1/users/accounts/telegram/01931a2c-7b00-7000-8000-000000000001',
            code: 'TELEGRAM_ACCOUNT_NOT_FOUND',
        },
        relatedEndpoints: [
            'GET /v1/users/accounts/telegram/:id',
            'DELETE /v1/users/accounts/telegram/:id',
        ],
    },
    {
        code: 'TELEGRAM_ACCOUNT_ALREADY_EXISTS',
        slug: 'telegram-account-already-exists',
        title: 'Аккаунт Telegram уже привязан к другому пользователю',
        status: 409,
        category: 'telegram',
        categoryLabel: 'Интеграция с Telegram',
        summary:
            'Попытка привязать Telegram ID, который уже зарегистрирован за другим пользователем платформы.',
        description:
            'В Insignia действует строгое правило однозначности: один числовой идентификатор Telegram (64-битный telegramId) может быть привязан только к одному пользователю платформы. Конфликт возникает, если пользователь пытается привязать Telegram, который уже связан с другой учетной записью.',
        causes: [
            'Пользователь вошел в Telegram под другим профилем, который уже имеет аккаунт в Insignia.',
            'Попытка связать один Telegram-аккаунт с двумя разными рабочими профилями.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Войти под существующей учетной записью',
                description:
                    'Используйте существующую учетную запись, связанную с данным Telegram, либо отвяжите аккаунт в настройках старого профиля.',
            },
        ],
        architectureNotes: [
            'Уникальность контролируется уникальным индексом на поле telegram_id в схеме TelegramAccount.',
            'Идентификаторы Telegram представлены 64-битными целыми числами (BigInt) и валидируются схемой telegramIdSchema.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/telegram-account-already-exists',
            title: 'Аккаунт Telegram уже привязан к другому пользователю',
            status: 409,
            detail: 'Аккаунт Telegram уже привязан к другому пользователю.',
            instance:
                '/v1/users/accounts/telegram/01931a2c-7b00-7000-8000-000000000001',
            code: 'TELEGRAM_ACCOUNT_ALREADY_EXISTS',
        },
        relatedEndpoints: ['POST /v1/users/accounts/telegram/sync'],
    },
    {
        code: 'TELEGRAM_SYNC_FAILED',
        slug: 'telegram-sync-failed',
        title: 'Не удалось синхронизировать данные аккаунта Telegram',
        status: 502,
        category: 'telegram',
        categoryLabel: 'Интеграция с Telegram',
        summary:
            'Сбой взаимодействия с серверами Telegram Bot API или ошибка транзакции синхронизации профиля.',
        description:
            'Возникает при вызове POST /v1/users/accounts/telegram/sync, если бэкенд не смог обновить метаданные пользователя (username, аватар, имя, язык) на основе данных сессии Telegram WebApp.',
        causes: [
            'Недоступность серверов Telegram Bot API при проверке данных.',
            'Таймаут сетевого соединения при скачивании или обновлении аватара.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Повторить попытку синхронизации',
                description: 'Попробуйте перезапустить Telegram Mini App.',
            },
            {
                actor: 'developer',
                title: 'Проверить сетевой доступ к api.telegram.org',
                description:
                    'Убедитесь, что бэкенд имеет исходящий доступ к серверам Telegram и корректный токен бота.',
            },
        ],
        architectureNotes: [
            'Синхронизация профиля обновляет базовые атрибуты User и связь TelegramAccount в единой транзакции.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/telegram-sync-failed',
            title: 'Не удалось синхронизировать данные аккаунта Telegram',
            status: 502,
            detail: 'Не удалось синхронизировать данные аккаунта Telegram.',
            instance:
                '/v1/users/accounts/telegram/01931a2c-7b00-7000-8000-000000000001',
            code: 'TELEGRAM_SYNC_FAILED',
        },
        relatedEndpoints: ['POST /v1/users/accounts/telegram/sync'],
    },
    {
        code: 'TELEGRAM_AUTH_INVALID',
        slug: 'telegram-auth-invalid',
        title: 'Недействительные данные авторизации Telegram (initData)',
        status: 401,
        category: 'telegram',
        categoryLabel: 'Интеграция с Telegram',
        summary:
            'Криптографическая подпись данных Telegram WebApp (initData) не прошла валидацию секретным ключом бота.',
        description:
            'Безопасность аутентификации Telegram Mini App базируется на проверке HMAC-SHA256 подписи строки initData. Если данные были подделаны, переданы от другого бота или время жизни строки истекло, сервер отклоняет запрос.',
        causes: [
            'Строка initData передана в искаженном виде или с нарушением порядка ключей.',
            'Токен Telegram-бота на сервере не совпадает с ботом, открывшим WebApp.',
            'Срок валидности auth_date истек (превышен допустимый порог в 24 часа).',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Перезапустить WebApp внутри Telegram',
                description:
                    'Закройте и откройте Mini App заново, чтобы клиент Telegram сгенерировал свежую строку initData.',
            },
            {
                actor: 'developer',
                title: 'Проверить переменную TELEGRAM_BOT_TOKEN',
                description:
                    'Сверьте токен бота в infra/env с настройками в @BotFather.',
            },
        ],
        architectureNotes: [
            'Проверка подписи initData производится по официальному алгоритму Telegram: вычисление SHA256 от токена бота и валидация HMAC-хеша параметров.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/telegram-auth-invalid',
            title: 'Недействительные данные авторизации Telegram (initData)',
            status: 401,
            detail: 'Недействительные данные авторизации Telegram (initData).',
            instance:
                '/v1/users/accounts/telegram/01931a2c-7b00-7000-8000-000000000001',
            code: 'TELEGRAM_AUTH_INVALID',
        },
        relatedEndpoints: [
            'POST /v1/users/accounts/telegram/sync',
            'POST /v1/auth/telegram',
        ],
    },
    {
        code: 'TELEGRAM_ACCOUNT_DETACH_FAILED',
        slug: 'telegram-account-detach-failed',
        title: 'Не удалось отвязать аккаунт Telegram',
        status: 500,
        category: 'telegram',
        categoryLabel: 'Интеграция с Telegram',
        summary:
            'Сбой при попытке удалить связь между профилем пользователя и Telegram-аккаунтом.',
        description:
            'Возникает при выполнении DELETE /v1/users/accounts/telegram/:id, если отвязка заблокирована правилами безопасности (например, Telegram является единственным методом входа пользователя без установленного пароля или email).',
        causes: [
            'Telegram — единственный способ аутентификации пользователя в системе.',
            'Ошибка транзакции при очистке привязки внешнего сервиса.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Установить альтернативный способ входа',
                description:
                    'Привяжите email или установите пароль перед отвязкой Telegram-аккаунта.',
            },
        ],
        architectureNotes: [
            'Правило безопасности запрещает создание аккаунтов-«сирот», не имеющих ни одного действующего способа входа.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/telegram-account-detach-failed',
            title: 'Не удалось отвязать аккаунт Telegram',
            status: 500,
            detail: 'Не удалось отвязать аккаунт Telegram.',
            instance:
                '/v1/users/accounts/telegram/01931a2c-7b00-7000-8000-000000000001',
            code: 'TELEGRAM_ACCOUNT_DETACH_FAILED',
        },
        relatedEndpoints: ['DELETE /v1/users/accounts/telegram/:id'],
    },
];
