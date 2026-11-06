import env from '@insignia/env';
import { InlineKeyboard } from 'grammy';

import type { StartViewData } from '#types/views';

export const renderStartView = (data: StartViewData) => {
    const name = data.firstName?.trim() || 'друк';

    const lines = [
        `👋 <b>Привет, ${name}!</b>`,
        '',
        'Я бот платформы <b>Insignia</b>.',
    ];

    if (data.payload) {
        lines.push('', `🔑 Код привязки: <code>${data.payload}</code>`);
    }

    const keyboard = new InlineKeyboard()
        .text('💬 Пройти в чате', 'start:chat_flow')
        .webApp('📱 Открыть приложение', 'https://ya.ru');

    return {
        text: lines.join('\n'),
        keyboard,
        parseMode: 'HTML' as const,
    };
};
