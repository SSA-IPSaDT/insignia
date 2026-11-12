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

    test('offers the onboarding tour to a new user', () => {
        const view = renderStartView({ firstName: 'Иван' });
        const keyboardJson = JSON.stringify(view.keyboard);

        expect(keyboardJson).toContain('onboarding:about');
        expect(keyboardJson).toContain('onboarding:features');
        expect(keyboardJson).toContain('onboarding:fill_profile');
        expect(view.text).toContain('Давай познакомимся');
    });

    test('shows the short menu instead of the tour for onboarded users', () => {
        const view = renderStartView({ firstName: 'Иван', isOnboarded: true });
        const keyboardJson = JSON.stringify(view.keyboard);

        expect(view.text).toContain('Снова привет');
        expect(view.text).not.toContain('🔑 Код привязки:');
        expect(keyboardJson).toContain('menu:profile');
        expect(keyboardJson).toContain('menu:forms');
        expect(keyboardJson).not.toContain('onboarding:about');
        expect(keyboardJson).not.toContain('start:chat_flow');
    });

    test('omits the web_app button for a non-HTTPS app url', () => {
        const view = renderStartView({
            appUrl: 'http://192.168.1.50:51001',
        });
        const keyboardJson = JSON.stringify(view.keyboard);

        expect(keyboardJson).not.toContain('web_app');
        expect(keyboardJson).toContain('http://192.168.1.50:51001');
    });

    test('adds the web_app button for an HTTPS app url', () => {
        const view = renderStartView({ appUrl: 'https://app.insignia.dev' });

        expect(JSON.stringify(view.keyboard)).toContain('web_app');
    });

    test('escapes user-provided name and payload', () => {
        const view = renderStartView({
            firstName: '<b>Иван</b>',
            payload: '<script>',
        });

        expect(view.text).toContain('&lt;b&gt;Иван&lt;/b&gt;');
        expect(view.text).toContain('&lt;script&gt;');
        expect(view.text).not.toContain('<script>');
    });
});
