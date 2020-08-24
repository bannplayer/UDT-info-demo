const utils = {
    changeEndianness : function (str) {
        const result = ['0x'];
        let len = str.length - 2;
        while (len >= 2) {
            result.push(str.substr(len, 2));
            len -= 2;
        }
        return result.join('');
    },

    bnToHexNoLeadingZero: function(bn) {
        let base = 16;
        // eslint-disable-next-line no-undef
        let hex = BigInt(bn).toString(base);
        return "0x" + hex;
    },
}

module.exports = utils;