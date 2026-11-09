import { db } from '../db';
import { seedUsers } from './users';

export * from './users';

/**
 * Запускает все зарегистрированные сиды базы данных платформы Insignia.
 */
export const runSeeds = async (): Promise<void> => {
    console.log('🌱 Запуск сидирования базы данных Insignia...');
    await seedUsers();
    console.log('✅ Сидирование успешно завершено.');
};

if (import.meta.main) {
    runSeeds()
        .then(async () => {
            await db.close();
            process.exit(0);
        })
        .catch(async (error: unknown) => {
            console.error('❌ Ошибка сидирования базы данных:', error);
            await db.close();
            process.exit(1);
        });
}
