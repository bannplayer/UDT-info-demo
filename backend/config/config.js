const { Indexer } = require("@ckb-lumos/indexer");
const TransactionManager = require("@ckb-lumos/transaction-manager");

const config = {
    nodeUrl: "http://localhost:8114",
    indexerPath: "./lumos/indexed-data",
    indexer: null,
    transactionManager: null,

    init: function() {
        config.indexer = new Indexer(
            config.nodeUrl,
            config.indexerPath
        );
        config.transactionManager = new TransactionManager(config.indexer);

        config.indexer.startForever();
        config.transactionManager.start();
    }
}

module.exports = config;