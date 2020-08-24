const transactionManager = {
    sendTx : async function (
        transactionManager,
        tx
    ) {
        try {
            return await transactionManager.send_transaction(tx);
        } catch (e) {
            console.log(e);
        }
    },

    getCells : async function (
        transactionManager,
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
            let collector = transactionManager.collector(queries);
            let res = [];
            for await (const cell of collector.collect()) {
                res.push(cell);
                console.log(cell);
            }
            return res;
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = transactionManager;