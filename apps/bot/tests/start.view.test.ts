import { describe, expect, test } from 'bun:test';

import { renderStartView } from '#telegram/views/start.view';

describe('renderStartView', () => {
    test('renders welcome message with user name', () => {
        const view = renderStartView({ firstName: 'Алексей' });

        expect(view.text).toContain('Алексей');
        expect(view.parseMode).toBe('HTML');
        expect(view.keyboard).toBeDefined();
        expect(view.text).toContain('Клиентское приложение:');
    });

    test('uses fallback name when firstName is undefined', () => {
        const view = renderStartView({});

        expect(view.text).toContain('друк');
        expect(view.parseMode).toBe('HTML');
    });

    test('includes payload code when provided', () => {
        const view = renderStartView({
            firstName: 'Иван',
            payload: 'auth_123',
        });

        expect(view.text).toContain('auth_123');
        expect(view.text).toContain('🔑 Код привязки:');
    });

    test('renders custom appUrl when provided in data', () => {
        const customUrl = 'http://192.168.1.50:51001';
        const view = renderStartView({
            firstName: 'Тест',
            appUrl: customUrl,
        });

        expect(view.text).toContain(customUrl);
        const keyboardJson = JSON.stringify(view.keyboard);
        expect(keyboardJson).toContain(customUrl);
    });
});
