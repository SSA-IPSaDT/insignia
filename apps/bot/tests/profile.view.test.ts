import { describe, expect, test } from 'bun:test';

import { PROFILE_STEPS } from '#core';
import {
    renderProfileSkipKeyboard,
    renderProfileStepView,
    renderProfileView,
} from '#telegram/views/profile.view';

const firstStep = PROFILE_STEPS[0];

describe('renderProfileView', () => {
    test('shows an empty state when the profile is not filled yet', () => {
        const view = renderProfileView({ profile: null });

        expect(view.text).toContain('Профиль пока пуст');
        expect(view.text).toContain('Заполнить профиль');
        expect(view.parseMode).toBe('HTML');
    });

    test('renders collected profile fields', () => {
        const view = renderProfileView({
            profile: {
                lastName: 'Иванов',
                firstName: 'Иван',
                patronymic: 'Иванович',
                age: 19,
                contacts: '@ivanov',
            },
            telegramUsername: 'ivan',
        });

        expect(view.text).toContain('Иванов');
        expect(view.text).toContain('Иванович');
        expect(view.text).toContain('19');
        expect(view.text).toContain('@ivanov');
        expect(view.text).toContain('@ivan');
    });

    test('escapes user-provided values', () => {
        const view = renderProfileView({
            profile: { firstName: '<b>hack</b>' },
        });

        expect(view.text).toContain('&lt;b&gt;hack&lt;/b&gt;');
        expect(view.text).not.toContain('<b>hack</b>');
    });

    test('marks the profile as saved right after the dialog', () => {
        const view = renderProfileView({
            profile: { firstName: 'Иван' },
            savedRecently: true,
        });

        expect(view.text).toContain('Профиль сохранён');
    });
});

describe('renderProfileStepView', () => {
    test('renders step number and prompt', () => {
        if (firstStep === undefined) {
            throw new Error('PROFILE_STEPS is empty');
        }

        const view = renderProfileStepView({
            step: firstStep,
            index: 1,
            total: PROFILE_STEPS.length,
        });

        expect(view.text).toContain('Шаг 1 из 5');
        expect(view.text).toContain('Фамилия');
        expect(view.text).toContain('Например: Иванов');
    });
});

describe('renderProfileSkipKeyboard', () => {
    test('contains skip and cancel buttons', () => {
        const data = JSON.stringify(renderProfileSkipKeyboard());

        expect(data).toContain('profile:skip');
        expect(data).toContain('profile:cancel');
    });
});
