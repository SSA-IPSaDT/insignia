import { chmodSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const resolveKeyPaths = (): { keyDir: string; keyFile: string } => {
    const home = Bun.env.HOME || Bun.env.USERPROFILE;

    if (!home) {
        throw new Error(
            'Не удалось определить пользовательскую директорию (HOME / USERPROFILE).',
        );
    }

    const keyDir = join(home, '.config', 'age');
    const keyFile = join(keyDir, 'key.txt');

    return { keyDir, keyFile };
};

export const ensureAgeKey = async (): Promise<{
    pubKey: string;
    isNew: boolean;
    keyFile: string;
}> => {
    const ageKeygenBin = Bun.which('age-keygen');
    if (!ageKeygenBin) {
        throw new Error(
            'Утилита age-keygen не найдена в PATH. Убедитесь, что вы выполнили `mise install`.',
        );
    }

    const { keyDir, keyFile } = resolveKeyPaths();
    mkdirSync(keyDir, { recursive: true });

    let isNew = false;
    const keyFileExists = await Bun.file(keyFile).exists();

    if (!keyFileExists) {
        isNew = true;
        await Bun.$`age-keygen -o ${keyFile}`.quiet();

        if (process.platform !== 'win32') {
            chmodSync(keyFile, 0o600);
        }
    }

    const pubKey = (await Bun.$`age-keygen -y ${keyFile}`.text()).trim();

    return { pubKey, isNew, keyFile };
};

const run = async (): Promise<void> => {
    try {
        console.log('\n🔐 [Insignia] Age Key Manager');
        console.log('──────────────────────────────────────────────────');

        const { pubKey, isNew, keyFile } = await ensureAgeKey();

        if (isNew) {
            console.log(`✨ Сгенерирован новый приватный ключ: ${keyFile}`);
        } else {
            console.log(
                `ℹ️  Используется существующий приватный ключ: ${keyFile}`,
            );
        }

        console.log('\n🔑 Твой публичный ключ (Public Key):');
        console.log(`   \x1b[32m\x1b[1m${pubKey}\x1b[0m\n`);

        console.log('📋 Следующие шаги для онбординга:');
        console.log('   1. Скопируйте публичный ключ выше.');
        console.log(
            '   2. Отправьте его тимлиду (@naylour / naylour@tuta.io) для добавления в fnox.toml.',
        );
        console.log(
            '   3. После коммита обновленного fnox.toml вы получите доступ ко всем секретам проекта.\n',
        );
    } catch (error) {
        console.error(
            `\x1b[31m❌ Ошибка:\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
    }
};

if (import.meta.main) {
    await run();
}
