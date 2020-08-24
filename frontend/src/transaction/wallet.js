const config = require('./config');

const wallet = {
    connectToSynapse: async function (
        ckbInjected
    ) {
        if (ckbInjected === undefined) {
            throw Error("No wallet found");
        }

        let walletInfo = await ckbInjected.getAddressInfo();
        if(
            !(walletInfo.data.address.slice(0, 4) === 'ckt1'
                && walletInfo.data.type === 'Secp256k1')
        ) {
            throw Error("Only Aggron testnet and secp256k1 account available");
        }
        const ckb = new config.CKB("http://localhost:8114");
        const pkh = `0x${ckb.utils.blake160(walletInfo.data.publicKey, 'hex')}`;

        return {
            lock : {
                args: pkh,
                code_hash: "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
                hash_type: "type"
            },
            address : walletInfo.data.address
        }
    },

    signSynapse: async function (
        ckbInjected,
        rawTx
    ) {
        return await ckbInjected.sign({ tx: rawTx });
    }
}

module.exports = wallet;