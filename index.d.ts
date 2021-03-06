export = cliCore;

type Flag = boolean | string | number;
type Command = (this: CommandInternal, args: string[], flags: Flags) => Promise<string> | string;
type HasFlagHelper = (flagName: string, ...aliases: string[]) => boolean;
type GetFlagHelper = (flagName: string, ...aliases: string[]) => Flag;
type WhichFlagHelper = (flagName: string, ...aliases: string[]) => string;
type GetArgAtHelper = (index: number) => string;
type HasArgAtHelper = (index: number) => boolean;
type CloneArgsHelper = () => string[];
type ValueOrDefaultHelper = (value: any, defaultValue: any) => any;
type LoggerFunction = (message: string) => Promise<void> | void;
type ExtensionCallback = (this: PureCommandInternal,...args: any[]) => Promise<any> | any;
type BoundExtensionCallback = (...args: any[]) => any | Promise<any>;
type ExtensionBuilder = () => ExtensionCallbacks;
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
    getArgAt: GetArgAtHelper;
    hasArgAt: HasArgAtHelper;
    cloneArgs: CloneArgsHelper;
    valueOrDefault: ValueOrDefaultHelper;
}

interface PureCommandInternal {
    context?: any;
    helpers: CommandHelpers;
    appName: string;
}

interface CommandInternal extends PureCommandInternal {
    extensions: BoundExtensions;
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

interface BoundExtensions {
    [extensionName: string]: BoundExtensionCallbacks;
}

interface BoundExtensionCallbacks {
    [callbackName: string]: BoundExtensionCallback;
}
interface ExtensionCallbacks {
    [callbackName: string]: ExtensionCallback;
}

interface Extension {
    name: string;
    builder: ExtensionBuilder;
}

interface Options {
    appDescription?: string;
    args?: Args;
    behavior?: Behavior;
    context?: any;
    extensions?: Extension[];
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

declare function cliCore(appName: string, options?: Options): CliCoreRunner;
