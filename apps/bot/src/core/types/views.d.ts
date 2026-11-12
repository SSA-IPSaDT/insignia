import type { ProfileStep } from '#core/profile';

import type { MockForm, StudentProfile } from './models';

export interface StartViewData {
    firstName?: string;
    payload?: string | null;
    appUrl?: string;
    isOnboarded?: boolean;
}

export type OnboardingSlide = 'about' | 'features' | 'profile';

export interface OnboardingSlideViewData {
    slide: OnboardingSlide;
}

export interface ProfileStepViewData {
    step: ProfileStep;
    index: number;
    total: number;
}

export interface ProfileViewData {
    profile: StudentProfile | null;
    telegramUsername?: string;
    appUrl?: string;
    /** true — карточка отправляется сразу после заполнения профиля. */
    savedRecently?: boolean;
}

export interface FormsViewData {
    forms: readonly MockForm[];
    appUrl?: string;
}

export interface HtmlView {
    text: string;
    parseMode: 'HTML';
}
