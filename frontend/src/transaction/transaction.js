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
            minCKB + BigInt(6100001000)
        );
        unspentCells = unspentCellsRes.unspentCells;
        console.log("input cells : ", unspentCellsRes);

        let rawTransaction = ckb.generateRawTransaction({
            fromAddress: addr,
            toAddress: addr,
            capacity: unspentCellsRes.currentCKB
                // eslint-disable-next-line no-undef
                - BigInt(6100001000)
                // eslint-disable-next-line no-undef
                + BigInt(unspentCellsRes.udtCellInfo.capacity),
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
        rawTransaction.outputs[1].capacity = utils.bnToHexNoLeadingZero(
            // eslint-disable-next-line no-undef
            BigInt(unspentCellsRes.currentCKB)
            // eslint-disable-next-line no-undef
            - BigInt(rawTransaction.outputs[0].capacity)
            // eslint-disable-next-line no-undef
            - BigInt(1000)
        );
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

    generateMintUDTTx: function(
        addr,
        lockHash,
        unspentCells
    ) {
        const ckb = new config.CKB("http://localhost:8114");

        let unspentCellsRes = cell.filterCellsTx(
            unspentCells,
            {
                typeHash: null
            },
            // eslint-disable-next-line no-undef
            BigInt(20400001000)
        );
        unspentCells = unspentCellsRes.unspentCells;
        console.log("input cells : ", unspentCellsRes);

        let rawTransaction = ckb.generateRawTransaction({
            fromAddress: addr,
            toAddress: addr,
            // eslint-disable-next-line no-undef
            capacity: BigInt(14300000000),
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

        rawTransaction.cellDeps.push(config.testUDTDeps);

        rawTransaction.outputs[0].type = {
            codeHash: config.testUDTCodeHash,
            hashType: "type",
            args: lockHash,
        };
        rawTransaction.outputsData[0] = utils.changeEndianness(
            // eslint-disable-next-line no-undef
            utils.bnToHex(BigInt("10000000000000000000000000000"))
        ).padEnd(34, '0');

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