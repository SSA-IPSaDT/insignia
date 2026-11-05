export const takePayload = (text: string): string | null => {
    const parts = text.trim().split(/\s+/);
    const payload = parts[1];

    if (payload === undefined || payload === '') return null;

    return payload;
};

export default takePayload;
