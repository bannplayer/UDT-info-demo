const config = require('./config');
const utils = require('./utils');

const cell = {
    filterCellsTx: function(
        unspentCells,
        udt,
        minCKB
    ) {
        let ckb = new config.CKB("http://localhost:8114");
        let udtDone = false;
        let udtCellInfo = {};
        // eslint-disable-next-line no-undef
        let currentCKB = BigInt(0);
        let filteredUnspentCells = unspentCells.reduce((acc, unspentCell) => {
            console.log(unspentCell);
            if (
                unspentCell.cell_output.type === undefined
                && unspentCell.data === '0x'
                // eslint-disable-next-line no-undef
                && currentCKB < BigInt(minCKB)
            ) {
                // eslint-disable-next-line no-undef
                currentCKB += BigInt(unspentCell.cell_output.capacity);
                acc.push({
                    dataHash: config.emptyDataHash,
                    type: null,
                    capacity: unspentCell.cell_output.capacity,
                    outPoint: {
                        txHash: unspentCell.out_point.tx_hash,
                        index: unspentCell.out_point.index
                    },
                });
            } else if(
                !udtDone
                && unspentCell.cell_output.type !== undefined
                && ckb.utils.scriptToHash({
                    args: unspentCell.cell_output.type.args,
                    codeHash: unspentCell.cell_output.type.code_hash,
                    hashType: unspentCell.cell_output.type.hash_type
                }) === udt.typeHash
            ) {
                udtDone = true;
                udtCellInfo.capacity = unspentCell.cell_output.capacity;
                udtCellInfo.data = unspentCell.data;
                acc.push({
                    dataHash: config.emptyDataHash,
                    type: unspentCell.cell_output.type,
                    capacity: unspentCell.cell_output.capacity,
                    outPoint: {
                        txHash: unspentCell.out_point.tx_hash,
                        index: unspentCell.out_point.index
                    },
                });
            }
            return acc;
        }, []);
        return {
            unspentCells : filteredUnspentCells,
            currentCKB : currentCKB,
            udtCellInfo: udtCellInfo
        };

    },

    filterCellsUDT: function(
        unspentCells,
        lockScript
    ) {
        let ckb = new config.CKB("http://localhost:8114");
        let res = [];

        let udtCheck = new Map();

        let lockHash = ckb.utils.scriptToHash({
            args: lockScript.args,
            codeHash: lockScript.code_hash,
            hashType: lockScript.hash_type
        })

        unspentCells.filter((unspentCell) => {
            if (
                unspentCell.cell_output.type !== undefined
                && lockHash === unspentCell.cell_output.type.args
            ) {
                let typeScript = {
                    args: unspentCell.cell_output.type.args,
                    codeHash: unspentCell.cell_output.type.code_hash,
                    hashType: unspentCell.cell_output.type.hash_type
                };
                let typeHash = ckb.utils.scriptToHash(typeScript);

                if (!udtCheck.has(typeHash)) {
                    let idx = res.push({
                        typeHash: typeHash,
                        // eslint-disable-next-line no-undef
                        balances: BigInt(0),
                        type: typeScript,
                        out_point: {
                            tx_hash: unspentCell.out_point.tx_hash,
                            index: unspentCell.out_point.index
                        }
                    });
                    udtCheck.set(typeHash, idx-1);
                }
                let idx = udtCheck.get(typeHash);
                // eslint-disable-next-line no-undef
                res[idx].balances += (
                    typeHash === config.emptyDataHash
                        ? utils.toBigInt(unspentCell.cell_output.capacity)
                        : utils.toBigInt(utils.changeEndianness(unspentCell.data))
                );
            }
            return true;
        });

        return res;
    },

    filterCellsUDTInfo: function (
        infos,
        udts
    ) {
        return udts.map((udt) => {
            let res = cell.filterSearchUDTInfo(
                infos,
                udt.typeHash
            );

            if(res.symbol !== undefined) {
                udt.symbol = res.symbol;
                udt.decimal = res.decimal;
                udt.name = res.name;
                udt.duplicated = res.duplicated;
            }
            return udt;
        });
    },

    filterSearchUDTInfo: function (
        infos,
        udtTypeHash
    ) {
        let res = {};
        let udtInfo = infos.filter((info) => {
            return info.cell_output.type.args === udtTypeHash;
        });
        if(udtInfo.length > 0) {
            let filteredData = cell.getUDTDataFromInfoCell(udtInfo[0].data);

            res.symbol = filteredData.symbol;
            res.decimal = filteredData.decimal;
            res.name = filteredData.name;
            res.duplicated = udtInfo.length > 1;
        }
        return res;
    },

    getUDTDataFromInfoCell: function (
        data
    ) {
        let ckb = new config.CKB("http://localhost:8114");
        return {
            symbol : ckb.utils.hexToUtf8(data.substr(0, 18)),
            decimal : utils.toBigInt("0x"+data.substr(18, 2)),
            name : ckb.utils.hexToUtf8("0x"+data.substr(20))
        }
    }

}

module.exports = cell;