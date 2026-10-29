import { chmodSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const home = Bun.env.HOME || Bun.env.USERPROFILE;

if (!home) {
    throw new Error(
        'Не удалось определить пользовательскую директорию (HOME / USERPROFILE)',
    );
}

const keyDir = join(home, '.config', 'age');
const keyFile = join(keyDir, 'key.txt');

mkdirSync(keyDir, { recursive: true });

if (await Bun.file(keyFile).exists()) {
    console.log(`Ключ уже существует: ${keyFile}`);
} else {
    console.log('Генерация нового ключа');

    await Bun.$`age-keygen -o ${keyFile}`.quiet();

    if (process.platform !== 'win32') {
        chmodSync(keyFile, 0o600);
    }

    console.log('Ключ успешно создан!');
}

const pubKey = (await Bun.$`age-keygen -y ${keyFile}`.text()).trim();

console.log(`Твой публичный ключ: ${pubKey}`);
