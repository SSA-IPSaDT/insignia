import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const fnoxLocalPath = join(import.meta.dir, '..', 'fnox.local.toml');

const parseArgs = (): { key: string; value: string } => {
    const rawArgs = process.argv.slice(2);

    if (rawArgs.length === 0) {
        console.error(
            '\x1b[31m❌ Ошибка: укажите имя переменной / секрета.\x1b[0m',
        );
        console.log('Использование:');
        console.log('  bun run fnox:set <ИМЯ> [ЗНАЧЕНИЕ]');
        console.log('  bun run fnox:set BOT_TOKEN 123456:ABC-DEF');
        console.log(
            '  bun run fnox:set DATABASE_URL "postgresql://user:pass@localhost:5432/insignia"',
        );
        process.exit(1);
    }

    const first = rawArgs[0] ?? '';

    if (first.includes('=')) {
        const eqIdx = first.indexOf('=');
        const key = first.slice(0, eqIdx).trim();
        const value = first.slice(eqIdx + 1).trim();
        return { key, value };
    }

    const key = first.trim();
    let value = rawArgs.slice(1).join(' ').trim();

    if (!value) {
        const input = prompt(`Введите значение для секрета [${key}]:`);
        if (input === null || input === undefined) {
            console.error('\x1b[33mОперация отменена пользователем.\x1b[0m');
            process.exit(0);
        }
        value = input.trim();
    }

    return { key, value };
};

const ensureFnoxLocalExists = (): void => {
    if (!existsSync(fnoxLocalPath)) {
        writeFileSync(
            fnoxLocalPath,
            '[providers.plain]\ntype = "plain"\n\n[secrets]\n',
            'utf-8',
        );
    }
};

const main = async (): Promise<void> => {
    const { key, value } = parseArgs();

    ensureFnoxLocalExists();

    try {
        // Записываем секрет в fnox.local.toml с провайдером plain
        const proc =
            await Bun.$`fnox -c ${fnoxLocalPath} set -p plain ${key} ${value}`.nothrow();

        if (proc.exitCode !== 0) {
            console.error(proc.stderr.toString());
            process.exit(proc.exitCode);
        }

        const maskedValue =
            value.length > 6
                ? `${value.slice(0, 3)}...${value.slice(-3)}`
                : '******';

        console.log(
            `\n✅ Секрет \x1b[32m${key}\x1b[0m (\x1b[2m${maskedValue}\x1b[0m) сохранён в \x1b[36mfnox.local.toml\x1b[0m`,
        );
        console.log(
            '🔒 Файл fnox.local.toml добавлен в .gitignore и автоматически переопределяет секреты fnox для локальной разработки.',
        );
    } catch (error) {
        console.error(
            `\x1b[31m❌ Ошибка записи через Fnox:\x1b[0m ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
    }
};

main();
