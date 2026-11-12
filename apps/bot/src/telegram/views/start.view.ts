import { InlineKeyboard } from 'grammy';

import type { StartViewData } from '#types/views';
import { isWebAppUrl, resolveAppUrl } from '#utils/app-url';
import { escapeHtml } from '#utils/html';

export const renderStartView = (data: StartViewData) => {
    const name = escapeHtml(data.firstName?.trim() || 'друк');
    const appUrl = data.appUrl ?? resolveAppUrl();

    const lines: string[] = [];
    const keyboard = new InlineKeyboard();

    if (data.isOnboarded === true) {
        lines.push(
            `👋 <b>Снова привет, ${name}!</b>`,
            '',
            'Профиль заполнен. Что смотрим дальше?',
        );

        keyboard
            .text('👤 Мой профиль', 'menu:profile')
            .text('📋 Мои формы', 'menu:forms')
            .row();
    } else {
        lines.push(
            `👋 <b>Привет, ${name}!</b>`,
            '',
            'Я бот платформы <b>Insignia</b>.',
        );

        if (data.payload) {
            lines.push(
                '',
                `🔑 Код привязки: <code>${escapeHtml(data.payload)}</code>`,
            );
        }

        lines.push(
            '',
            'Давай познакомимся: пара коротких экранов о сервисе — и заполним профиль.',
        );

        keyboard
            .text('🧭 Кто мы такие', 'onboarding:about')
            .row()
            .text('✨ Что умеет Insignia', 'onboarding:features')
            .row()
            .text('📝 Давай заполним профиль', 'onboarding:fill_profile')
            .row();
    }

    lines.push(
        '',
        `📱 <b>Клиентское приложение:</b> <a href="${appUrl}">${appUrl}</a>`,
    );

    if (isWebAppUrl(appUrl)) {
        keyboard.webApp('📱 Открыть приложение', appUrl);
    }
    keyboard.url('🌐 Открыть в браузере', appUrl).row();

    if (data.isOnboarded !== true) {
        keyboard.text('💬 Пройти в чате', 'start:chat_flow');
    }

    return {
        text: lines.join('\n'),
        keyboard,
        parseMode: 'HTML' as const,
    };
};
