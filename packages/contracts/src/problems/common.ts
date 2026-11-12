import type { ProblemDocument } from './types';

export const COMMON_PROBLEMS: readonly ProblemDocument[] = [
    {
        code: 'BAD_REQUEST',
        slug: 'bad-request',
        title: 'Некорректный синтаксис запроса',
        status: 400,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Сервер не смог разобрать синтаксис входящего HTTP-запроса (например, повреждённый JSON в теле запроса).',
        description:
            'Данная ошибка возникает на ранней фазе жизненного цикла запроса в Elysia, когда входящий сетевой поток (payload) содержит синтаксически невалидный JSON, некорректную кодировку или оборванные байты данных. В отличие от 422 VALIDATION_ERROR, при этой ошибке структура данных даже не доходит до проверки Zod-схем контракта.',
        causes: [
            'Тело запроса содержит синтаксически некорректный JSON (пропущенная скобка, запятая, одинарные кавычки вместо двойных).',
            'Заголовок Content-Type указывает application/json, но тело запроса пустое или содержит бинарные данные.',
            'Обрыв сетевого соединения в процессе передачи чанков HTTP-тела.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Проверить сериализацию JSON',
                description:
                    'Убедитесь, что клиент использует валидный JSON-сериализатор (JSON.stringify) и передает заголовок Content-Type: application/json; charset=utf-8.',
            },
            {
                actor: 'developer',
                title: 'Использовать типизированный SDK',
                description:
                    'Используйте клиентский транспорт @insignia/sdk, который автоматически сериализует тела запросов и обрабатывает примитивы BigInt и Temporal.',
            },
        ],
        architectureNotes: [
            'В Insignia ошибка перехватывается глобальным плагином errorPlugin в ветке code === "PARSE".',
            'По ADR-0008 для передачи 64-битных целых чисел (BigInt) и Temporal-дат в JSON используются строковые представления.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/bad-request',
            title: 'Некорректный синтаксис запроса',
            status: 400,
            detail: 'Некорректный синтаксис запроса.',
            instance: '/',
            code: 'BAD_REQUEST',
        },
        relatedEndpoints: ['* (любые эндпоинты, принимающие HTTP Body)'],
    },
    {
        code: 'VALIDATION_ERROR',
        slug: 'validation-error',
        title: 'Ошибка валидации входящих данных',
        status: 422,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Входящие параметры пути, query-параметры, заголовки или тело запроса не соответствуют строгим Zod-контрактам платформы.',
        description:
            'Ошибка возвращается, когда синтаксис JSON корректен, но семантика данных нарушает контракты (@insignia/contracts). Валидатор Elysia сопоставляет данные со схемой эндпоинта и в случае расхождения возвращает детализированный словарь полей fields, где ключом является имя проблемного атрибута, а значением — локализованное человекопонятное объяснение.',
        causes: [
            'Обязательное поле отсутствует (например, firstName при регистрации/создании).',
            'Значение поля выходит за границы допустимого диапазона (длина строки меньше min или больше max, число меньше 1).',
            'Формат строки не соответствует регулярному выражению (некорректный username, email или UUIDv7 идентификатор).',
            'Передано значение неверного типа (например, строка вместо целого числа).',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Подсветить поля в пользовательском интерфейсе',
                description:
                    'Используйте карту fields из объекта ответа error.details.fields для вывода сообщений об ошибках под соответствующими инпутами формы.',
            },
            {
                actor: 'developer',
                title: 'Сверить типы со схемами в @insignia/contracts',
                description:
                    'Импортируйте валидаторы и типы из @insignia/contracts для валидации форм на стороне клиента (SvelteKit) до выполнения сетевого запроса.',
            },
        ],
        architectureNotes: [
            'Реализует концепцию Defense-in-Depth (ADR-0010): строгая Zod-валидация на внешнем рубеже защищает базу данных от некорректных вставок.',
            'Глобальный плагин errorPlugin автоматически очищает пути валидатора (например, /body/firstName -> firstName), формируя плоскую карту полей.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/validation-error',
            title: 'Ошибка валидации входящих данных',
            status: 422,
            detail: 'Ошибка валидации входящих данных.',
            instance: '/v1/users',
            code: 'VALIDATION_ERROR',
            invalidParams: [
                {
                    name: 'firstName',
                    reason: 'Имя обязательно для заполнения и не должно превышать 64 символа.',
                },
                {
                    name: 'email',
                    reason: 'Некорректный адрес электронной почты.',
                },
            ],
        },
        relatedEndpoints: [
            '* (любые эндпоинты со схемами body, query, params или headers)',
        ],
    },
    {
        code: 'UNAUTHORIZED',
        slug: 'unauthorized',
        title: 'Требуется аутентификация',
        status: 401,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Запрос к защищенному ресурсу выполнен без предоставления действующих учетных данных (сессионных cookie или токена).',
        description:
            'Запрашиваемый ресурс требует подтверждения личности вызывающей стороны. Сервер отклонил запрос из-за отсутствия токена авторизации, истечения срока действия сессии или недействительной криптографической подписи.',
        causes: [
            'Не переданы сессионные куки или заголовок авторизации.',
            'Срок действия сессии или JWT-токена истек.',
            'Подпись токена скомпрометирована или сформирована недействительным секретным ключом.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Перенаправить на экран авторизации',
                description:
                    'При получении статуса 401 клиентское приложение должно инициировать повторный вход или обновление сессии.',
            },
            {
                actor: 'developer',
                title: 'Проверить конфигурацию cookie и credentials',
                description:
                    'Убедитесь, что клиентский fetch отправляет credentials: "include" для передачи HTTP-only cookie.',
            },
        ],
        architectureNotes: [
            'В Insignia межсервисная авторизация выполняется через токен в заголовке Insignia-Signet, а клиентская — через защищенные cookie.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/unauthorized',
            title: 'Требуется аутентификация',
            status: 401,
            detail: 'Требуется аутентификация.',
            instance: '/v1/users/me',
            code: 'UNAUTHORIZED',
        },
        relatedEndpoints: ['/v1/users/me', '/v1/admin/*'],
    },
    {
        code: 'FORBIDDEN',
        slug: 'forbidden',
        title: 'Доступ запрещён',
        status: 403,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Личность пользователя подтверждена, но у него недостаточно прав для выполнения данной операции над ресурсом.',
        description:
            'В отличие от 401 Unauthorized, при статусе 403 сервер точно знает, кто выполняет запрос, но политика разграничения доступа (RBAC/ABAC) запрещает доступ к запрашиваемому ресурсу или действию.',
        causes: [
            'Пользователь не обладает ролью администратора для выполнения административных операций.',
            'Пользователь пытается получить доступ или изменить сущность чужой организации.',
            'Учетная запись или организация временно заблокирована/приостановлена.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Уведомить пользователя об ограничении прав',
                description:
                    'Отобразить информационное сообщение о том, что для совершения операции требуются повышенные права доступа.',
            },
            {
                actor: 'admin',
                title: 'Проверить роли и права доступа в админ-панели',
                description:
                    'Администратор организации может выдать требуемую роль в настройках участников.',
            },
        ],
        architectureNotes: [
            'Ограничения доступа изолируют данные организаций по принципу строгой мультитенантности.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/forbidden',
            title: 'Доступ запрещён',
            status: 403,
            detail: 'Доступ запрещён.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'FORBIDDEN',
        },
        relatedEndpoints: ['/v1/organizations/:id/admin', '/v1/admin/*'],
    },
    {
        code: 'NOT_FOUND',
        slug: 'not-found',
        title: 'Ресурс не найден',
        status: 404,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Запрашиваемый маршрут API не существует, либо целевая сущность отсутствует в хранилище данных.',
        description:
            'Базовая инфраструктурная ошибка 404 возвращается, когда клиент обратился по несуществующему URL-маршруту API, либо доменный сервис не нашел сущность по предоставленному идентификатору и не зарегистрировал специализированный доменный код ошибки.',
        causes: [
            'Опечатка в URL или метод HTTP (GET вместо POST).',
            'Запись с указанным идентификатором была физически или мягко удалена (soft-delete).',
            'Идентификатор относится к другой организации или базе данных.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Проверить корректность адреса и параметров',
                description:
                    'Убедитесь в правильности пути запроса и актуальности идентификатора сущности.',
            },
            {
                actor: 'developer',
                title: 'Свериться с документацией Scalar',
                description:
                    'Проверьте список актуальных маршрутов на интерактивном портале /docs.',
            },
        ],
        architectureNotes: [
            'В Insignia используется мягкое удаление (soft delete) через поле deletedAt. Записи, помеченные как удаленные, автоматически фильтруются через предикат activeOnly и возвращают 404.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/not-found',
            title: 'Ресурс не найден',
            status: 404,
            detail: 'Ресурс не найден.',
            instance: '/v1/users/unknown',
            code: 'NOT_FOUND',
        },
        relatedEndpoints: ['* (любые несуществующие маршруты или сущности)'],
    },
    {
        code: 'CONFLICT',
        slug: 'conflict',
        title: 'Конфликт состояния данных',
        status: 409,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Запрос не может быть выполнен из-за конфликта с текущим состоянием целевого ресурса (например, нарушение уникальности).',
        description:
            'Данный статус возвращается в ситуациях, когда операция нарушает инварианты целостности данных, например, попытка зарегистрировать пользователя или организацию с уже занятым уникальным атрибутом (username, email, phone, slug).',
        causes: [
            'Нарушение уникального индекса базы данных (SQLSTATE 23505 unique_violation).',
            'Параллельная модификация ресурса другой транзакцией или конкурентным запросом.',
            'Попытка перевести сущность в состояние, несовместимое с её текущим жизненным циклом.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Предложить изменить уникальный атрибут',
                description:
                    'Попросите пользователя выбрать другое имя пользователя, email или slug.',
            },
            {
                actor: 'developer',
                title: 'Использовать специализированный доменный код',
                description:
                    'Для пользователей используйте USER_ALREADY_EXISTS, для организаций — ORGANIZATION_ALREADY_EXISTS.',
            },
        ],
        architectureNotes: [
            'Уникальные индексы в PostgreSQL создаются как частичные с учетом мягкого удаления: CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/conflict',
            title: 'Конфликт состояния данных',
            status: 409,
            detail: 'Конфликт состояния данных.',
            instance: '/v1/users',
            code: 'CONFLICT',
        },
        relatedEndpoints: [
            'POST /v1/users',
            'PATCH /v1/users/:id',
            'POST /v1/organizations',
        ],
    },
    {
        code: 'INTERNAL_SERVER_ERROR',
        slug: 'internal-server-error',
        title: 'Внутренняя непредвиденная ошибка сервера',
        status: 500,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'На сервере произошел непредвиденный сбой выполнения, не связанный с некорректностью запроса клиента.',
        description:
            'Универсальный fallback для необработанных исключений времени выполнения (unhandled runtime exceptions, panics). Сервер скрывает внутренние детали реализации (стек вызовов, токены, системные пути) от клиента из соображений информационной безопасности (RFC 9457 Section 5), записывая полный лог в файл logs/combined.log.',
        causes: [
            'Необработанное исключение в коде бизнес-логики или контроллера.',
            'Сбой низкоуровневых операций ввода-вывода (файловая система, сокеты).',
            'Нехватка оперативной памяти процесса (OOM) или аппаратный сбой.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Повторить запрос позже',
                description:
                    'Отобразите пользователю сообщение о временной технической неполадке и предложите повторить действие через несколько минут.',
            },
            {
                actor: 'developer',
                title: 'Исследовать логи приложения',
                description:
                    'Изучите логи @insignia/logger в директории logs/ и локализуйте строку возникновения исключения.',
            },
            {
                actor: 'devops',
                title: 'Проверить системный мониторинг и состояние процесса',
                description:
                    'Убедитесь в стабильности процесса Bun и отсутствии утечек памяти в systemd/Docker.',
            },
        ],
        architectureNotes: [
            'В Insignia архитектурно запрещено утекать внутренний стек вызовов в HTTP-ответ клиенту. Все подробности сохраняются строго в файловых логах.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/internal-server-error',
            title: 'Внутренняя непредвиденная ошибка сервера',
            status: 500,
            detail: 'Внутренняя непредвиденная ошибка сервера.',
            instance: '/',
            code: 'INTERNAL_SERVER_ERROR',
        },
        relatedEndpoints: ['* (любые эндпоинты в случае непредвиденных сбоев)'],
    },
    {
        code: 'NOT_IMPLEMENTED',
        slug: 'not-implemented',
        title: 'Запрашиваемый функционал ещё не реализован',
        status: 501,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Маршрут объявлен в контрактах и зарегистрирован в API, но его серверная реализация находится в разработке.',
        description:
            'Статус 501 возвращается для эндпоинтов-заглушек в рамках поэтапного внедрения сквозных пользовательских сценариев (Vertical Slice). Позволяет клиентам и боту видеть стабильный контракт в OpenAPI/Scalar и тестировать обработку ошибок задолго до выкатки финальной бизнес-логики.',
        causes: [
            'Эндпоинт спроектирован в @insignia/contracts, но логика в модуле API еще не написана.',
            'Функционал запланирован на следующий релиз платформы.',
        ],
        remediation: [
            {
                actor: 'developer',
                title: 'Реализовать контроллер и сервис',
                description:
                    'Напишите реализацию метода сервиса и контроллера, покройте тестами bun:test и снимите статус 501.',
            },
        ],
        architectureNotes: [
            'Все запланированные маршруты контрактов объявляются с поддержкой 501 в standardEndpointResponses (ADR-0009).',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/not-implemented',
            title: 'Запрашиваемый функционал ещё не реализован',
            status: 501,
            detail: 'Запрашиваемый функционал ещё не реализован.',
            instance: '/',
            code: 'NOT_IMPLEMENTED',
        },
        relatedEndpoints: [
            '/v1/organizations/*',
            '/v1/users/accounts/telegram/*',
        ],
    },
    {
        code: 'SERVICE_UNAVAILABLE',
        slug: 'service-unavailable',
        title: 'Сервис или база данных временно недоступны',
        status: 503,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Сервер временно не может обработать запрос из-за недоступности критически важной зависимости (PostgreSQL, Redis, Storage).',
        description:
            'Ошибка возникает, когда пул соединений PostgreSQL исчерпан, сервер БД не отвечает, упал процесс Redis или внешнее S3-хранилище. Глобальный плагин errorPlugin перехватывает ошибки драйвера базы данных (28P01, ECONNREFUSED, SqlQueryError) и трансформирует их в статус 503, предотвращая падение приложения с 500.',
        causes: [
            'Служба PostgreSQL остановлена или перезапускается.',
            'Исчерпан пул соединений (connection pool exhaustion) к базе данных.',
            'Ошибка авторизации при подключении к БД (SQLSTATE 28P01 invalid_password).',
            'Сетевая изоляция или отказ локального UNIX Domain сокета / TCP-порта.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Повторить запрос с экспоненциальной задержкой',
                description:
                    'Клиентский SDK может автоматически повторить запрос через Retry-After секунд.',
            },
            {
                actor: 'devops',
                title: 'Проверить состояние PostgreSQL и сопутствующих сервисов',
                description:
                    'Проверьте статус контейнера compose ps и выполните ping базы данных.',
            },
        ],
        architectureNotes: [
            'Мониторинг доступности зависимостей выполняется через ручку GET /health, возвращающую детальный срез services: { database, redis, storage }.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/service-unavailable',
            title: 'Сервис или база данных временно недоступны',
            status: 503,
            detail: 'Сервис или база данных временно недоступны.',
            instance: '/health',
            code: 'SERVICE_UNAVAILABLE',
        },
        relatedEndpoints: [
            'GET /health',
            '* (любые эндпоинты, требующие обращения к PostgreSQL)',
        ],
    },
    {
        code: 'DATABASE_ERROR',
        slug: 'database-error',
        title: 'Ошибка слоя постоянства данных',
        status: 503,
        category: 'common',
        categoryLabel: 'Общие ошибки API',
        summary:
            'Низкоуровневая ошибка при выполнении SQL-запроса или транзакции в PostgreSQL.',
        description:
            'Обозначает сбой при обращении к базе данных, возникший после успешного установления соединения (например, взаимоблокировка транзакций deadlock, таймаут выполнения запроса statement_timeout или сбой чтения маркера контракта Prisma 8).',
        causes: [
            'Таймаут выполнения тяжелого поискового запроса в полнотекстовом поиске tsquery.',
            'Deadlock двух конкурентных транзакций при обновлении связанных сущностей.',
            'Сбой чтения маркера схемы prisma_contract.marker.',
        ],
        remediation: [
            {
                actor: 'developer',
                title: 'Оптимизировать SQL-запрос или транзакцию',
                description:
                    'Проверьте наличие индексов и уменьшите время удержания строковых блокировок.',
            },
            {
                actor: 'devops',
                title: 'Проверить размер пула и настройки PostgreSQL',
                description:
                    'Убедитесь в достаточных ресурсах shared_buffers и work_mem.',
            },
        ],
        architectureNotes: [
            'В Insignia используется Prisma 8 с клиентским движком @prisma/orm-framework и прямым доступом через db.orm.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/database-error',
            title: 'Ошибка слоя постоянства данных',
            status: 503,
            detail: 'Ошибка слоя постоянства данных.',
            instance: '/',
            code: 'DATABASE_ERROR',
        },
        relatedEndpoints: ['* (любые эндпоинты взаимодействия с БД)'],
    },
];
