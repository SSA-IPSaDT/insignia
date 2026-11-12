import { InlineKeyboard } from 'grammy';

import { PROFILE_CANCEL_CALLBACK, PROFILE_SKIP_CALLBACK } from '#core';
import type { ProfileStepViewData, ProfileViewData } from '#types/views';
import { isWebAppUrl, resolveAppUrl } from '#utils/app-url';
import { escapeHtml } from '#utils/html';

const formatValue = (value: string | number | undefined): string => {
    if (value === undefined) {
        return '—';
    }

    return escapeHtml(String(value));
};

export const renderProfileSkipKeyboard = (): InlineKeyboard => {
    return new InlineKeyboard()
        .text('⏭ Пропустить', PROFILE_SKIP_CALLBACK)
        .text('✖️ Отменить', PROFILE_CANCEL_CALLBACK);
};

export const renderProfileStepView = (data: ProfileStepViewData) => {
    return {
        text: [
            `📝 <b>Шаг ${data.index} из ${data.total}: ${data.step.title}</b>`,
            '',
            data.step.prompt,
            '',
            `<i>${data.step.hint}</i>`,
        ].join('\n'),
        parseMode: 'HTML' as const,
    };
};

export const renderProfileView = (data: ProfileViewData) => {
    const appUrl = data.appUrl ?? resolveAppUrl();
    const lines: string[] = [];

    if (data.savedRecently === true) {
        lines.push('✅ <b>Профиль сохранён!</b>', '');
    }

    lines.push('👤 <b>Мой профиль</b>', '');

    if (data.profile === null) {
        lines.push(
            'Профиль пока пуст.',
            '',
            'Нажми «Заполнить профиль» — это пять коротких вопросов. Любой шаг можно пропустить.',
        );
    } else {
        lines.push(
            `<b>Фамилия:</b> ${formatValue(data.profile.lastName)}`,
            `<b>Имя:</b> ${formatValue(data.profile.firstName)}`,
            `<b>Отчество:</b> ${formatValue(data.profile.patronymic)}`,
            `<b>Возраст:</b> ${formatValue(data.profile.age)}`,
            `<b>Контакты:</b> ${formatValue(data.profile.contacts)}`,
        );
    }

    if (data.telegramUsername) {
        lines.push('', `Telegram: @${escapeHtml(data.telegramUsername)}`);
    }

    const keyboard = new InlineKeyboard()
        .text('📝 Заполнить профиль', 'onboarding:fill_profile')
        .row()
        .text('📋 Мои формы', 'menu:forms')
        .row();

    // Telegram принимает web_app только по HTTPS (см. start.view).
    if (isWebAppUrl(appUrl)) {
        keyboard.webApp('📱 Открыть приложение', appUrl);
    } else {
        keyboard.url('🌐 Открыть в браузере', appUrl);
    }

    return {
        text: lines.join('\n'),
        keyboard,
        parseMode: 'HTML' as const,
    };
};
