import { InlineKeyboard } from 'grammy';

import type { MockFormStatus } from '#types/models';
import type { FormsViewData } from '#types/views';
import { isWebAppUrl, resolveAppUrl } from '#utils/app-url';
import { escapeHtml } from '#utils/html';

const STATUS_LABELS: Record<MockFormStatus, string> = {
    in_progress: '🟡 в процессе',
    submitted: '📨 отправлена, ждёт проверки',
    approved: '✅ одобрена',
    rejected: '❌ отклонена',
};

export const renderFormsView = (data: FormsViewData) => {
    const active = data.forms.filter((form) => form.status === 'in_progress');
    const completed = data.forms.filter(
        (form) => form.status !== 'in_progress',
    );

    const lines: string[] = ['📋 <b>Мои формы</b>', ''];

    lines.push('🟡 <b>В процессе</b>');
    if (active.length === 0) {
        lines.push('<i>Нет незавершённых форм.</i>');
    }
    for (const form of active) {
        lines.push(
            `• <b>${escapeHtml(form.title)}</b> — ${escapeHtml(form.organization)}, ${escapeHtml(form.deadline)}`,
        );
    }

    lines.push('', '✅ <b>Пройденные</b>');
    if (completed.length === 0) {
        lines.push('<i>Пока ничего не пройдено.</i>');
    }
    for (const form of completed) {
        lines.push(
            `• <b>${escapeHtml(form.title)}</b> — ${STATUS_LABELS[form.status]}`,
        );
    }

    lines.push(
        '',
        '<i>Данные демонстрационные: реальные заявки появятся после подключения API.</i>',
    );

    const appUrl = data.appUrl ?? resolveAppUrl();

    const keyboard = new InlineKeyboard()
        .text('👤 Мой профиль', 'menu:profile')
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
