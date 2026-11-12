/**
 * Экранирование пользовательского текста для Telegram HTML parse_mode.
 *
 * Имена, контакты и payload приходят от пользователя, поэтому подставлять их
 * в разметку можно только после экранирования: иначе `<` в имени сломает
 * сообщение или позволит внедрить чужой тег.
 */
export const escapeHtml = (value: string): string => {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};
