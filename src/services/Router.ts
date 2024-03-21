import NavigationDetails from './NavigationDetails.js';

import type Args from '../interfaces/Args.js';
import type Flags from '../interfaces/Flags.js';

export type RouterInstance = ReturnType<typeof Router>;

export default function Router() {
    function navigate(args: Args, flags: Flags) {
        const details = NavigationDetails();

        const argumentsSize = args.length;

        console.log(args, flags, details, argumentsSize);
    }

    return {
        navigate
    };
}
