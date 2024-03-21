import type CliCoreExtension from 'src/interfaces/CliCoreExtension.js';
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
            build: _ => ({ methodA() {}, valueA: 'a' })
        } as CliCoreExtension,
        b: {
            name: 'extensionB',
            build: _ => ({ methodB() {}, valueB: 'b' })
        } as CliCoreExtension,
        invalidName: {
            name: 'Invalid Name Extension',
            build: _ => ({})
        } as CliCoreExtension,
        invalidBuilder: {
            name: 'invalidBuilderExtension',
            build: ((_: unknown) =>
                null) as unknown as CliCoreExtension['build']
        } as CliCoreExtension
    },
    options: {}
} as const;
