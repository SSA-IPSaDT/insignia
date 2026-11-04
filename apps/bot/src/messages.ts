const fallbackName = 'друг';

export const getStartPayload = (text: string): string | null => {
    const parts = text.trim().split(/\s+/);
    const payload = parts[1];

    if (payload === undefined || payload === '') {
        return null;
    }

    return payload;
};

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
