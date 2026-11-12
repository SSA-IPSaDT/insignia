import type { MockForm } from '#types/models';

export const MOCK_FORMS: readonly MockForm[] = [
    {
        id: 'form_101',
        title: 'Заявка в волонтёрский корпус «Весна»',
        organization: 'Профком',
        deadline: 'до 20 ноября',
        status: 'in_progress',
    },
    {
        id: 'form_102',
        title: 'Регистрация на хакатон Insignia Cup',
        organization: 'СНО',
        deadline: 'до 1 декабря',
        status: 'in_progress',
    },
    {
        id: 'form_103',
        title: 'Анкета участника школы актива',
        organization: 'Студсовет',
        deadline: 'завершена 3 ноября',
        status: 'approved',
    },
    {
        id: 'form_104',
        title: 'Опрос о качестве мероприятий',
        organization: 'Совет молодых учёных',
        deadline: 'завершена 28 октября',
        status: 'submitted',
    },
];
