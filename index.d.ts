export = main;

type Flag = boolean | string | number;
type Command = (this: CommandInternal, args: string[], flags: Flags) => Promise<string> | string;
type HasFlagHelper = (flagName: string, ...aliases: string[]) => boolean;
type GetFlagHelper = (flagName: string, ...aliases: string[]) => Flag;
type WhichFlagHelper = (flagName: string, ...aliases: string[]) => string;
type LoggerFunction = (message: string) => Promise<void> | void;
type RunnerCommandGetter = (commandName: string) => Command;
type RunnerCommandSetter = (commandName: string, callback: Command) => void;
type RunnerCommandRemover = (commandName: string) => void;
type RunnerHelpGetter = () => HelpDescriptor;
type RunnerHelpSetter = (helpDescription: HelpDescriptor) => void;
type RunnerExecutor = () => Promise<string | void>;

interface CommandHelpers {
    hasFlag: HasFlagHelper;
    getFlag: GetFlagHelper;
    whichFlag: WhichFlagHelper;
}

interface CommandInternal {
    context?: any;
    helpers: CommandHelpers;
}
interface Flags {
    [flagName: string]: Flag;
}

interface Commands {
    [commandName: string]: Command | Commands;
}

interface ArgDescriptor {
    name: string;
    optional?: boolean;
    multiple?: boolean;
}

interface FlagDescriptor {
    description: string;
    aliases?: string[];
    optional?: boolean;
    values?: string[];
}

interface FlagsDescriptor {
    [flagName: string]: FlagDescriptor | string;
}

interface CommandDescriptor {
    description: string;
    args?: (string | ArgDescriptor)[];
    flags?: FlagsDescriptor;
}

interface ParentCommandDescriptor {
    description?: string;
    subcommands: {
        [commandName: string]: ParentCommandDescriptor | CommandDescriptor | string;
    }
}

interface HelpDescriptor {
    [commandName: string]: ParentCommandDescriptor | CommandDescriptor | string;
}

interface FlagOptions {
    flagPrefix?: string;
    singleCharacterFlagPrefix?: string;
    singleCharacterFlagOnlyUppercase?: boolean;
    tryTypeInference?: boolean;
    parseFlags?: boolean;
    parseEmptyFlags?: boolean;
    helpFlags?: string[];
}

interface Args {
    origin?: string[];
    flags?: FlagOptions;
}

interface Behavior {
    keepArgsStartingFromIndex?: number;
    exitOnError?: boolean;
    returnResult?: boolean;
    logger?: LoggerFunction;
}

interface Options {
    appDescription?: string;
    args?: Args;
    behavior?: Behavior;
    context?: any;
    commands?: Commands;
    help?: HelpDescriptor;
}

interface RunnerCommandHandlers {
    get: RunnerCommandGetter;
    set: RunnerCommandSetter;
    remove: RunnerCommandRemover;
}

interface RunnerHelp {
    get: RunnerHelpGetter;
    set: RunnerHelpSetter;
}

interface CliCoreRunner {
    command: RunnerCommandHandlers;
    help: RunnerHelp;
    run: RunnerExecutor;
}

declare function main(appName: string, options: Options): CliCoreRunner;
