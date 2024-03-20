module.exports = function (extensions, appName, context, helpers) {
    const r = {};
    for (const extension of extensions) {
        const fns = extension.builder();

        for (const fn in fns) {
            fns[fn] = fns[fn].bind({ appName, context, helpers });
        }

        r[extension.name] = fns;
    }

    return r;
};
