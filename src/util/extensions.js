module.exports = function (extensions, context, helpers) {
    const r = {};
    for (const extension of extensions) {
        const fns = extension.builder();

        for (const fn in fns) {
            fns[fn] = fns[fn].bind({ context, helpers });
        }

        r[extension.name] = fns;
    }

    return r;
}