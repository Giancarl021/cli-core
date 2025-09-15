import {
    describe,
    test,
    expect,
    beforeEach,
    jest,
    afterAll
} from '@jest/globals';
import Logger, { LoggerFactory } from '../../../src/services/Logger.js';
import type { MockService } from '../../util/types.js';

const mockInstance: MockService<typeof Logger> = {
    debug: expect.any(Function),
    info: expect.any(Function),
    warning: expect.any(Function),
    error: expect.any(Function),
    json: expect.any(Function),
    colors: expect.any(Function),
    format: expect.objectContaining({
        join: expect.any(Function),
        debug: expect.any(Function),
        info: expect.any(Function),
        warning: expect.any(Function),
        error: expect.any(Function),
        json: expect.any(Function)
    })
};

const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

beforeEach(() => {
    jest.resetAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('[UNIT] services/ExtensionBundler', () => {
    test('Normal mode / Forced colorful output', () => {
        const logger = Logger(
            {
                behavior: {
                    debugMode: false,
                    colorfulOutput: 1
                }
            },
            'Test'
        );

        expect(logger).toMatchObject(expect.objectContaining(mockInstance));

        logger.debug('This is a debug message');
        expect(consoleLogSpy).not.toHaveBeenCalled();

        logger.info('This is an info message');

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an info message')
        );

        logger.warning('This is a warning message');
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is a warning message')
        );

        logger.error(new Error('This is an error message'));
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an error message')
        );

        logger.json({ key: 'value', number: 123, nested: { a: 1, b: 2 } });
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('{')
        );

        expect(logger.format.join('Hello', 'World')).toBe('Hello World');

        expect(logger.colors('Test', 'red')).toContain('Test');
        expect(logger.format.debug('Debug message')).toContain('Debug message');
        expect(logger.format.info('Info message')).toContain('Info message');
        expect(logger.format.warning('Warning message')).toContain(
            'Warning message'
        );
        expect(logger.format.error(new Error('Error message'))).toContain(
            'Error message'
        );
        expect(logger.format.json({ test: true })).toContain('{');
        expect(logger.colors.red('Test')).toContain('\u001b[31mTest\u001b[39m');
    });

    test('Normal mode / Automatic colorful output', () => {
        const logger = Logger(
            {
                behavior: {
                    debugMode: false,
                    colorfulOutput: true
                }
            },
            'Test'
        );

        expect(logger).toMatchObject(expect.objectContaining(mockInstance));

        logger.debug('This is a debug message');
        expect(consoleLogSpy).not.toHaveBeenCalled();

        logger.info('This is an info message');

        expect(consoleLogSpy).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an info message')
        );

        logger.warning('This is a warning message');
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is a warning message')
        );

        logger.error(new Error('This is an error message'));
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an error message')
        );

        logger.json({ key: 'value', number: 123, nested: { a: 1, b: 2 } });
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('{')
        );

        expect(logger.format.join('Hello', 'World')).toBe('Hello World');

        expect(logger.colors('Test', 'red')).toContain('Test');
        expect(logger.format.debug('Debug message')).toContain('Debug message');
        expect(logger.format.info('Info message')).toContain('Info message');
        expect(logger.format.warning('Warning message')).toContain(
            'Warning message'
        );
        expect(logger.format.error(new Error('Error message'))).toContain(
            'Error message'
        );
        expect(logger.format.json({ test: true })).toContain('{');
    });

    test('Debug mode / Colorless output', () => {
        const logger = Logger(
            {
                behavior: {
                    debugMode: true,
                    colorfulOutput: false
                }
            },
            'Test'
        );

        expect(logger).toMatchObject(expect.objectContaining(mockInstance));

        logger.debug('This is a debug message');
        expect(consoleLogSpy).toHaveBeenCalledTimes(1);

        logger.info('This is an info message');

        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an info message')
        );

        logger.warning('This is a warning message');
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is a warning message')
        );

        logger.error(new Error('This is an error message'));
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('This is an error message')
        );

        logger.json({ key: 'value', number: 123, nested: { a: 1, b: 2 } });
        expect(consoleLogSpy).toHaveBeenCalledTimes(3);
        expect(consoleLogSpy).toHaveBeenLastCalledWith(
            expect.stringContaining('{')
        );

        expect(logger.format.join('Hello', 'World')).toBe('Hello World');

        expect(logger.colors('Test', 'red')).toContain('Test');
        expect(logger.format.debug('Debug message')).toContain('Debug message');
        expect(logger.format.info('Info message')).toContain('Info message');
        expect(logger.format.warning('Warning message')).toContain(
            'Warning message'
        );
        expect(logger.format.error(new Error('Error message'))).toContain(
            'Error message'
        );
        expect(logger.format.json({ test: true })).toContain('{');
    });

    test('Logger factory', () => {
        const loggerFactory = LoggerFactory({
            behavior: {
                debugMode: true,
                colorfulOutput: false
            }
        });

        const logger = loggerFactory('FactoryTest');

        expect(logger).toMatchObject(expect.objectContaining(mockInstance));
    });
});
