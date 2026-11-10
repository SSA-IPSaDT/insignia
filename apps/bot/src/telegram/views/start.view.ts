import { InlineKeyboard } from 'grammy';

import type { StartViewData } from '#types/views';
import { resolveAppUrl } from '#utils/app-url';

export const renderStartView = (data: StartViewData) => {
    const name = data.firstName?.trim() || 'друк';
    const appUrl = data.appUrl ?? resolveAppUrl();

    const lines = [
        `👋 <b>Привет, ${name}!</b>`,
        '',
        'Я бот платформы <b>Insignia</b>.',
    ];

    if (data.payload) {
        lines.push('', `🔑 Код привязки: <code>${data.payload}</code>`);
    }

    lines.push(
        '',
        `📱 <b>Клиентское приложение:</b> <a href="${appUrl}">${appUrl}</a>`,
    );

    const keyboard = new InlineKeyboard()
        .text('💬 Пройти в чате', 'start:chat_flow')
        .webApp('📱 Открыть приложение', appUrl)
        .row()
        .url('🌐 Открыть в браузере', appUrl);

    return {
        text: lines.join('\n'),
        keyboard,
        parseMode: 'HTML' as const,
    };
};
