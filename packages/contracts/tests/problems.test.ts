import { describe, expect, test } from 'bun:test';

import {
    COMMON_PROBLEMS,
    findProblemByCode,
    findProblemBySlug,
    getAllProblemCodes,
    getAllProblemSlugs,
    getProblemsByCategory,
    HEALTH_PROBLEMS,
    ORGANIZATION_PROBLEMS,
    PROBLEM_DOCUMENTS,
    TELEGRAM_PROBLEMS,
    USER_PROBLEMS,
} from '../src/problems';

describe('RFC 9457 Problem Details Catalog', () => {
    test('contains registered problem documents across all platform domains', () => {
        expect(PROBLEM_DOCUMENTS.length).toBeGreaterThan(15);
        expect(COMMON_PROBLEMS.length).toBeGreaterThan(5);
        expect(USER_PROBLEMS.length).toBeGreaterThan(4);
        expect(TELEGRAM_PROBLEMS.length).toBeGreaterThan(3);
        expect(ORGANIZATION_PROBLEMS.length).toBeGreaterThan(4);
        expect(HEALTH_PROBLEMS.length).toBeGreaterThan(3);
    });

    test('all problem slugs are unique and strictly formatted (kebab-case)', () => {
        const slugs = getAllProblemSlugs();
        const uniqueSlugs = new Set(slugs);

        expect(uniqueSlugs.size).toBe(slugs.length);

        for (const slug of slugs) {
            expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        }
    });

    test('all problem codes are unique and uppercase SNAKE_CASE', () => {
        const codes = getAllProblemCodes();
        const uniqueCodes = new Set(codes);

        expect(uniqueCodes.size).toBe(codes.length);

        for (const code of codes) {
            expect(code).toMatch(/^[A-Z0-9]+(_[A-Z0-9]+)*$/);
        }
    });

    test('every problem document has complete, rich metadata conforming to RFC 9457', () => {
        for (const doc of PROBLEM_DOCUMENTS) {
            expect(doc.code.length).toBeGreaterThan(0);
            expect(doc.slug.length).toBeGreaterThan(0);
            expect(doc.title.length).toBeGreaterThan(0);
            expect(doc.status).toBeGreaterThanOrEqual(400);
            expect(doc.status).toBeLessThan(600);
            expect(doc.categoryLabel.length).toBeGreaterThan(0);
            expect(doc.summary.length).toBeGreaterThan(10);
            expect(doc.description.length).toBeGreaterThan(20);
            expect(doc.causes.length).toBeGreaterThan(0);
            expect(doc.remediation.length).toBeGreaterThan(0);
            expect(doc.relatedEndpoints.length).toBeGreaterThan(0);

            for (const step of doc.remediation) {
                expect(['client', 'developer', 'admin', 'devops']).toContain(
                    step.actor,
                );
                expect(step.title.length).toBeGreaterThan(0);
                expect(step.description.length).toBeGreaterThan(0);
            }
        }
    });

    test('findProblemBySlug resolves problem documents case-insensitively and returns undefined for unknown', () => {
        const userNotFound = findProblemBySlug('user-not-found');
        expect(userNotFound).toBeDefined();
        expect(userNotFound?.code).toBe('USER_NOT_FOUND');
        expect(userNotFound?.status).toBe(404);

        const upperSlug = findProblemBySlug('USER-NOT-FOUND');
        expect(upperSlug).toBeDefined();
        expect(upperSlug?.code).toBe('USER_NOT_FOUND');

        expect(findProblemBySlug('non-existent-problem')).toBeUndefined();
    });

    test('findProblemByCode resolves problem documents case-insensitively and returns undefined for unknown', () => {
        const validationError = findProblemByCode('VALIDATION_ERROR');
        expect(validationError).toBeDefined();
        expect(validationError?.slug).toBe('validation-error');
        expect(validationError?.status).toBe(422);

        const lowerCode = findProblemByCode('validation_error');
        expect(lowerCode).toBeDefined();
        expect(lowerCode?.slug).toBe('validation-error');

        expect(findProblemByCode('UNKNOWN_CODE')).toBeUndefined();
    });

    test('getProblemsByCategory filters correctly for each domain', () => {
        const usersProblems = getProblemsByCategory('users');
        expect(usersProblems.length).toBe(USER_PROBLEMS.length);
        expect(usersProblems.every((p) => p.category === 'users')).toBe(true);

        const healthProblems = getProblemsByCategory('health');
        expect(healthProblems.length).toBe(HEALTH_PROBLEMS.length);
        expect(healthProblems.every((p) => p.category === 'health')).toBe(true);
    });
});
