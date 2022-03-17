module.exports = function (args, flags) {
    function getFlag(flagName, ...aliases) {
        const arr = [flagName, ...aliases];

        const n = arr.find(n => flags.hasOwnProperty(n));

        if (typeof n === 'undefined') return n;
        
        return flags[n];
    }

    function hasFlag(flagName, ...aliases) {
        const arr = [flagName, ...aliases];

        return arr.some(n => flags.hasOwnProperty(n));
    }

    function whichFlag(flagName, ...aliases) {
        const arr = [flagName, ...aliases];

        const n = arr.find(n => flags.hasOwnProperty(n));

        return n;
    }

    function getArgAt(index) {
        return args[index];
    }

    function hasArgAt(index) {
        return args.length > index;
    }

    function cloneArgs() {
        return [...args];
    } 

    return {
        getFlag,
        hasFlag,
        whichFlag,
        getArgAt,
        hasArgAt,
        cloneArgs
    }
}