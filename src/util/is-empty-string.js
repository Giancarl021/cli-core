module.exports = function (value) {
    return value === null || value === undefined || String(value) === '';
}