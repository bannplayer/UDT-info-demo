var express = require('express');
var router = express.Router();

var searchDeps = require('../services/searchDeps');
var queryCells = require('../services/queryCells');

router.get('/', function(req, res, next) {
    queryCells.getTipIndexer(
        req.indexer
    ).then((response) => {
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/get_cells', function(req, res, next) {
    queryCells.getCellsIndexer(
        req.indexer,
        req.query.args,
        req.query.code_hash,
        req.query.hash_type
    ).then((response) => {
        console.log(response);
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/get_cells_with_type', function(req, res, next) {
    queryCells.getCellsTypeIndexer(
        req.indexer,
        req.query.args,
        req.query.code_hash,
        req.query.hash_type
    ).then((response) => {
        console.log(response);
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/get_cells_manager', function(req, res, next) {
    queryCells.getCellsManager(
        req.transactionManager,
        req.query.args,
        req.query.code_hash,
        req.query.hash_type
    ).then((response) => {
        console.log(response);
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

router.get('/get_udt_deps', function(req, res, next) {
    searchDeps.getUDTDeps(
        req.query.tx_hash,
        req.query.args,
        req.query.code_hash,
        req.query.hash_type
    ).then((response) => {
        console.log(response);
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

router.post('/send_tx', function(req, res, next) {
    queryCells.sendTransaction(
        req.transactionManager,
        req.body.tx
    ).then((response) => {
        console.log(response);
        res.send(response);
    }).catch((error) => {
        console.log(error);
    });
});

module.exports = router;
