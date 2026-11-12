import type { UserProfileDTO } from '@insignia/contracts/users';

export type ProfileNameFields = Pick<
    UserProfileDTO,
    'firstName' | 'lastName' | 'patronymic'
>;

export type StudentProfile = Partial<ProfileNameFields> & {
    age?: number;
    contacts?: string;
};

export interface ProfileDraft {
    lastName?: string;
    firstName?: string;
    patronymic?: string;
    age?: string;
    contacts?: string;
}

export type MockFormStatus =
    'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface MockForm {
    id: string;
    title: string;
    organization: string;
    deadline: string;
    status: MockFormStatus;
}
