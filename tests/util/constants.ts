import type CliCoreExtension from '../../src/interfaces/CliCoreExtension.js';
import type Args from '../../src/interfaces/Args.js';
import type Flags from '../../src/interfaces/Flags.js';

function createExecutionParameters(args: Args, flags: Flags) {
    return {
        args,
        flags
    };
}

export default {
    appName: 'cli-core-test-module',
    executionParameters: {
        empty: createExecutionParameters([], {}),
        singleArgument: createExecutionParameters(['0'], {}),
        multipleArguments: createExecutionParameters(
            ['0', '1', '2', '3', '4', '5'],
            {}
        ),
        singleFlag: createExecutionParameters([], { a: 0 }),
        multipleFlags: createExecutionParameters([], {
            a: 0,
            b: 'a',
            c: true,
            d: null
        }),
        singleAll: createExecutionParameters(['0'], { a: 0 }),
        multipleAll: createExecutionParameters(['0', '1', '2', '3', '4', '5'], {
            a: 0,
            b: 'a',
            c: true,
            d: null
        })
    },
    extensions: {
        a: {
            name: 'extensionA',
            buildCommandAddons: () => ({ methodA() {}, valueA: 'a' })
        } as CliCoreExtension,
        b: {
            name: 'extensionB',
            interceptors: {
                beforeParsing(_, x) {
                    return x;
                },
                beforeRouting(_, x) {
                    return x;
                },
                beforeRunning(_, x) {
                    return x;
                },
                beforeOutputing(_, x) {
                    return x;
                },
                beforeEnding(_) {}
            }
        } as CliCoreExtension,
        invalidName: {
            name: 'Invalid Name Extension',
            buildCommandAddons: () => ({})
        } as CliCoreExtension,
        invalidBuilder: {
            name: 'invalidBuilderExtension',
            buildCommandAddons: (() =>
                null) as unknown as CliCoreExtension['buildCommandAddons']
        } as CliCoreExtension,
        empty: {
            name: 'empty'
        } as CliCoreExtension
    },
    options: {}
} as const;
