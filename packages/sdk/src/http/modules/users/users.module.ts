import type { PaginatedData } from '@insignia/contracts/common';
import type {
    PublicUserDto,
    TakeUsersQuery,
    UserDto,
    UserErrorCode,
} from '@insignia/contracts/users';

import type { InsigniaSdkResult } from '#errors';
import { BaseModule } from '#http/modules/base';

import type { Paginator } from '../../paginator';

export type UserCursorOptions = Partial<Omit<TakeUsersQuery, 'page' | 'limit'>>;

export class UsersModule extends BaseModule {
    /**
     * Получение полного профиля текущего пользователя (UserDto).
     */
    public takeMe = async (): Promise<
        InsigniaSdkResult<UserDto, UserErrorCode>
    > => {
        return this.execute<UserDto, UserErrorCode>(() =>
            this.http.get('v1/users/me').json<UserDto>(),
        );
    };

    /**
     * Алиас для метода takeMe.
     */
    public me = this.takeMe;

    /**
     * Получение публичного профиля пользователя по его уникальному идентификатору (UUIDv7).
     */
    public takeUserById = async (
        id: string,
    ): Promise<InsigniaSdkResult<PublicUserDto, UserErrorCode>> => {
        return this.execute<PublicUserDto, UserErrorCode>(() =>
            this.http.get(`v1/users/${id}`).json<PublicUserDto>(),
        );
    };

    /**
     * Прямой запрос списка пользователей со строгой пагинацией и поиском.
     */
    public takeUsers = async (
        query?: Partial<TakeUsersQuery>,
    ): Promise<
        InsigniaSdkResult<PaginatedData<PublicUserDto>, UserErrorCode>
    > => {
        return this.execute<PaginatedData<PublicUserDto>, UserErrorCode>(() =>
            this.http
                .get('v1/users', {
                    searchParams: this.toSearchParams(query),
                })
                .json<PaginatedData<PublicUserDto>>(),
        );
    };

    /**
     * Создание ленивого пагинатора (курсора) для последовательного перемещения по страницам списка пользователей.
     * Запрос не выполняется до вызова методов .next(), .prev() или .fetchPage().
     */
    public cursor = (
        options?: UserCursorOptions,
        initialLimit?: number,
    ): Paginator<PublicUserDto, UserErrorCode> => {
        return this.createPaginator<PublicUserDto, UserErrorCode>(
            (page, limit) =>
                this.takeUsers({
                    ...options,
                    page,
                    limit,
                }),
            initialLimit,
        );
    };

    /**
     * Алиас для метода cursor.
     */
    public paginate = this.cursor;
}
