const clone = require('clone');
const { routerMeta } = require('../util/constants');

module.exports = function (appName, commands, context, helpFlags = ['help', '?']) {
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
                return { fn: temp.bind({ context }, args.slice(i + 1), flags), meta };
            }
        }

        if (typeof temp === 'object') {
            meta.help = true;
            return { fn: null, meta };
        }
    }

    return navigate;
}