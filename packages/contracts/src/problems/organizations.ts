import type { ProblemDocument } from './types';

export const ORGANIZATION_PROBLEMS: readonly ProblemDocument[] = [
    {
        code: 'ORGANIZATION_NOT_FOUND',
        slug: 'organization-not-found',
        title: 'Организация не найдена',
        status: 404,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Запрашиваемая организация не существует в системе или была удалена.',
        description:
            'Возникает при попытке получить профиль организации по UUIDv7 идентификатору или по публичному URL-имени (slug), если активная запись с такими реквизитами не найдена в таблице Organization.',
        causes: [
            'Указан некорректный идентификатор или slug организации.',
            'Организация была удалена или переведена в архив.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Проверить корректность адреса организации',
                description: 'Убедитесь в правильности slug в URL-адресе.',
            },
        ],
        architectureNotes: [
            'Организации являются корневыми сущностями мультитенантности: все формы, участники и проекты изолируются по organizationId.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-not-found',
            title: 'Организация не найдена',
            status: 404,
            detail: 'Организация не найдена.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_NOT_FOUND',
        },
        relatedEndpoints: [
            'GET /v1/organizations/:id',
            'GET /v1/organizations/by-slug/:slug',
        ],
    },
    {
        code: 'ORGANIZATION_ALREADY_EXISTS',
        slug: 'organization-already-exists',
        title: 'Организация с таким именем уже существует',
        status: 409,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Попытка зарегистрировать организацию с наименованием, которое уже занято в системе.',
        description:
            'Возникает при создании новой организации через POST /v1/organizations, если указанное официальное или коммерческое название конфликтует с существующей активной организацией.',
        causes: [
            'Введенное название организации полностью совпадает с зарегистрированной организацией.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Выбрать уникальное наименование',
                description:
                    'Укажите более специфичное название для создаваемой организации.',
            },
        ],
        architectureNotes: [
            'Контроль уникальности предотвращает путаницу между компаниями в публичных каталогах и формах.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-already-exists',
            title: 'Организация с таким именем уже существует',
            status: 409,
            detail: 'Организация с таким именем уже существует.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_ALREADY_EXISTS',
        },
        relatedEndpoints: ['POST /v1/organizations'],
    },
    {
        code: 'ORGANIZATION_SLUG_TAKEN',
        slug: 'organization-slug-taken',
        title: 'Указанный slug уже занят другой организацией',
        status: 409,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Желаемый короткий идентификатор в URL (slug) уже используется другой организацией.',
        description:
            'URL-идентификатор организации (slug) служит публичным адресом для страниц и форм компании (например, insignia.app/org/:slug). Он обязан быть уникальным во всей платформе среди активных организаций.',
        causes: [
            'Выбранный slug уже зарегистрирован за другой компанией.',
            'Slug содержит зарезервированное системное слово (admin, api, auth, settings).',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Подобрать свободный slug',
                description:
                    'Используйте латинские буквы, цифры и дефис для формирования уникального адреса.',
            },
        ],
        architectureNotes: [
            'Схема базы данных содержит уникальный индекс organizations_slug_active_unique с фильтром deleted_at IS NULL.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-slug-taken',
            title: 'Указанный slug уже занят другой организацией',
            status: 409,
            detail: 'Указанный slug уже занят другой организацией.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_SLUG_TAKEN',
        },
        relatedEndpoints: [
            'POST /v1/organizations',
            'PATCH /v1/organizations/:id',
        ],
    },
    {
        code: 'ORGANIZATION_LIMIT_REACHED',
        slug: 'organization-limit-reached',
        title: 'Превышен лимит на количество создаваемых организаций',
        status: 403,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Текущий пользователь достиг максимального разрешенного количества организаций, которыми он может владеть.',
        description:
            'В модели пользователя User атрибут maxOrganizationCanCreate (по умолчанию 3, максимум 8) ограничивает максимальное число активных организаций, созданных одним пользователем. Если лимит исчерпан, сервер отклоняет создание новой организации.',
        causes: [
            'Пользователь исчерпал персональную квоту на создание организаций.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Удалить неиспользуемую организацию или повысить тариф',
                description:
                    'Передайте владение существующей организацией или обратитесь к администратору для расширения квоты.',
            },
            {
                actor: 'admin',
                title: 'Увеличить лимит в профиле пользователя',
                description:
                    'Администратор платформы может увеличить maxOrganizationCanCreate вплоть до 8 через админ-панель.',
            },
        ],
        architectureNotes: [
            'Ограничение фиксируется на двух уровнях: Zod-валидатором max(8) и декларативным @@check в схеме PostgreSQL.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-limit-reached',
            title: 'Превышен лимит на количество создаваемых организаций',
            status: 403,
            detail: 'Превышен лимит на количество создаваемых организаций.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_LIMIT_REACHED',
        },
        relatedEndpoints: ['POST /v1/organizations'],
    },
    {
        code: 'ORGANIZATION_SUSPENDED',
        slug: 'organization-suspended',
        title: 'Деятельность организации приостановлена',
        status: 403,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Доступ к операциям в рамках организации временно заблокирован администратором платформы.',
        description:
            'Когда статус организации изменен на suspended, любые операции создания и модификации ресурсов внутри этого тенанта (формы, вопросы, приглашения) блокируются для всех её участников.',
        causes: [
            'Организация заблокирована за нарушение условий использования платформы.',
            'Приостановка обслуживания из-за задолженности или по запросу владельца.',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Связаться с владельцем организации',
                description:
                    'Владельцу организации необходимо обратиться в поддержку для восстановления активности.',
            },
        ],
        architectureNotes: [
            'Проверка статуса организации выполняется в контекстном перехватчике tenant-middleware.',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-suspended',
            title: 'Деятельность организации приостановлена',
            status: 403,
            detail: 'Деятельность организации приостановлена.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_SUSPENDED',
        },
        relatedEndpoints: ['/v1/organizations/:id/*'],
    },
    {
        code: 'ORGANIZATION_FORBIDDEN',
        slug: 'organization-forbidden',
        title: 'Недостаточно прав для управления этой организацией',
        status: 403,
        category: 'organizations',
        categoryLabel: 'Организации и тенанты',
        summary:
            'Пользователь не является участником или администратором указанной организации.',
        description:
            'Возникает при попытке чтения приватных данных или вызова административных действий над организацией лицом, не состоящим в таблице OrganizationMember или не обладающим правами владельца/администратора.',
        causes: [
            'Пользователь не состоит в штате организации.',
            'Роль пользователя в организации не позволяет совершать данное действие (например, только чтение).',
        ],
        remediation: [
            {
                actor: 'client',
                title: 'Запросить приглашение у администратора организации',
                description:
                    'Владелец организации может отправить приглашение через раздел управления командой.',
            },
        ],
        architectureNotes: [
            'Права проверяются через реляционную связь OrganizationMember с проверкой роли (owner, admin, member).',
        ],
        examplePayload: {
            type: 'https://api.insignia.pm/problems/organization-forbidden',
            title: 'Недостаточно прав для управления этой организацией',
            status: 403,
            detail: 'Недостаточно прав для управления этой организацией.',
            instance: '/v1/organizations/01931a2c-7b00-7000-8000-000000000001',
            code: 'ORGANIZATION_FORBIDDEN',
        },
        relatedEndpoints: [
            '/v1/organizations/:id/members',
            '/v1/organizations/:id/settings',
        ],
    },
];
