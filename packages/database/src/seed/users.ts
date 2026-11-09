import { db } from '../db';

export interface SeedUserData {
    firstName: string;
    lastName?: string;
    patronymic?: string;
    userName?: string;
    email?: string;
    phone: string;
    avatarUrl?: string;
    telegram?: {
        telegramId: bigint;
        userName?: string;
        isPremium?: boolean;
    };
}

export const SEED_USERS: SeedUserData[] = [
    // 1. Полный профиль: имя, фамилия, отчество, username, email, телефон, аватар, Telegram
    {
        firstName: 'Александр',
        lastName: 'Смирнов',
        patronymic: 'Сергеевич',
        userName: 'alex_smirnov',
        email: 'alex.smirnov@insignia.dev',
        phone: '+79991230001',
        avatarUrl:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        telegram: {
            telegramId: 100000001n,
            userName: 'alex_smirnov_tg',
            isPremium: true,
        },
    },
    // 2. Без отчества и без аватара (только имя, фамилия, username, email, телефон, Telegram)
    {
        firstName: 'Елена',
        lastName: 'Васильева',
        userName: 'elena_v',
        email: 'elena.v@insignia.dev',
        phone: '+79991230002',
        telegram: {
            telegramId: 100000002n,
            userName: 'elena_v_tg',
            isPremium: false,
        },
    },
    // 3. Без фамилии, без отчества и без аватара (только имя, username, email, телефон, Telegram)
    {
        firstName: 'Дмитрий',
        userName: 'dmitry_dev',
        email: 'dmitry.k@insignia.dev',
        phone: '+79991230003',
        telegram: {
            telegramId: 100000003n,
            userName: 'dmitry_dev_tg',
            isPremium: true,
        },
    },
    // 4. Без отчества, без username, без Telegram (имя, фамилия, email, телефон, аватар)
    {
        firstName: 'Анна',
        lastName: 'Попова',
        email: 'anna.p@insignia.dev',
        phone: '+79991230004',
        avatarUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    },
    // 5. ТОЛЬКО ИМЯ! (без фамилии, отчества, username, email, аватара, Telegram) — минималистичный профиль
    {
        firstName: 'Иван',
        phone: '+79991230005',
    },
    // 6. Без отчества, без username, без email, без Telegram (имя, фамилия, аватар, телефон)
    {
        firstName: 'Ольга',
        lastName: 'Морозова',
        phone: '+79991230006',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    },
    // 7. Без фамилии и без отчества (имя, username, аватар, телефон, Telegram)
    {
        firstName: 'Максим',
        userName: 'maxim_pro',
        phone: '+79991230007',
        avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        telegram: {
            telegramId: 100000007n,
            userName: 'maxim_pro_tg',
            isPremium: false,
        },
    },
    // 8. С отчеством, но без фамилии и без аватара (имя, отчество, username, email, телефон)
    {
        firstName: 'Светлана',
        patronymic: 'Николаевна',
        userName: 'svetlana_n',
        email: 'svetlana.n@insignia.dev',
        phone: '+79991230008',
    },
    // 9. С полным ФИО, но без username и без аватара (имя, фамилия, отчество, email, телефон, Telegram)
    {
        firstName: 'Михаил',
        lastName: 'Соколов',
        patronymic: 'Игоревич',
        email: 'mikhail.s@insignia.dev',
        phone: '+79991230009',
        telegram: {
            telegramId: 100000009n,
            userName: 'mikhail_s_tg',
            isPremium: false,
        },
    },
    // 10. Только имя и Telegram (без фамилии, отчества, username, email, аватара)
    {
        firstName: 'Артём',
        phone: '+79991230010',
        telegram: {
            telegramId: 100000010n,
            isPremium: false,
        },
    },
    // 11. Только имя и аватар (без фамилии, отчества, username, email, Telegram)
    {
        firstName: 'Дарья',
        phone: '+79991230011',
        avatarUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9',
    },
    // 12. Имя, фамилия и username (без отчества, без email, без аватара, с Telegram)
    {
        firstName: 'Роман',
        lastName: 'Волков',
        userName: 'roman_wolf',
        phone: '+79991230012',
        telegram: {
            telegramId: 100000012n,
            userName: 'roman_wolf_tg',
            isPremium: true,
        },
    },
    // 13. Имя, отчество и аватар (без фамилии, без username, с email, без Telegram)
    {
        firstName: 'Юлия',
        patronymic: 'Сергеевна',
        email: 'yulia.s@insignia.dev',
        phone: '+79991230013',
        avatarUrl:
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
    },
    // 14. Только имя и фамилия (без отчества, username, email, аватара, Telegram)
    {
        firstName: 'Сергей',
        lastName: 'Кузнецов',
        phone: '+79991230014',
    },
    // 15. Имя, username и email (без фамилии, без отчества, без аватара, с Telegram)
    {
        firstName: 'Татьяна',
        userName: 'tatiana_t',
        email: 'tatiana.t@insignia.dev',
        phone: '+79991230015',
        telegram: {
            telegramId: 100000015n,
            userName: 'tatiana_t_tg',
            isPremium: true,
        },
    },
    // 16. Полный профиль 2: все поля заполнены
    {
        firstName: 'Константин',
        lastName: 'Новиков',
        patronymic: 'Андреевич',
        userName: 'kostya_n',
        email: 'kostya.n@insignia.dev',
        phone: '+79991230016',
        avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        telegram: {
            telegramId: 100000016n,
            userName: 'kostya_n_tg',
            isPremium: true,
        },
    },
    // 17. Минималистичный профиль (только имя и телефон)
    {
        firstName: 'Полина',
        phone: '+79991230017',
    },
    // 18. Имя, фамилия, аватар и Telegram (без отчества, без username, без email)
    {
        firstName: 'Игорь',
        lastName: 'Федоров',
        phone: '+79991230018',
        avatarUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        telegram: {
            telegramId: 100000018n,
            userName: 'igor_f_tg',
            isPremium: false,
        },
    },
    // 19. Имя, отчество и username (без фамилии, email, аватара, Telegram)
    {
        firstName: 'Марина',
        patronymic: 'Александровна',
        userName: 'marina_alx',
        phone: '+79991230019',
    },
    // 20. Имя и username (без фамилии, отчества, email, аватара, Telegram)
    {
        firstName: 'Никита',
        userName: 'nikita_ninja',
        phone: '+79991230020',
    },
    // 21. Имя, фамилия, email и аватар (без отчества, без username, без Telegram)
    {
        firstName: 'Валерия',
        lastName: 'Белова',
        email: 'valeria.b@insignia.dev',
        phone: '+79991230021',
        avatarUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    },
    // 22. Имя, отчество и Telegram (без фамилии, username, email, аватара)
    {
        firstName: 'Григорий',
        patronymic: 'Петрович',
        phone: '+79991230022',
        telegram: {
            telegramId: 100000022n,
            isPremium: false,
        },
    },
    // 23. Имя, username и аватар (без фамилии, отчества, email, Telegram)
    {
        firstName: 'Алина',
        userName: 'alina_sky',
        phone: '+79991230023',
        avatarUrl:
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
    },
    // 24. Имя и фамилия (без отчества, username, email, аватара, Telegram)
    {
        firstName: 'Денис',
        lastName: 'Медведев',
        phone: '+79991230024',
    },
    // 25. Имя, username, аватар и Telegram (без фамилии, отчества, email)
    {
        firstName: 'Александр',
        userName: 'alex_one',
        phone: '+79991230025',
        avatarUrl:
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
        telegram: {
            telegramId: 100000025n,
            userName: 'alex_one_tg',
            isPremium: true,
        },
    },
];

/**
 * Заполняет базу данных разнообразными тестовыми пользователями
 * для наглядной проверки обрезки отсутствующих полей (Zero Payload Bloat).
 */
export const seedUsers = async (): Promise<void> => {
    // Очищаем предыдущих сид-пользователей для чистого и бесконфликтного перезапуска
    await db.orm.public.User.where((u) =>
        u.phone.like('+7999123%'),
    ).deleteAll();

    let createdCount = 0;
    let createdTelegramCount = 0;

    for (const data of SEED_USERS) {
        const user = await db.orm.public.User.create({
            firstName: data.firstName,
            lastName: data.lastName ?? null,
            patronymic: data.patronymic ?? null,
            userName: data.userName ?? null,
            email: data.email ?? null,
            phone: data.phone,
            avatarUrl: data.avatarUrl ?? null,
        });
        createdCount += 1;

        if (data.telegram) {
            await db.orm.public.TelegramAccount.create({
                userId: user.id,
                telegramId: data.telegram.telegramId,
                firstName: data.firstName,
                lastName: data.lastName ?? null,
                userName: data.telegram.userName ?? null,
                isPremium: data.telegram.isPremium ?? false,
            });
            createdTelegramCount += 1;
        }
    }

    console.log(
        `[Seed:Users] Создано пользователей: ${createdCount}, Telegram-аккаунтов: ${createdTelegramCount} (Всего в датасете: ${SEED_USERS.length})`,
    );
};
