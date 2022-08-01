export type Flag = boolean | string | number;
export type Command = (this: CommandInternal, args: string[], flags: Flags) => Promise<string> | string;
export type HasFlagHelper = (flagName: string, ...aliases: string[]) => boolean;
export type GetFlagHelper = (flagName: string, ...aliases: string[]) => Flag;
export type WhichFlagHelper = (flagName: string, ...aliases: string[]) => string;
export type GetArgAtHelper = (index: number) => string;
export type HasArgAtHelper = (index: number) => boolean;
export type CloneArgsHelper = () => string[];
export type ValueOrDefaultHelper = (value: any, defaultValue: any) => any;
export type LoggerFunction = (message: string) => Promise<void> | void;
export type ExtensionCallback = (this: PureCommandInternal,...args: any[]) => Promise<any> | any;
export type BoundExtensionCallback = (...args: any[]) => any | Promise<any>;
export type ExtensionBuilder = () => ExtensionCallbacks;
export type RunnerCommandGetter = (commandName: string) => Command;
export type RunnerCommandSetter = (commandName: string, callback: Command) => void;
export type RunnerCommandRemover = (commandName: string) => void;
export type RunnerHelpGetter = () => HelpDescriptor;
export type RunnerHelpSetter = (helpDescription: HelpDescriptor) => void;
export type RunnerExecutor = () => Promise<string | void>;

export interface CommandHelpers {
    hasFlag: HasFlagHelper;
    getFlag: GetFlagHelper;
    whichFlag: WhichFlagHelper;
    getArgAt: GetArgAtHelper;
    hasArgAt: HasArgAtHelper;
    cloneArgs: CloneArgsHelper;
    valueOrDefault: ValueOrDefaultHelper;
}

export interface PureCommandInternal {
    context?: any;
    helpers: CommandHelpers;
    appName: string;
}

export interface CommandInternal extends PureCommandInternal {
    extensions: BoundExtensions;
}
export interface Flags {
    [flagName: string]: Flag;
}

export interface Commands {
    [commandName: string]: Command | Commands;
}

export interface ArgDescriptor {
    name: string;
    optional?: boolean;
    multiple?: boolean;
}

export interface FlagDescriptor {
    description: string;
    aliases?: string[];
    optional?: boolean;
    values?: string[];
}

export interface FlagsDescriptor {
    [flagName: string]: FlagDescriptor | string;
}

export interface CommandDescriptor {
    description: string;
    args?: (string | ArgDescriptor)[];
    flags?: FlagsDescriptor;
}

export interface ParentCommandDescriptor {
    description?: string;
    subcommands: {
        [commandName: string]: ParentCommandDescriptor | CommandDescriptor | string;
    }
}

export interface HelpDescriptor {
    [commandName: string]: ParentCommandDescriptor | CommandDescriptor | string;
}

export interface FlagOptions {
    flagPrefix?: string;
    singleCharacterFlagPrefix?: string;
    singleCharacterFlagOnlyUppercase?: boolean;
    tryTypeInference?: boolean;
    parseFlags?: boolean;
    parseEmptyFlags?: boolean;
    helpFlags?: string[];
}

export interface Args {
    origin?: string[];
    flags?: FlagOptions;
}

export interface Behavior {
    keepArgsStartingFromIndex?: number;
    exitOnError?: boolean;
    returnResult?: boolean;
    logger?: LoggerFunction;
}

export interface BoundExtensions {
    [extensionName: string]: BoundExtensionCallbacks;
}

export interface BoundExtensionCallbacks {
    [callbackName: string]: BoundExtensionCallback;
}
export interface ExtensionCallbacks {
    [callbackName: string]: ExtensionCallback;
}

export interface Extension {
    name: string;
    builder: ExtensionBuilder;
}

export interface Options {
    appDescription?: string;
    args?: Args;
    behavior?: Behavior;
    context?: any;
    extensions?: Extension[];
    commands?: Commands;
    help?: HelpDescriptor;
}

export interface RunnerCommandHandlers {
    get: RunnerCommandGetter;
    set: RunnerCommandSetter;
    remove: RunnerCommandRemover;
}

export interface RunnerHelp {
    get: RunnerHelpGetter;
    set: RunnerHelpSetter;
}

export interface CliCoreRunner {
    command: RunnerCommandHandlers;
    help: RunnerHelp;
    run: RunnerExecutor;
}