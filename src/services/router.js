const clone = require('clone');
const { routerMeta } = require('../util/constants');
const createHelpers = require('../util/helpers');
const buildExtensions = require('../util/extensions');

module.exports = function (appName, commands, context, extensions, helpFlags = ['help', '?']) {
    function navigate(args, flags) {
        const meta = clone(routerMeta);

        const l = args.length;
        let temp = commands;

        for (const flag of helpFlags) {
            if (flags.hasOwnProperty(flag)) {
                meta.help = true;
                break;
            }
        }

        for (let i = 0; i < l; i++) {
            const arg = args[i];
            meta.chain.push(arg);

            temp = temp[arg];

            if (typeof temp === 'undefined') {
                meta.error = new Error(`Command "${appName} ${args.slice(0, i + 1).join(' ')}" not found.`);
                return { fn: null, meta };
            }

            if (typeof temp === 'function') {
                const _args = args.slice(i + 1);
                const helpers = createHelpers(_args, flags);
                const _extensions = buildExtensions(extensions, appName, context, helpers);
                return { fn: temp.bind({ appName, context, helpers, extensions: _extensions }, _args, flags), meta };
            }
        }

        if (typeof temp === 'object') {
            meta.help = true;
            return { fn: null, meta };
        }
    }

    return navigate;
}