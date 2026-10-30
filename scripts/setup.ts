import { ensureAgeKey } from './create-key.ts';

const getGitConfig = async (key: string): Promise<string> => {
    try {
        const result = await Bun.$`git config ${key}`.text();
        return result.trim();
    } catch {
        return '';
    }
};

const checkGitIdentity = async (): Promise<void> => {
    console.log('\n1️⃣  Проверка идентификации разработчика в Git...');
    const userName = await getGitConfig('user.name');
    const userEmail = await getGitConfig('user.email');

    if (!userName || !userEmail) {
        console.warn(
            '\x1b[33m⚠️  Внимание: Git user.name или user.email не настроены!\x1b[0m',
        );
        console.log(
            '   Для корректной работы зон ответственности (ROSTER.md) выполните:',
        );
        console.log('   git config user.name "<ваш-github-логин>"');
        console.log('   git config user.email "<ваш-email>"');
    } else {
        console.log(
            `   ✅ Идентифицирован разработчик: \x1b[32m${userName}\x1b[0m <\x1b[36m${userEmail}\x1b[0m>`,
        );
    }
};

const installGitHooks = async (): Promise<void> => {
    console.log('\n2️⃣  Установка pre-commit Git-хуков (hk)...');
    const hkBin = Bun.which('hk');

    if (!hkBin) {
        console.warn(
            '\x1b[33m⚠️  Утилита hk не найдена в PATH. Убедитесь, что выполнен `mise install`.\x1b[0m',
        );
        return;
    }

    try {
        await Bun.$`hk install`.quiet();
        console.log('   ✅ Git-хуки проверки качества успешно активированы.');
    } catch (error) {
        console.error(
            `   \x1b[31m❌ Не удалось установить hk хуки:\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};

const setupSecretsKey = async (): Promise<void> => {
    console.log('\n3️⃣  Проверка персонального ключа шифрования (Age)...');
    try {
        const { pubKey, isNew, keyFile } = await ensureAgeKey();

        if (isNew) {
            console.log(`   ✨ Создан новый приватный ключ: ${keyFile}`);
        } else {
            console.log(`   ✅ Приватный ключ найден: ${keyFile}`);
        }

        console.log(`   🔑 Публичный ключ: \x1b[32m\x1b[1m${pubKey}\x1b[0m`);
        console.log(
            '   📋 Отправьте этот публичный ключ тимлиду (@naylour / naylour@tuta.io) для добавления в fnox.toml.',
        );
    } catch (error) {
        console.error(
            `   \x1b[31m❌ Ошибка настройки ключа:\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};

const main = async (): Promise<void> => {
    console.log('\n🚀 [Insignia] Автоматическая настройка рабочего окружения');
    console.log(
        '══════════════════════════════════════════════════════════════',
    );

    await checkGitIdentity();
    await installGitHooks();
    await setupSecretsKey();

    console.log(
        '\n══════════════════════════════════════════════════════════════',
    );
    console.log(
        '🎉 Инициализация завершена! Рабочее окружение готово к разработке.',
    );
    console.log(
        '💡 Для проверки всех типов запустите: \x1b[36mbun run typecheck\x1b[0m\n',
    );
};

if (import.meta.main) {
    await main();
}
