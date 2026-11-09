import type {
    CommonErrorCode,
    PaginatedData,
    PaginationMeta,
} from '@insignia/contracts/common';

import type { InsigniaSdkResult } from '#errors';

export type PaginatorFetcher<TItem, TCode extends string = CommonErrorCode> = (
    page: number,
    limit: number,
) => Promise<InsigniaSdkResult<PaginatedData<TItem>, TCode>>;

export class Paginator<TItem, TCode extends string = CommonErrorCode> {
    private currentItems: TItem[] = [];
    private currentMeta: PaginationMeta;

    constructor(
        private readonly fetcher: PaginatorFetcher<TItem, TCode>,
        initialLimit: number = 20,
    ) {
        this.currentMeta = {
            page: 0,
            limit: initialLimit,
            total: 0,
            totalPages: 0,
            hasNextPage: true,
            hasPrevPage: false,
        };
    }

    /**
     * Текущий срез данных: элементы и метаданные пагинации
     */
    public get current(): PaginatedData<TItem> {
        return {
            items: [...this.currentItems],
            meta: { ...this.currentMeta },
        };
    }

    /**
     * Список элементов последней загруженной страницы
     */
    public get items(): TItem[] {
        return [...this.currentItems];
    }

    /**
     * Метаданные текущего состояния пагинатора
     */
    public get meta(): PaginationMeta {
        return { ...this.currentMeta };
    }

    /** Текущий номер страницы (0 если еще ни разу не запрашивалась) */
    public get page(): number {
        return this.currentMeta.page;
    }

    /** Текущий лимит элементов на страницу */
    public get limit(): number {
        return this.currentMeta.limit;
    }

    /** Общее количество элементов во всей выборке */
    public get total(): number {
        return this.currentMeta.total;
    }

    /** Общее количество страниц */
    public get totalPages(): number {
        return this.currentMeta.totalPages;
    }

    /** Есть ли следующая страница */
    public get hasNextPage(): boolean {
        return this.currentMeta.hasNextPage;
    }

    /** Есть ли предыдущая страница */
    public get hasPrevPage(): boolean {
        return this.currentMeta.hasPrevPage;
    }

    /**
     * Изменить лимит элементов на страницу для последующих запросов.
     * Возвращает текущий инстанс для цепочки вызовов.
     */
    public setLimit = (limit: number): this => {
        this.currentMeta.limit = limit;
        return this;
    };

    /**
     * Сбросить состояние пагинатора к начальному
     */
    public reset = (): void => {
        this.currentItems = [];
        this.currentMeta = {
            page: 0,
            limit: this.currentMeta.limit,
            total: 0,
            totalPages: 0,
            hasNextPage: true,
            hasPrevPage: false,
        };
    };

    /**
     * Загрузить страницу по её номеру
     */
    public fetchPage = async (
        page: number,
    ): Promise<InsigniaSdkResult<PaginatedData<TItem>, TCode>> => {
        const result = await this.fetcher(page, this.currentMeta.limit);

        if (!result.success) {
            return result;
        }

        this.currentItems = result.data.items;
        this.currentMeta = { ...result.data.meta };

        return {
            success: true,
            data: {
                items: [...this.currentItems],
                meta: { ...this.currentMeta },
            },
        };
    };

    /**
     * Загрузить следующую страницу
     */
    public next = async (): Promise<
        InsigniaSdkResult<PaginatedData<TItem>, TCode>
    > => {
        const nextPage =
            this.currentMeta.page === 0 ? 1 : this.currentMeta.page + 1;
        return this.fetchPage(nextPage);
    };

    /**
     * Загрузить предыдущую страницу
     */
    public prev = async (): Promise<
        InsigniaSdkResult<PaginatedData<TItem>, TCode>
    > => {
        const prevPage = Math.max(1, this.currentMeta.page - 1);
        return this.fetchPage(prevPage);
    };

    /**
     * Асинхронный итератор для последовательного обхода всех страниц:
     * for await (const { items, meta } of paginator) { ... }
     */
    public async *[Symbol.asyncIterator](): AsyncGenerator<
        PaginatedData<TItem>,
        void,
        unknown
    > {
        while (this.currentMeta.hasNextPage || this.currentMeta.page === 0) {
            const res = await this.next();
            if (!res.success) {
                return;
            }
            yield res.data;
            if (!res.data.meta.hasNextPage) {
                break;
            }
        }
    }
}
