import { buildStartMessage, getStartPayload } from './messages.js';

export type Reply = (text: string) => Promise<unknown>;

export const handleStart = async (
    reply: Reply,
    firstName?: string,
    text = '',
): Promise<void> => {
    const payload = getStartPayload(text);
    const message = buildStartMessage(firstName, payload);

    await reply(message);
};
