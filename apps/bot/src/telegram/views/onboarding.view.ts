import { InlineKeyboard } from 'grammy';

import type { OnboardingSlide, OnboardingSlideViewData } from '#types/views';

interface SlideContent {
    text: string;
    keyboard: InlineKeyboard;
}

const renderAboutSlide = (): SlideContent => ({
    text: [
        '🧭 <b>Кто мы такие</b>',
        '',
        'Insignia — платформа мероприятий и форм для студенческих организаций: Профкома, СНО, студсоветов институтов и советов молодых учёных.',
        '',
        'Вместо Google Форм и переходов в браузер — заявки и опросы прямо в Telegram.',
    ].join('\n'),
    keyboard: new InlineKeyboard()
        .text('✨ Что умеет Insignia', 'onboarding:features')
        .row()
        .text('↩️ В начало', 'onboarding:start'),
});

const renderFeaturesSlide = (): SlideContent => ({
    text: [
        '✨ <b>Что умеет Insignia</b>',
        '',
        '• 📝 проходить формы и опросы прямо в чате;',
        '• 👤 хранить профиль и подставлять данные в заявки;',
        '• 📋 показывать статусы заявок и мероприятия;',
        '• ⏰ напоминать о дедлайнах;',
        '• 📎 собирать файлы вместе с ответами.',
    ].join('\n'),
    keyboard: new InlineKeyboard()
        .text('📝 Давай заполним профиль', 'onboarding:fill_profile')
        .row()
        .text('↩️ Назад', 'onboarding:about'),
});

const renderProfileSlide = (): SlideContent => ({
    text: [
        '📝 <b>Давай заполним твой профиль</b>',
        '',
        'Пять коротких вопросов: фамилия, имя, отчество, возраст и контакты.',
        'Любой шаг можно пропустить кнопкой «Пропустить», а данные потом изменить командой /profile.',
    ].join('\n'),
    keyboard: new InlineKeyboard()
        .text('📝 Заполнить профиль', 'onboarding:fill_profile')
        .row()
        .text('↩️ Назад', 'onboarding:features'),
});

const SLIDES: Record<OnboardingSlide, () => SlideContent> = {
    about: renderAboutSlide,
    features: renderFeaturesSlide,
    profile: renderProfileSlide,
};

export const renderOnboardingSlide = (data: OnboardingSlideViewData) => {
    const slide = SLIDES[data.slide]();

    return {
        text: slide.text,
        keyboard: slide.keyboard,
        parseMode: 'HTML' as const,
    };
};
