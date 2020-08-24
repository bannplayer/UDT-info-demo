const config = require('../config/config');
const utils = require('./utils');
const CKB = require("@nervosnetwork/ckb-sdk-core").default;

const searchDeps = {
    getUDTDeps: async function (
        txHash,
        args,
        codeHash,
        hashType
    ) {
        try {
            let cellDeps = await searchDeps.getAllCellDeps(txHash);
            return await searchDeps.search({
                args,
                codeHash,
                hashType
            }, cellDeps, null);
        } catch (e) {
            console.log(e);
        }
    },

    getAllCellDeps: async function (
        tx_hash
    ) {
        try {
            let ckb = new CKB(config.nodeUrl);
            let tx = await ckb.rpc.getTransaction(tx_hash);
            console.log(tx);
            return tx.transaction.cellDeps;
        } catch (e) {
            console.log(e);
        }
    },

    search: async function (
        script,
        cellDeps,
        isDepGroup
    ) {
        try {
            let ckb = new CKB(config.nodeUrl);
            for (let i = 0; i < cellDeps.length; i++) {
                const cellDep = cellDeps[i];
                let cellDepTx = await ckb.rpc.getTransaction(cellDep.outPoint.txHash);

                if(cellDep.depType === "depGroup") {
                    let depGroupCellDepsData = cellDepTx
                        .transaction
                        .outputsData[parseInt(cellDep.outPoint.index)];
                    let depGroupCellDepsLength = parseInt(
                        utils.changeEndianness(
                            depGroupCellDepsData.substr(0, 10)
                        )
                    );

                    let depGroupCellDeps = [];

                    for (let j = 0; j<depGroupCellDepsLength; j++) {
                        depGroupCellDeps.push({
                            depType: "code",
                            outPoint: {
                                txHash: "0x"+depGroupCellDepsData.substr(
                                    10 + j * 72,
                                    64
                                ),
                                index: utils.bnToHexNoLeadingZero(
                                    utils.changeEndianness(
                                        "0x"+depGroupCellDepsData.substr(
                                            10 + j * 72 + 64,
                                        8
                                        )
                                    )
                                ),
                            }
                        });
                    }

                    let res = await searchDeps.search(
                        script,
                        depGroupCellDeps,
                        cellDep
                    );
                    if (res != null) return res;

                } else {
                    let scriptToHash = null;
                    if(script.hashType==="type") {
                        const cellDepTxType = cellDepTx
                            .transaction
                            .outputs[parseInt(cellDep.outPoint.index)]
                            .type;
                        if(cellDepTxType==null) {
                            return;
                        }
                        const depsScript = {
                            hashType: 'type',
                            codeHash: "0x00000000000000000000000000000000000000000000000000545950455f4944",
                            args: cellDepTxType.args,
                        };
                        scriptToHash = ckb.utils.scriptToHash(depsScript);
                    } else {

                        const toHash = ckb.utils.blake2b(
                            32,
                            null,
                            null,
                            ckb.utils.PERSONAL
                        );
                        toHash.update(
                            ckb.utils.hexToBytes(
                                cellDepTx
                                    .transaction
                                    .outputsData[parseInt(cellDep.outPoint.index)]
                            )
                        );
                        scriptToHash = `0x${toHash.digest('hex')}`;
                    }

                    if(script.codeHash === scriptToHash) {
                        return (isDepGroup===null ? cellDep : isDepGroup);
                    }

                }
            }
            return null;
        } catch (e) {
            console.log(e);
        }
    },
}

module.exports = searchDeps;