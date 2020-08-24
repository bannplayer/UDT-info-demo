const config = {
    CKB: require('@nervosnetwork/ckb-sdk-core').default,
    secp256k1Dep: {
        hashType: 'type',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        outPoint: {
            txHash: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
            index: '0x0'
        }
    },
    emptyDataHash : '0x0000000000000000000000000000000000000000000000000000000000000000',
    secp256k1CodeHash : "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
    udtInfoDep: {
        depType: "code",
        outPoint: {
            txHash: "0xd4d2c7e984db1d1edb392276a736f1899e2d6e0e234279f88a093dc13b0cf83a",
            index: "0x0"
        }
    },
    udtInfoLock: {
        hashType: 'type',
        codeHash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        args: '0xad2b56ebc45f2936c4ac2dddb2320fe94568ade4'
    },
    udtInfoCodeHash: "0xd79411222c52de46b9b6eab05c11cdfdfefb91ffc8b7076f7caf0f12cd0aa12f",
}

module.exports = config;