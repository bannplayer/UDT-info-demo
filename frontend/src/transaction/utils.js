const utils = {
    bnToHex : function (bn) {
        let base = 16;
        // eslint-disable-next-line no-undef
        let hex = BigInt(bn).toString(base);
        if (hex.length % 2) {
            hex = '0' + hex;
        }
        return "0x" + hex;
    },
    bnToHexNoLeadingZero: function(bn) {
        let base = 16;
        // eslint-disable-next-line no-undef
        let hex = BigInt(bn).toString(base);
        return "0x" + hex;
    },
    toBigInt: function(num) {
        // eslint-disable-next-line no-undef
        return BigInt(num==='0x' ? '0x0' : num);
    },
    changeEndianness : function (str) {
        const result = ['0x'];
        let len = str.length - 2;
        while (len >= 2) {
            result.push(str.substr(len, 2));
            len -= 2;
        }
        return result.join('');
    },
}

module.exports = utils;