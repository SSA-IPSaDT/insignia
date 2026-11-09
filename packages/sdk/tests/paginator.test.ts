import { describe, expect, it } from 'bun:test';

import type { PaginatedData } from '@insignia/contracts/common';

import type { InsigniaSdkResult } from '../src/errors';
import { Paginator, type PaginatorFetcher } from '../src/http/paginator';

interface MockItem {
    id: number;
    name: string;
}

const createMockFetcher = (
    totalItems: number = 55,
): {
    fetcher: PaginatorFetcher<MockItem>;
    calls: { page: number; limit: number }[];
} => {
    const calls: { page: number; limit: number }[] = [];

    const fetcher: PaginatorFetcher<MockItem> = async (page, limit) => {
        calls.push({ page, limit });
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalItems);

        const items: MockItem[] = [];
        for (let i = startIndex; i < endIndex; i++) {
            items.push({ id: i + 1, name: `User ${i + 1}` });
        }

        const data: PaginatedData<MockItem> = {
            items,
            meta: {
                page,
                limit,
                total: totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };

        return { success: true, data };
    };

    return { fetcher, calls };
};

describe('SDK Paginator (Cursor)', () => {
    it('initializes with default state before first request', () => {
        const { fetcher } = createMockFetcher();
        const paginator = new Paginator(fetcher, 25);

        expect(paginator.page).toBe(0);
        expect(paginator.limit).toBe(25);
        expect(paginator.total).toBe(0);
        expect(paginator.totalPages).toBe(0);
        expect(paginator.hasNextPage).toBe(true);
        expect(paginator.hasPrevPage).toBe(false);
        expect(paginator.items).toEqual([]);
        expect(paginator.current.items).toEqual([]);
    });

    it('next() on initial state requests page 1 and returns Variant B data envelope', async () => {
        const { fetcher, calls } = createMockFetcher(50);
        const paginator = new Paginator(fetcher, 20);

        const res = await paginator.next();

        expect(res.success).toBe(true);
        if (res.success) {
            expect(res.data.items.length).toBe(20);
            expect(res.data.items[0]?.name).toBe('User 1');
            expect(res.data.meta.page).toBe(1);
            expect(res.data.meta.limit).toBe(20);
            expect(res.data.meta.total).toBe(50);
            expect(res.data.meta.totalPages).toBe(3);
            expect(res.data.meta.hasNextPage).toBe(true);
            expect(res.data.meta.hasPrevPage).toBe(false);
        }

        expect(calls).toEqual([{ page: 1, limit: 20 }]);
        expect(paginator.page).toBe(1);
        expect(paginator.hasNextPage).toBe(true);
        expect(paginator.hasPrevPage).toBe(false);
    });

    it('next() sequentially moves through pages and detects end of list', async () => {
        const { fetcher } = createMockFetcher(35);
        const paginator = new Paginator(fetcher, 15);

        // Страница 1 (15 элементов)
        const p1 = await paginator.next();
        expect(p1.success).toBe(true);
        expect(paginator.page).toBe(1);
        expect(paginator.hasNextPage).toBe(true);

        // Страница 2 (15 элементов)
        const p2 = await paginator.next();
        expect(p2.success).toBe(true);
        expect(paginator.page).toBe(2);
        expect(paginator.hasNextPage).toBe(true);

        // Страница 3 (5 элементов - конец)
        const p3 = await paginator.next();
        expect(p3.success).toBe(true);
        if (p3.success) {
            expect(p3.data.items.length).toBe(5);
            expect(p3.data.meta.hasNextPage).toBe(false);
        }
        expect(paginator.page).toBe(3);
        expect(paginator.hasNextPage).toBe(false);
        expect(paginator.hasPrevPage).toBe(true);
    });

    it('prev() navigates backwards and does not go below page 1', async () => {
        const { fetcher } = createMockFetcher(40);
        const paginator = new Paginator(fetcher, 10);

        await paginator.fetchPage(3);
        expect(paginator.page).toBe(3);

        await paginator.prev();
        expect(paginator.page).toBe(2);

        await paginator.prev();
        expect(paginator.page).toBe(1);

        // Еще один prev() на 1 странице остается на 1
        await paginator.prev();
        expect(paginator.page).toBe(1);
    });

    it('setLimit() updates limit for subsequent requests', async () => {
        const { fetcher, calls } = createMockFetcher(100);
        const paginator = new Paginator(fetcher, 10);

        await paginator.next();
        expect(calls[0]).toEqual({ page: 1, limit: 10 });

        paginator.setLimit(50);
        expect(paginator.limit).toBe(50);

        await paginator.next();
        expect(calls[1]).toEqual({ page: 2, limit: 50 });
    });

    it('reset() returns paginator to initial unrequested state', async () => {
        const { fetcher } = createMockFetcher(50);
        const paginator = new Paginator(fetcher, 20);

        await paginator.next();
        expect(paginator.page).toBe(1);
        expect(paginator.items.length).toBe(20);

        paginator.reset();
        expect(paginator.page).toBe(0);
        expect(paginator.items).toEqual([]);
        expect(paginator.total).toBe(0);
    });

    it('for await iterates through all pages until finished', async () => {
        const { fetcher } = createMockFetcher(25);
        const paginator = new Paginator(fetcher, 10);

        const collectedIds: number[] = [];
        let pageCount = 0;

        for await (const page of paginator) {
            pageCount++;
            for (const item of page.items) {
                collectedIds.push(item.id);
            }
        }

        expect(pageCount).toBe(3); // 10, 10, 5
        expect(collectedIds.length).toBe(25);
        expect(collectedIds[0]).toBe(1);
        expect(collectedIds[24]).toBe(25);
    });

    it('propagates Result Pattern failure if fetcher returns error', async () => {
        const failingFetcher: PaginatorFetcher<MockItem> = async () => ({
            success: false,
            error: {
                type: 'api',
                status: 500,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal server error',
            },
        });

        const paginator = new Paginator(failingFetcher);
        const res = await paginator.next();

        expect(res.success).toBe(false);
        if (!res.success) {
            expect(res.error.code).toBe('INTERNAL_SERVER_ERROR');
        }

        // Состояние не должно было обновиться в сторону успеха
        expect(paginator.page).toBe(0);
        expect(paginator.items).toEqual([]);
    });
});
