# cli-core

CLI Toolkit for building command-line applications in Node.js.
The library provides a flexible way to define commands, providing automatic parsing of arguments, flags, stdio handling and help generation. It also provides a rich extension system to extend the functionality of the final application.

## Summary

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Commands](#commands)
- [Help](#help)
- [Extensions](#extensions)
- [Debug Mode](#debug-mode)
- [Contributing](#contributing)

## Installation

Go back to [Summary](#summary)

npm:

```bash
# NPM
npm install --save @giancarl021/cli-core
# Yarn
yarn add @giancarl021/cli-core
# PNPM
pnpm add @giancarl021/cli-core
```

## Usage

Go back to [Summary](#summary)

```typescript
// Import the library
import CliCore, { defineCommand, type HelpDescriptor } from './index.js';

// Define some commands
const commands = {
    hello: defineCommand(() => 'Hello world!'),
    echo: defineCommand(args => args.join(' ')),
    complex: defineCommand(async function (args, flags) {
        const data = await this.helpers.readJsonFromStdin();

        this.logger.json({ stdin: data, args, flags });

        return this.NO_OUTPUT;
    })
};

// Define the help descriptor
const help: HelpDescriptor = {
    hello: 'Prints Hello world!',
    echo: {
        description: 'Echoes the arguments passed',
        args: ['arg1', { name: 'arg2', optional: true, multiple: true }]
    },
    complex: {
        description:
            'A complex command that reads JSON from stdin and prints it to stdout',
        args: [{ name: 'args', multiple: true, optional: true }],
        stdio: {
            stdin: 'Any json input (required)'
        },
        flags: {
            any: {
                description: 'An example flag',
                optional: true,
                values: ['any value']
            }
        }
    }
};

// Create a new instance of the CLI Core
const app = CliCore({
    appName: 'my-app',
    commands,
    help
});

// Run the application
app.run().catch(console.error);
```

This will create a command-line application with three commands: `hello`, `echo` and `complex`. The `hello` command will print `Hello world!`, the `echo` command will echo the arguments passed to it, and the `complex` command will read JSON from stdin and print it to stdout along with the arguments and flags passed.

To see the help for the application, you can run any command or the application itself with the `--help` flag. This will show a detailed help message with the description of the commands, their arguments and flags.

## Options

Go back to [Summary](#summary)

There are multiple options that can be passed to the CLI Core instance:

|               Option               |                            Type                            | Description                                                                                                                                                                                  |    Default value     |
| :--------------------------------: | :--------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------: |
|            `appName`\*             |                          `string`                          | The name of the application, the name called by the end user                                                                                                                                 |                      |
|            `commands`\*            |    [`CliCoreCommand`](src/interfaces/CliCoreCommand.ts)    | The commands of the application, for more information refer to [Commands](#commands)                                                                                                         |                      |
|          `appDescription`          |                      `string \| null`                      | The general description of the application, showed in the root help command if truthy                                                                                                        |        `null`        |
|         `arguments.origin`         |                         `string[]`                         | The origin of the arguments, the default is the process arguments                                                                                                                            |    `process.argv`    |
|      `arguments.ignoreFirst`       |                          `number`                          | The index of the arguments that should be ignored, default is `2`, to ignore the `node script.js ...`                                                                                        |         `2`          |
|      `arguments.flags.parse`       |                         `boolean`                          | If the flags should be treated separately from the arguments, default is `true`                                                                                                              |        `true`        |
|    `arguments.flags.inferTypes`    |                         `boolean`                          | Try to infer the type of the flag, default is `true`, example: `--flag true` will return the boolean `true` in the flags object if this option is enabled, but the string `"true"` otherwise |        `true`        |
| `arguments.flags.ignoreEmptyFlags` |                         `boolean`                          | Ignore empty flag names, default is `false`.                                                                                                                                                 |       `false`        |
|     `arguments.flags.prefixes`     |                         `string[]`                         | The prefixes for the flags.                                                                                                                                                                  |    `['-', '--']`     |
|    `arguments.flags.helpFlags`     |                         `string[]`                         | Flags that will trigger the help command for the current command chain                                                                                                                       | `['h', 'help', '?']` |
|        `behavior.debugMode`        |                         `boolean`                          | If the application is in `debug mode`, for more information refer to [Debug mode](#debug-mode)                                                                                               |       `false`        |
|     `behavior.colorfulOutput`      |                         `boolean`                          | If the output should contain ASCII colors. When `false`, the output will be plain text.                                                                                                      |        `true`        |
|               `help`               |    [`HelpDescriptor`](src/interfaces/HelpDescriptor.ts)    | The help descriptor object, for more information refer to [Help](#help)                                                                                                                      |         `{}`         |
|            `extensions`            | [`CliCoreExtension[]`](src/interfaces/CliCoreExtension.ts) | A list of extensions to extend the functionality of the commands, for more information refer to [Extensions](#extensions)                                                                    |         `[]`         |

> **\*** This option is required.

## Commands

Go back to [Summary](#summary)

The commands are the core of the application. Each command is a function that will be executed when the command is called.

A command can be a `function` (synchronous or asynchronous) or an `object` containing multiple `functions` or another objects (nested commands).

The routing of the commands is done by matching the arguments passed to the application with the command names.

For example, let's say we have the following commands:

```typescript
const commands = {
    hello: defineCommand(() => 'Hello world!'),
    sub1: {
        sub2: {
            sub3: defineCommand(() => 'It is dark down here!')
        }
    }
};
```

To call the `hello` command, the user would run:

```bash
my-app hello
```

And to call the `sub3` command, the user would run:

```bash
my-app sub1 sub2 sub3
```

The arguments passed to the command are the remaining arguments after the command names. So the `sub3` sub-command would not receive any arguments in this case, only after the routing is done: `my-app sub1 sub2 sub3 <arguments passed to the sub3 command>`.

Each command function receives the following parameters:

```typescript
function command(
    args: string[],
    flags: Record<string, boolean | string | number | null>
) {
    // ...
}
```

The `args` parameter is an array of strings containing the arguments passed to the command.

The `flags` parameter is an object containing the flags passed to the command. The keys are the flag names (without the prefixes) and the values are the flag values. If a flag is passed without a value, it will be set to `null`. If a flag is not passed, it will not be present in the object.

Also, the command has a `this` context containing some useful services and constants:

```typescript
function command() {
    this.appName; // The name of the application
    this.logger; // The logger service, allowing better logging to the console, even more in debug mode
    this.stdio; // The stdio service, exposing the process stdin, stdout and stderr streams
    this.extensions; // The extensions service, allowing to use the extensions added to the application
    this.helpers.cloneArgs(); // Clone the arguments array
    this.helpers.getArgAt(0); // Get a specific argument
    this.helpers.getArgOrDefault('default', 0); // Get an argument or a default value
    this.helpers.hasArgAt(0); // Check if an argument exists at a specific index
    this.helpers.requireArgs('first', 'second'); // Require named arguments, throws if missing and returns an object with the values

    this.helpers.hasFlag('any', 'alias1', 'alias2'); // Check if a flag exists
    this.helpers.getFlag('any', 'alias1', 'alias2'); // Get the value of a flag
    this.helpers.getFlagOrDefault('default', 'any', 'alias1', 'alias2'); // Get a flag value or a default value
    this.helpers.whichFlag('any', 'alias1', 'alias2'); // Get the actual flag name used

    this.helpers.getStdin(); // Get the stdin stream
    this.helpers.getStdout(); // Get the stdout stream
    this.helpers.getStderr(); // Get the stderr stream
    this.helpers.writeJsonToStdout({ test: true }); // Write JSON to stdout
    this.helpers.writeJsonToStderr({ test: true }); // Write JSON to stderr
    await this.helpers.readJsonFromStdin(); // Read JSON from stdin asynchronously (WARNING: will lock the process until EOF)

    return this.NO_OUTPUT; // A special constant that can be returned to indicate that the command should not print anything to the console
}
```

The command must return a value, which will be printed to the console. If the command does not return anything, it will print `undefined`. To avoid this, the command can return the special symbol `this.NO_OUTPUT`, which indicates that the command should not print anything to the console.

## Help

Go back to [Summary](#summary)

The help system is automatically generated based on the commands and the help descriptor object passed to the CLI Core instance.

The help can be triggered by passing the `--help` flag (or any of the flags defined in the `arguments.flags.helpFlags` option) to any command or the application itself.

> **Note:** The help will also be triggered if a command group (object with subcommands) is the last argument in the command chain. In conjunction with the help showing up, a error status code will be returned.

The help descriptor is an object that describes the commands, their arguments and flags. The example below shows a help descriptor object:

```typescript
import {
    defineMultiCommandHelpDescriptor,
    defineSingleCommandHelpDescriptor
} from './index';

const singleCommandHelp = defineSingleCommandHelpDescriptor({
    description: 'A simple greet command',
    args: [
        {
            name: 'name',
            multiple: false,
            optional: false
        }
    ],
    flags: {
        excited: {
            aliases: ['E'],
            description: 'Whether to greet excitedly',
            optional: true,
            values: ['true', 'false']
        }
    },
    stdio: {
        stderr: 'Shown when an error occurs',
        stdout: 'Shown when the command runs successfully',
        stdin: 'Not used'
    }
});

const multiCommandHelp = defineMultiCommandHelpDescriptor({
    greet: 'Say hello',
    farewell: {
        description: 'Say goodbye'
    },
    math: {
        description: 'Perform mathematical operations',
        subcommands: {
            add: {
                description: 'Add numbers',
                args: ['a', 'b'],
                flags: {
                    verbose: 'Whether to show detailed output'
                }
            }
        }
    }
});
```

As you can see, the help descriptor can be defined using two helper functions: `defineSingleCommandHelpDescriptor` and `defineMultiCommandHelpDescriptor`. The first one is used to define the help for a single command, while the second one is used to define the help for multiple commands.

> **Important:** The `defineSingleCommandHelpDescriptor` brands the object with a `$schema` property set to `#SingleCommandHelpDescriptor` to make it easily identifiable. If the object does not have this property, it will be treated as a `MultiCommandHelpDescriptor`, so be careful when manually creating the help descriptor object.

There are two JSON schema files available for the help descriptor objects:

- [Single-command applications](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/6e7845f843c76cd46c7cc03a1a3dc44de889a01f/single-command-help-descriptor.schema.json)
- [Multi-command applications](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/6e7845f843c76cd46c7cc03a1a3dc44de889a01f/multi-command-help-descriptor.schema.json)

These can be used to validate the help descriptor object during development as a JSON file.

> **Important:** Remember to pass the imported JSON object to the `defineSingleCommandHelpDescriptor` or `defineMultiCommandHelpDescriptor` functions to brand it correctly.

## Extensions

Go back to [Summary](#summary)

The extension system allows to extend the functionality of the commands. An extension is an object that contains multiple methods that will be added to the command's `this.extensions` object. The extension can also intercept the cli-core pipeline steps using the interceptor hooks.

To create an extension, you need to create an object that implements the `CliCoreExtension` interface:

```typescript
import type { CliCoreExtension } from '@giancarl021/cli-core';

const MyExtension: CliCoreExtension = {
    name: 'myExtension', // The name of the extension, must be unique and contain only alphanumeric characters and underscores (not starting with a number)
    buildCommandAddons(options) {
        // Everything returned here will be available in the command's `this.extensions.myExtension`
        return {
            myExtensionConst: 1e6,
            myExtensionMethod() {
                const flag = options.helpers.getFlagOrDefault(
                    'default',
                    'flag1',
                    'alias1'
                ); // All the helpers are available here

                return options.appName + ' is awesome!';
            }
        };
    },
    interceptors: {
        beforeParsing(options, rawArgs) {
            options; // All the options passed to the CliCore instance (except extensions) are available here. Read-only.
            rawArgs; // The raw arguments passed to the application, usually process.argv

            // You can modify the options and rawArgs here if needed, or do a pre-loading step

            return rawArgs;
        },
        beforeRouting(options, input) {
            options; // All the options passed to the CliCore instance (except extensions) are available here. Read-only.
            input; // The parsed arguments and flags

            // You can modify the input here if needed, or do a pre-routing step
            return input;
        },
        beforeRunning(options, route) {
            options; // All the options passed to the CliCore instance (except extensions) are available here. Read-only.
            route; // The resolved command route, containing the command callback, args and flags

            // You can modify the route here if needed, or do a pre-execution step
            // One example is to add dynamic commands, avoiding the need to declare them at startup

            return route;
        },
        beforePrinting(options, output) {
            options; // All the options passed to the CliCore instance (except extensions) are available here. Read-only.
            output; // The output of the command, can be a string or the NO_OUTPUT symbol

            // You can modify the output here if needed, or do a pre-printing step

            return output;
        },
        beforeEnding(options) {
            options; // All the options passed to the CliCore instance (except extensions) are available here. Read-only.

            // This is the last step before ending the process, you can do some cleanup here if needed.
        }
    }
};
```

### Interface augmentation in TypeScript

To make TypeScript aware of the extension methods, you need to augment the `CliCoreCommandAddons` interface:

```typescript
declare module '@giancarl021/cli-core' {
    interface CliCoreCommandAddons {
        myExtension: {
            myExtensionMethod(): string;
            myExtensionConst: number;
        };
    }
}
```

This will make TypeScript aware of the `myExtension` object in the command's `this.extensions` object.

## Debug Mode

Go back to [Summary](#summary)

The debug mode can be enabled by setting the `behavior.debugMode` option to `true`. When enabled, the application will change some behaviors to make debugging easier:

- The logger will print `debug` level logs
- The logger will prefix each message with a timestamp and the log level
- The instance return the result of the command instead of printing it to the console
- Any error thrown will be propagated instead of being caught and printed to the console
- Any `process.exit` calls will be ignored

## Contributing

Go back to [Summary](#summary)

Contributions are welcome! Please open an issue or a pull request on GitHub.

Currently the code is 100% covered by tests, so please make sure to add tests for any new functionality.
