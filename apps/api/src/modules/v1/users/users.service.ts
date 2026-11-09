import type { TakeUsersQuery, UserBase, UserDto } from '@insignia/contracts';
import { db, tsquery, websearchToTsquery } from '@insignia/database';
import { activeOnly } from '@insignia/database/fragments';

export const takePublicUserById = (id: UserBase['id']) =>
    db.orm.public.User.where({
        id,
    })
        .with(activeOnly)
        .select(
            'id',
            'lastName',
            'firstName',
            'patronymic',
            'avatarUrl',
            'userName',
        )
        .first();

export const takeMeById = (id: UserBase['id']) =>
    db.orm.public.User.where({
        id,
    })
        .with(activeOnly)
        .first();

export const takeUsers = async (query: TakeUsersQuery) => {
    const { page, limit, search, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    let collection = db.orm.public.User.with(activeOnly);

    if (search && search.trim().length > 0) {
        const trimmed = search.trim();
        const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
        const firstWord = words[0];
        const ftsQuery =
            words.length === 1 && firstWord !== undefined
                ? tsquery({ language: 'russian' })`${firstWord}:*`
                : websearchToTsquery(trimmed, { language: 'russian' });

        collection = collection.using.users_search(ftsQuery);
    }

    const countPromise = collection.aggregate((a) => ({
        total: a.count(),
    }));

    let queryChain = collection.select(
        'id',
        'lastName',
        'firstName',
        'patronymic',
        'avatarUrl',
        'userName',
    );

    switch (sortBy) {
        case 'firstName': {
            queryChain = queryChain.orderBy((u) =>
                sortOrder === 'asc' ? u.firstName.asc() : u.firstName.desc(),
            );
            break;
        }
        case 'lastName': {
            queryChain = queryChain.orderBy((u) =>
                sortOrder === 'asc'
                    ? u.lastName.asc({ nulls: 'last' })
                    : u.lastName.desc({ nulls: 'last' }),
            );
            break;
        }
        case 'userName': {
            queryChain = queryChain.orderBy((u) =>
                sortOrder === 'asc'
                    ? u.userName.asc({ nulls: 'last' })
                    : u.userName.desc({ nulls: 'last' }),
            );
            break;
        }
        case 'email': {
            queryChain = queryChain.orderBy((u) =>
                sortOrder === 'asc'
                    ? u.email.asc({ nulls: 'last' })
                    : u.email.desc({ nulls: 'last' }),
            );
            break;
        }
        case 'createdAt':
        default: {
            queryChain = queryChain.orderBy((u) =>
                sortOrder === 'asc' ? u.createdAt.asc() : u.createdAt.desc(),
            );
            break;
        }
    }

    const itemsPromise = queryChain.offset(offset).limit(limit).all();

    const [countResult, items] = await Promise.all([
        countPromise,
        itemsPromise,
    ]);

    return {
        items,
        total: countResult.total,
    };
};
