const { CellCollector } = require("@ckb-lumos/indexer");

const indexer = {
    getTip: async function(
        indexer
    ) {
        try {
            return await indexer.tip();
        } catch (e) {
            console.log(e);
        }
    },

    getCells: async function (
        indexer,
        lock,
        type
    ) {
        try {
            let queries = {};
            if (lock !== null) {
                queries.lock = lock;
            }
            if (type !== null) {
                queries.type = type;
            }
            let collector = new CellCollector(indexer, queries);

            let res = [];
            for await (const cell of collector.collect()) {
                res.push(cell);
            }
            return res;
        } catch (e) {
            console.log(e);
        }
    },
}

module.exports = indexer;
