import { describe, expect, test } from 'bun:test';

import { createLogger } from '../src/index';

describe('Logger Package', () => {
    test('createLogger instantiates a logger with standard methods', () => {
        const logger = createLogger('test');
        expect(logger.namespace).toBe('test');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.child).toBe('function');
    });

    test('logger.child creates a sub-namespace logger', () => {
        const parent = createLogger('core');
        const child = parent.child('service');
        expect(child.namespace).toBe('core:service');
    });
});
