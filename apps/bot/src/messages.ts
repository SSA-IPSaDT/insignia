const fallbackName = 'друг';

export const buildStartMessage = (
    firstName?: string,
    payload?: string | null,
): string => {
    const name = firstName?.trim() || fallbackName;
    const lines = [`Привет, ${name}!`, '', 'Я бот платформы Insignia.'];

    if (payload) {
        lines.push('', `Код: ${payload}`);
    }

    return lines.join('\n');
};
