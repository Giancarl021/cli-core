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

    return {
        getFlag,
        hasFlag,
        whichFlag
    }
}