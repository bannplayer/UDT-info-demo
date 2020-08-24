var indexer = require('../models/indexer');
var transactionManager = require('../models/transactionManager');

const queryCells = {
    getTipIndexer : async function (
        currentIndexer
    ) {
        try {
            return await indexer.getTip(currentIndexer);
        } catch (e) {
            console.log(e);
        }
    },
    getCellsIndexer : async function (
        currentIndexer,
        args,
        code_hash,
        hash_type
    ) {
        try {
            return await indexer.getCells(
                currentIndexer,
                {
                    args,
                    code_hash,
                    hash_type
                },
                null
            );
        } catch (e) {
            console.log(e);
        }
    },
    getCellsTypeIndexer : async function (
        currentIndexer,
        args,
        code_hash,
        hash_type
    ) {
        try {
            let res = [];
            for (let i = 0; i<args.length; i++) {
                let temp = await indexer.getCells(
                    currentIndexer,
                    null,
                    {
                        args: args[i],
                        code_hash: code_hash[i],
                        hash_type: hash_type[i]
                    }
                );

                for (let j = 0; j<temp.length; j++) {
                    res.push(temp[j]);
                }
            }
            return res;
        } catch (e) {
            console.log(e);
        }
    },
    getCellsManager : async function (
        currentTransactionManager,
        args,
        code_hash,
        hash_type
    ) {
        try {
            return await transactionManager.getCells(
                currentTransactionManager,
                {
                    args,
                    code_hash,
                    hash_type
                },
                null
            );
        } catch (e) {
            console.log(e);
        }
    },
    sendTransaction : async function (
        currentTransactionManager,
        tx
    ) {
        try {
            return await transactionManager.sendTx(
                currentTransactionManager,
                JSON.parse(tx)
            );
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = queryCells;