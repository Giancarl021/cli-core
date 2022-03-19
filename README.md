# cli-core

CLI wrapper to make easier to create tools

## Installation

npm:

```bash
npm install --save @giancarl021/cli-core
```

Yarn:

```bash
yarn add @giancarl021/cli-core
```

## Usage

First import the library:

```javascript
const cliCore = require('@giancarl021/cli-core');
```

Then you can create the runner:

```javascript
const runner = cliCore(appName, options);
```

The runner needs two parameters to be created:

| Parameter | Description | Type | Required |
| --------- | ----------- | ---- | -------- |
| `appName` | The name of the application, will show in error and help messages | `string` | Yes |
| `options` | The options of the application, will define the behavior of the application, like commands, flag parsing and command context | `object` | No |

### App Name

The `appName` string is the name of the application, the name called by the end user. Example:

```javascript
const appName = 'cli-core-example';
```

This should match with the application name:

```bash
cli-core-example arg1 arg2 --flag1 <value> --flag2
```

> Note: To call the application without the `node <file.js>` before the arguments and flags, you can use the [`bin` property](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#bin) in the `package.json`.

### Options

The `options` object contains all the properties needed to define the runner's behavior. The shape of the object is the following:

```javascript
const options = {
    appDescription: null, // {string} The general description of the application, showed in the root help command if truthy
        args: { // Settings for the arguments and flags parsed from the command line
            origin: process.argv, // {string[]} The origin of the arguments, the default is the process arguments
            flags: { // Settings for the flags parsed from the command line
                flagPrefix: '--', // {string} The prefix for the flag
                singleCharacterFlagPrefix: '-', // {string} The prefix for the single character flag
                singleCharacterFlagOnlyUppercase: false, // {boolean} If the single character flag should only be parsed if the character is uppercase
                tryTypeInference: true, // {boolean} Try to infer the type of the flag, default is true, example: '--flag true' will return the boolean true in the flags object if this option is enabled
                parseFlags: true, // {boolean} If the runner should parse the flags, default is true
                parseEmptyFlags: false, // {boolean} Allow empty flag names, default is false
                helpFlags: ['help', '?'] // {string[]} Flags that will trigger the help command for the current command chain
            }
        },
        behavior: { // Settings for the behavior of the runner
            keepArgsStartingFromIndex: 2, // {number} The index of the arguments that should be ignored, default is 2, example: 'node app.js arg1 arg2' will return the arguments 'arg1' and 'arg2'
            exitOnError: true, // {boolean} If the runner should call process.exit(1) on error, default is true
            returnResult: false, // {boolean} If the runner should return the result of the command, otherwise it will print to the logger function, default is false
            logger: async message => console.log(message) // {function} The logger function, default is console.log
        },
        context: {}, // {any} The context of the application, will be passed to the commands on the `this.context` variable, default is an empty object
        extensions: [], // {object[]} The extensions of the application, will be built and passed to the commands on the `this.extensions` variable, default is an empty array
        commands: {}, // {object} The commands of the application, the key is the command name, the value is the command object
        help: {} // {object} The help descriptor object, the key is the command name, the value is the command descriptor object
};
```

### Commands

The commands property is the main part of the application, it contains all the commands that the user would be able to call from the command-line. You can have nested commands, which will be routed according to the command chain used in the input.

Each command function will have a `this` object assigned to it with the following properties:

```typescript
interface CommandInternal {
    appName: string; // The name of the application
    context?: any; // The context of the application, completely defined and handled by the user
    helpers: CommandHelpers; // A set of helper functions to be used by the command, like parsing flags with aliases, etc
    extensions: BoundExtensions; // The extensions of the application, defined by the user and built by the runner
}
```

> **Important note:** As this package relies on `Function.prototype.bind` to assign the `this` object on each command, you should not use arrow functions if you want to access any property on the `this` object within the command function.

**Top-level command**

The shape of a top-level command is the following:

```javascript
const commands = {
    ['my-command']: function (args, flags) {
            // Accessing the appName:
            const appName = this.appName;

            // Accessing the context:
            const appContext = this.context;

            // Accessing extensions:
            const extensionResult = this.extensions.myExtension.doSomething();

            // Accessing flags using helpers:
            const isFlagEnabled = this.helpers.hasFlag('flagName', 'alias1', 'alias2');
            const flagValue = this.helpers.getFlag('flagName', 'alias1', 'alias2');

            // Accessing args using helpers:
            const argValue = this.helpers.getArgAt(0);
            const hasArgAtIndex1 = this.helpers.hasArgAt(1);

            // Accessing flags directly:
            const thisFlag = flags.this || flags.T;
            const isThatFlagTruthy = Boolean(flags.that || flags.TT);

            // Accessing args directly:
            const [arg1, arg2, ...restArgs] = args;

            // Return a string to the runner
            return 'Hello world!';
        }
};
```

The above command could be called from the command-line as:

```bash
<appName> my-command arg1 arg2 restArgs1 restArgs2 -T "someValue" --that true --flagName "anotherValue"
```

And the return value will always be `Hello world!`.

**Nested command**

Each nested command can have nested commands, and so on.
The shape of a nested command is the following:

```javascript
const commands = {
    ['my-command']: {
        ['my-nested-operation']: {
            ['my-deep-nested-operation']: function (arg, flags) {
                /* Command code */
                return 'Hello world from the deep!';
            }
        }
    }
};
```

The above command could be called from the command-line as:

```bash
<appName> my-command my-nested-operation my-deep-nested-operation <...args> <...flags>
```

And the return value will always be `Hello world from the deep!`.

### Help Descriptor

The help descriptor object is used to describe the commands defined on the application. The shape of the object is the following:

```javascript
const helpDescriptor = {
    myCommand1: 'Command description',
    myCommand2: {
        description: 'Command description',
        args: [
            'arg1',
            {
                name: 'argument',
                optional: false, // optional
                multiple: false // optional
            }
        ],
        flags: {
            flag1: {
                aliases: ['f', 'F', 'my-flag-the-first-one'], // optional
                description: 'My first flag description',
                values: ['any-value'], // optional
                optional: true // optional
            },
            flag2: 'My second flag description'
        }
    },
    myCommand3: {
        description: 'Deep command description', // optional
        subcommands: {
            myCommand4: 'Command description'
        }
    }
};
```

With the above help descriptor, the following output will be returned:

```bash
<appName> myCommand1 --help
<appName> myCommand1
  Description: Command description

<appName> myCommand2 --help
<appName> myCommand2 <arg1> <argument>
  Description: Command description
  Flags:
    --flag1 | -f | -F | --my-flag-the-first-one: My first flag description
      Values: any-value
    --flag2: My second flag description

<appName> myCommand3 --help # In this case, the help will be returned if you call the command directly without any subcommand
<appName> myCommand3
  Description: Deep command description
  Subcommands:
    myCommand4: Command description

<appName> myCommand3 myCommand4 --help
<appName> myCommand3 myCommand4
  Description: Command description
```

### Runner

The runner have the following methods:

```javascript
await runner.run(); // Execute the runner

runner.command.get(commandName); // Get a command object with the name passed as parameter
runner.command.set(commandName, commandObject); // Set a new command or overwrite an existing one
runner.command.remove(commandName); // Remove a command with the name passed as parameter

runner.help.get(); // Get the help descriptor object
runner.help.set(helpDescriptorObject); // Set the help descriptor object
```

## Extensions

This package supports extensions, which can be used to extend the functionality of each command.
The shape of an extension object is the following:

Each command function will have a `this` object assigned to it with the following properties:

```typescript
interface PureCommandInternal {
    appName: string; // The name of the application
    context?: any; // The context of the application, completely defined and handled by the user
    helpers: CommandHelpers; // A set of helper functions to be used by the extension, like parsing flags with aliases, etc. In the extension context, the context and helpers will be the same as in the command calling the extension callback
}
```

> **Important note:** As this package relies on `Function.prototype.bind` to assign the `this` object on each extension callback, you should not use arrow functions if you want to access any property on the `this` object within the command function.

```javascript
const myExtension = {
    name: 'myExtension',
    builder() {
        const state = {};

        return {
            myMethod(a, b) {
                return a + b + this.helpers.valueOrDefault(this.context.number, 0) + this.helpers.valueOrDefault(state.number, 0);
            },

            myAnotherMethod() {
                state.number = this.helpers.valueOrDefault(state.number, 0) + 1;
            },

            joinArgs() {
                return this.helpers.cloneArgs().join(' ');
            }
        }
    }
};
```

To use the extension, you can call the extension callbacks from the command `this` object:

```javascript
const commands = {
    ['my-command']: function (args, flags) {
        return this.extensions.myExtension.joinArgs();
    }
}
```

This combination should return the arguments joined by a space, for example:

```bash
<appName> my-command 1 2 3 4
1 2 3 4

<appName> my-command a b c d
a b c d
```

## Tests

If you want to test the library, you can run the tests by running the following commands on the root of the project:

npm:
```bash
npm install
npm test
```

Yarn:
```bash
yarn
yarn test
```