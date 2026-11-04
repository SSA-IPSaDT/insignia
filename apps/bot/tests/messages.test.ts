import { describe, expect, test } from 'bun:test';

import { buildStartMessage, getStartPayload } from '../src/messages';

describe('getStartPayload', () => {
    test('returns null when there is no payload', () => {
        expect(getStartPayload('/start')).toBeNull();
    });

    test('returns payload after the command', () => {
        expect(getStartPayload('/start promo')).toBe('promo');
    });

    test('ignores extra spaces', () => {
        expect(getStartPayload('/start   promo   ')).toBe('promo');
    });

    test('returns null for an empty message', () => {
        expect(getStartPayload('')).toBeNull();
    });
});

describe('buildStartMessage', () => {
    test('addresses the user by first name', () => {
        const message = buildStartMessage('Вадим');

        expect(message).toContain('Привет, Вадим!');
    });

    test('uses a fallback name when first name is missing', () => {
        const message = buildStartMessage();

        expect(message).toContain('Привет, друг!');
    });

    test('adds the payload to the message', () => {
        const message = buildStartMessage('Вадим', 'promo');

        expect(message).toContain('Код: promo');
    });

    test('does not add a payload block without a payload', () => {
        const message = buildStartMessage('Вадим');

        expect(message).not.toContain('Код:');
    });
});
