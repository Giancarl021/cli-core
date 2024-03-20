import Args from '../../src/interfaces/Args.js';
import Flags from '../../src/interfaces/Flags.js';

function createExecutionParameters(args: Args, flags: Flags) {
    return {
        args,
        flags
    };
}

export default {
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
    }
} as const;
