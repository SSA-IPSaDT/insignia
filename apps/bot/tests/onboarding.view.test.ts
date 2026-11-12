import { describe, expect, test } from 'bun:test';

import { renderOnboardingSlide } from '#telegram/views/onboarding.view';

const keyboardData = (keyboard: unknown): string => JSON.stringify(keyboard);

describe('renderOnboardingSlide', () => {
    test('about slide explains the service and links to features', () => {
        const view = renderOnboardingSlide({ slide: 'about' });

        expect(view.text).toContain('Кто мы такие');
        expect(view.text).toContain('Insignia');
        expect(view.parseMode).toBe('HTML');
        expect(keyboardData(view.keyboard)).toContain('onboarding:features');
        expect(keyboardData(view.keyboard)).toContain('onboarding:start');
    });

    test('features slide lists capabilities and goes back to about', () => {
        const view = renderOnboardingSlide({ slide: 'features' });

        expect(view.text).toContain('Что умеет Insignia');
        expect(view.text).toContain('заявки');
        expect(keyboardData(view.keyboard)).toContain(
            'onboarding:fill_profile',
        );
        expect(keyboardData(view.keyboard)).toContain('onboarding:about');
    });

    test('profile slide offers to start filling the profile', () => {
        const view = renderOnboardingSlide({ slide: 'profile' });

        expect(view.text).toContain('заполним твой профиль');
        expect(keyboardData(view.keyboard)).toContain(
            'onboarding:fill_profile',
        );
    });
});
