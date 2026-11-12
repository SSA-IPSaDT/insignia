import type { ProblemDocument } from './types';

export const HEALTH_PROBLEMS: readonly ProblemDocument[] = [
    {
        code: 'DATABASE_UNAVAILABLE',
        slug: 'database-unavailable',
        title: 'База данных PostgreSQL недоступна',
        status: 503,
        category: 'health',
        categoryLabel: 'Мониторинг и доступность',
        summary:
            'Сервер API не может установить или поддержать стабильное соединение с PostgreSQL.',
        description:
            'Диагностическая проверка доступности базы данных (healthcheck) завершилась ошибкой. Запрос SELECT 1 или попытка чтения контракта из prisma_contract.marker не удались. Платформа переведена в защитный режим, так как операции с пользователями и организациями невозможны без слоя постоянства.',
        causes: [
            'Процесс PostgreSQL в docker-compose или на сервере остановлен или упал.',
            'Неверные параметры подключения в infra/env (DATABASE_HOST, DATABASE_PORT, DATABASE_PASSWORD).',
            'Превышен лимит активных клиентских подключений (max_connections).',
        ],
        remediation: [
            {
                actor: 'devops',
                title: 'Проверить состояние контейнера PostgreSQL',
                description:
                    'Выполните docker compose ps и проверьте логи контейнера postgres.',
            },
            {
                actor: 'devops',
                title: 'Проверить валидность секретов и переменных окружения',
                description:
                    'Убедитесь, что fnox корректно внедряет переменные базы данных в окружение запуска.',
            },
        ],
        architectureNotes: [
            'Проверка выполняется в изолированном фоновом пуле с коротким таймаутом (checkDatabase), не блокируя основной веб-сервер.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/database-unavailable',
            title: 'База данных PostgreSQL недоступна',
            status: 503,
            detail: 'База данных PostgreSQL недоступна.',
            instance: '/health',
            code: 'DATABASE_UNAVAILABLE',
            details: {
                services: {
                    database: 'unhealthy',
                    redis: 'healthy',
                    storage: 'healthy',
                },
            },
        },
        relatedEndpoints: ['GET /health'],
    },
    {
        code: 'CACHE_UNAVAILABLE',
        slug: 'cache-unavailable',
        title: 'Сервис кэширования Redis недоступен',
        status: 503,
        category: 'health',
        categoryLabel: 'Мониторинг и доступность',
        summary:
            'Сервер API не получил ответ PONG от Redis при выполнении проверки доступности кэша.',
        description:
            'Кэширующий слой и брокер очередей Redis не отвечает на ping-команды. Приводит к деградации производительности тяжелых выборок и задержкам обработки фоновых задач.',
        causes: [
            'Служба Redis остановлена или перегружена.',
            'Сетевой сбой при обращении к порту REDIS_PORT.',
        ],
        remediation: [
            {
                actor: 'devops',
                title: 'Перезапустить контейнер Redis',
                description:
                    'Проверьте доступность порта 6379 и объем свободной памяти Redis.',
            },
        ],
        architectureNotes: [
            'Redis используется для сессионного кэша, rate-limiting и временных блокировок.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/cache-unavailable',
            title: 'Сервис кэширования Redis недоступен',
            status: 503,
            detail: 'Сервис кэширования Redis недоступен.',
            instance: '/health',
            code: 'CACHE_UNAVAILABLE',
            details: {
                services: {
                    database: 'unhealthy',
                    redis: 'healthy',
                    storage: 'healthy',
                },
            },
        },
        relatedEndpoints: ['GET /health'],
    },
    {
        code: 'STORAGE_UNAVAILABLE',
        slug: 'storage-unavailable',
        title: 'Файловое объектное хранилище недоступно',
        status: 503,
        category: 'health',
        categoryLabel: 'Мониторинг и доступность',
        summary:
            'Хранилище медиафайлов и аватаров (S3/MinIO) не отвечает на запросы проверки доступности.',
        description:
            'Диагностическая проверка checkStorage завершилась неудачей. Пользователи не могут загружать или обновлять аватары профилей и вложения форм.',
        causes: [
            'Локальный инстанс MinIO или облачный S3-бакет недоступен.',
            'Истек срок действия ключей доступа STORAGE_SECRET_KEY.',
        ],
        remediation: [
            {
                actor: 'devops',
                title: 'Проверить доступность S3/MinIO эндпоинта',
                description:
                    'Убедитесь в доступности бакета и корректности прав IAM.',
            },
        ],
        architectureNotes: [
            'Файлы хранятся в изолированном S3-совместимом хранилище с генерацией presigned-ссылок.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/storage-unavailable',
            title: 'Файловое объектное хранилище недоступно',
            status: 503,
            detail: 'Файловое объектное хранилище недоступно.',
            instance: '/health',
            code: 'STORAGE_UNAVAILABLE',
            details: {
                services: {
                    database: 'unhealthy',
                    redis: 'healthy',
                    storage: 'healthy',
                },
            },
        },
        relatedEndpoints: ['GET /health'],
    },
    {
        code: 'SERVICES_UNAVAILABLE',
        slug: 'services-unavailable',
        title: 'Комплексная недоступность инфраструктурных сервисов',
        status: 503,
        category: 'health',
        categoryLabel: 'Мониторинг и доступность',
        summary:
            'Два или более критических инфраструктурных сервиса (БД, Redis, Storage) одновременно вышли из строя.',
        description:
            'Критический сбой инфраструктуры. Возникает, когда отказ затронул сразу несколько сервисов окружения. API полностью переходит в аварийный режим ожидания восстановления.',
        causes: [
            'Сетевая изоляция хоста, сбой Docker-сети или перезагрузка кластера.',
            'Массовое отключение инфраструктурных контейнеров.',
        ],
        remediation: [
            {
                actor: 'devops',
                title: 'Выполнить полный перезапуск compose-стека',
                description:
                    'Проверьте состояние всех контейнеров команды compose up -d и сетевой мост.',
            },
        ],
        architectureNotes: [
            'Эндпоинт GET /health вызывается внешними health-чекерами (Kubernetes probes, Docker healthcheck) для автоматического перезапуска подов.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/services-unavailable',
            title: 'Комплексная недоступность инфраструктурных сервисов',
            status: 503,
            detail: 'Комплексная недоступность инфраструктурных сервисов.',
            instance: '/health',
            code: 'SERVICES_UNAVAILABLE',
            details: {
                services: {
                    database: 'unhealthy',
                    redis: 'healthy',
                    storage: 'healthy',
                },
            },
        },
        relatedEndpoints: ['GET /health'],
    },
];
