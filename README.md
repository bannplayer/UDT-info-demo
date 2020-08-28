# UDT info demo

Demo for making UDT info cells and getting UDT info data from on-chain using lumos.

## Backend
Simple express api server with lumos. 

Can query with
- lumos indexer tip block data
- getting live cells with lock script, type script from lumos CellCollector
- getting live cells with lock script from lumos transactionManager
- getting UDT deps with UDT type script and UDT transaction hash
- sending signed transaction to lumos transactionManager

## Frontend
Simple vue client with synapse extension.

Can do
- minting test UDT 
- sending transaction to make UDT info cell
- querying UDT info cell with UDT type script hash

## UDT info type script
https://github.com/bannplayer/UDT-info-type-script
