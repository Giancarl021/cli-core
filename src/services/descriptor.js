module.exports = function (commandDescription = null) {
    function render(commandChain = []) {
        const l = commandChain.length;
        let temp = commandDescription[commandChain[0]];
        for (let i = 1; i < l; i++) {
            temp = temp[commandChain[i]];
        }

        return temp;
    }

    return {
        render
    };
}