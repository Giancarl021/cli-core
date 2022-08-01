export = cliCore;

import { Options, CliCoreRunner } from './interfaces';

declare function cliCore(appName: string, options?: Options): CliCoreRunner;
