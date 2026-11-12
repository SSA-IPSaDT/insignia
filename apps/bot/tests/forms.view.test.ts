import { describe, expect, test } from 'bun:test';

import { MOCK_FORMS } from '#core';
import { renderFormsView } from '#telegram/views/forms.view';

describe('renderFormsView', () => {
    test('splits forms into in-progress and completed sections', () => {
        const view = renderFormsView({ forms: MOCK_FORMS });

        expect(view.text).toContain('В процессе');
        expect(view.text).toContain('Пройденные');
        expect(view.text).toContain('Заявка в волонтёрский корпус');
        expect(view.text).toContain('одобрена');
        expect(view.parseMode).toBe('HTML');
    });

    test('shows empty states when there are no forms', () => {
        const view = renderFormsView({ forms: [] });

        expect(view.text).toContain('Нет незавершённых форм');
        expect(view.text).toContain('Пока ничего не пройдено');
    });

    test('escapes form titles', () => {
        const view = renderFormsView({
            forms: [
                {
                    id: 'form_x',
                    title: '<script>',
                    organization: 'Тест',
                    deadline: 'сегодня',
                    status: 'in_progress',
                },
            ],
        });

        expect(view.text).toContain('&lt;script&gt;');
        expect(view.text).not.toContain('<script>');
    });
});
