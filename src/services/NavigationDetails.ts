import type { CliCoreCommand } from '../interfaces/CliCoreCommand.js';
import type Nullable from '../interfaces/Nullable.js';

export type NavigationDetailsInstance = ReturnType<typeof NavigationDetails>;

interface Context {
    isHelp: boolean;
    open: boolean;
    commandChain: string[];
    error: Nullable<Error>;
    callback: Nullable<CliCoreCommand>;
}

export default function NavigationDetails() {
    const context: Context = {
        error: null,
        commandChain: [],
        isHelp: false,
        open: true,
        callback: null
    };

    function _requireOpen() {
        if (!context.open)
            throw new Error(
                'Cannot set information to navigation details after it is closed'
            );
    }

    function _requireClosed() {
        if (context.open)
            throw new Error(
                'Cannot retrieve information from navigation details while it is open'
            );
    }

    function _close() {
        _requireOpen();
        context.open = false;
    }

    function setHelpFlag() {
        _requireOpen();
        context.isHelp = true;
    }

    function setError(error: Error) {
        _requireOpen();
        context.error = error;
        _close();
    }

    function setCallback(callback: CliCoreCommand) {
        _requireOpen();
        context.callback = callback;
        _close();
    }

    function addCommand(commandName: string) {
        _requireOpen();
        context.commandChain.push(commandName);
    }

    function getStatus(): 'error' | 'help' | 'command' {
        _requireClosed();
        if (context.error) return 'error';
        if (context.isHelp) return 'help';

        if (context.callback) return 'command';

        return 'error';
    }

    function getCommandChain(): Readonly<string[]> {
        _requireClosed();
        return Object.freeze(structuredClone(context.commandChain));
    }

    function getError(): Error {
        _requireClosed();
        if (!context.error)
            throw new Error('Error not found in navigation details');
        return context.error;
    }

    function getCallback(): CliCoreCommand {
        _requireClosed();
        if (!context.callback)
            throw new Error('Callback not found in navigation details');

        return context.callback;
    }

    return {
        getStatus,
        getCommandChain,
        getError,
        getCallback,
        setHelpFlag,
        setError,
        addCommand,
        setCallback
    };
}
