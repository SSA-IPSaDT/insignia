import { describe, expect, test } from 'bun:test';

import {
    buildProfileFromDraft,
    PROFILE_STEPS,
    validateAge,
    validateContacts,
    validateFirstName,
    validateLastName,
    validatePatronymic,
} from '#core';

describe('profile name validation (contracts)', () => {
    test('accepts a valid first name', () => {
        expect(validateFirstName('Иван')).toBeNull();
    });

    test('rejects empty last name with the contract message', () => {
        const error = validateLastName('   ');

        expect(error).not.toBeNull();
        expect(error).toContain('Фамилия');
    });

    test('rejects a patronymic longer than 64 characters', () => {
        const error = validatePatronymic('а'.repeat(65));

        expect(error).not.toBeNull();
        expect(error).toContain('64');
    });
});

describe('validateAge', () => {
    test('accepts a number inside the allowed range', () => {
        expect(validateAge('19')).toBeNull();
        expect(validateAge(' 14 ')).toBeNull();
    });

    test('rejects non-numeric input', () => {
        expect(validateAge('девятнадцать')).not.toBeNull();
    });

    test('rejects values outside the range', () => {
        expect(validateAge('13')).not.toBeNull();
        expect(validateAge('101')).not.toBeNull();
    });
});

describe('validateContacts', () => {
    test('accepts phone, username and email', () => {
        expect(validateContacts('+7 999 123-45-67')).toBeNull();
        expect(validateContacts('@ivanov')).toBeNull();
        expect(validateContacts('ivanov@example.com')).toBeNull();
    });

    test('rejects too short contacts', () => {
        expect(validateContacts('@1')).not.toBeNull();
    });
});

describe('PROFILE_STEPS', () => {
    test('follows the order from issue #37', () => {
        expect(PROFILE_STEPS.map((step) => step.id)).toEqual([
            'lastName',
            'firstName',
            'patronymic',
            'age',
            'contacts',
        ]);
    });

    test('every step can be skipped, so validation only runs on typed values', () => {
        for (const step of PROFILE_STEPS) {
            expect(step.validate('')).not.toBeNull();
        }
    });
});

describe('buildProfileFromDraft', () => {
    test('trims values and converts age to a number', () => {
        const profile = buildProfileFromDraft({
            lastName: ' Иванов ',
            age: ' 19 ',
        });

        expect(profile.lastName).toBe('Иванов');
        expect(profile.age).toBe(19);
        expect(profile.firstName).toBeUndefined();
    });

    test('treats skipped steps as missing fields', () => {
        const profile = buildProfileFromDraft({
            lastName: 'Петров',
            firstName: '',
            patronymic: '   ',
        });

        expect(profile).toEqual({ lastName: 'Петров' });
    });
});
