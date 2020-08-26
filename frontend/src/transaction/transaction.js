const cell = require('./cell');
const config = require('./config');
const utils = require('./utils');
const CKBUtil = require('@nervosnetwork/ckb-sdk-utils');

const transaction = {
    generateTx: function(
        addr,
        unspentCells,
        udt,
        udt_deps
    ) {
        const ckb = new config.CKB("http://localhost:8114");

        let udtInfoData = "0x"
            +(ckb.utils.utf8ToHex(udt.symbol).substr(2).padStart(16, '0'))
            // eslint-disable-next-line no-undef,no-unused-vars
            +BigInt(udt.decimal).toString(16).padStart(2, '0')
            +ckb.utils.utf8ToHex(udt.name).substr(2);

        // eslint-disable-next-line no-undef
        let minCKB = BigInt(125 + udtInfoData.length / 2)*BigInt(100000000);

        let unspentCellsRes = cell.filterCellsTx(
            unspentCells,
            udt,
            // eslint-disable-next-line no-undef
            minCKB + BigInt(6100000000)
        );
        unspentCells = unspentCellsRes.unspentCells;
        console.log("input cells : ", unspentCellsRes);

        let rawTransaction = ckb.generateRawTransaction({
            fromAddress: addr,
            toAddress: addr,
            // eslint-disable-next-line no-undef
            capacity: minCKB + BigInt(unspentCellsRes.udtCellInfo.capacity),
            // eslint-disable-next-line no-undef
            fee: BigInt(1000),
            safeMode: false,
            cells: unspentCells,
            deps: config.secp256k1Dep,
        });

        rawTransaction.witnesses[0] = {
            lock: '',
            inputType: '',
            outputType: ''
        };

        rawTransaction.cellDeps.push({
            depType: udt_deps.depType,
            outPoint: {
                txHash: udt_deps.outPoint.txHash,
                index: udt_deps.outPoint.index
            }
        });

        rawTransaction.outputs[0] = {
            capacity: utils.bnToHexNoLeadingZero(minCKB),
            lock: udt.toOwnerOwn ? rawTransaction.outputs[0].lock : config.udtInfoLock,
            type: {
                hashType: 'type',
                codeHash: config.udtInfoCodeHash,
                args: udt.typeHash
            }
        }
        rawTransaction.outputsData[0] = udtInfoData;

        rawTransaction.cellDeps.push(config.udtInfoDep);

        rawTransaction.outputs.push({
            capacity: unspentCellsRes.udtCellInfo.capacity,
            lock: rawTransaction.outputs[1].lock,
            type: {
                args: udt.type.args,
                codeHash: udt.type.codeHash,
                hashType: udt.type.hashType
            }
        });
        rawTransaction.outputsData.push(unspentCellsRes.udtCellInfo.data);
        console.log(rawTransaction);
        // eslint-disable-next-line no-undef
        let fee = BigInt(CKBUtil.serializeRawTransaction(rawTransaction).length / 2);
        // eslint-disable-next-line no-undef
        if(fee > BigInt(1000)) {
            rawTransaction.outputs[1].capacity = utils.bnToHexNoLeadingZero(
                // eslint-disable-next-line no-undef
                BigInt(rawTransaction.outputs[1].capacity)
                // eslint-disable-next-line no-undef
                + BigInt(1000)
                - fee
            );
        }

        console.log(rawTransaction);

        return rawTransaction;
    },

    changeFormat: function (
        tx
    ) {
       let ckb = new config.CKB("http://localhost:8114");
       console.log(tx);
       return ckb.rpc.paramsFormatter.toRawTransaction(tx);
    }
}

module.exports = transaction;