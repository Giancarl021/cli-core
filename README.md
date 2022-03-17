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
        extensions: [], // {object[]} The extensions of the application, will be built and passed on the `this.extensions` variable, default is an empty array
        commands: {}, // {object} The commands of the application, the key is the command name, the value is the command object
        help: {} // {object} The help descriptor object, the key is the command name, the value is the command descriptor object
};
```

### Commands

### Help Descriptor

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