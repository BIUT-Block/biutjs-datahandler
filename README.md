<a name="SECDataHandler"></a>

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard) 

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)]

## SECDataHandler

This package uses leveldb to store and handle data from SEC blockchain

* [SECDataHandler](#SECDataHandler)
    * [new SECDataHandler(config)](#new_SECDataHandler_new)
    * [.writeTokenChainToDB](#SECDataHandler+writeTokenChainToDB) : <code>function</code>
    * [.writeTxChainToDB](#SECDataHandler+writeTxChainToDB) : <code>function</code>
    * [.getAccountTx](#SECDataHandler+getAccountTx) : <code>function</code>
    * [.getTokenBlockFromDB(blockHashArray, callback)](#SECDataHandler+getTokenBlockFromDB) => <code>None</code>
    * [.getTokenChain(maxBlockHeight, callback)](#SECDataHandler+getTokenChain) => <code>None</code>
    * [.getTxBlockFromDB(blockHashArray, callback)](#SECDataHandler+getTxBlockFromDB) => <code>None</code>
    * [.getTxChain(maxBlockHeight, callback)](#SECDataHandler+getTxChain) => <code>None</code>

<a name="SECDataHandler+writeTokenChainToDB"></a>

### secDataHandler.writeTokenChainToDB : <code>function</code>
Update token chain data to database

**Kind**: instance typedef of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| jsonFile | <code>String</code> | token block chain data in string format. E.g, '[{"TimeStamp": 1529288258, ...}, {"TimeStamp": 1529288304, ...}]' |


<a name="SECDataHandler+writeTxChainToDB"></a>

### secDataHandler.writeTxChainToDB : <code>function</code>
Update transaction chain data to database

**Kind**: instance typedef of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| jsonFile | <code>String</code> | transaction block chain data in string format.  E.g, '[{"TimeStamp": 1529288258, ...}, {"TimeStamp": 1529288304, ...}]' |


<a name="SECDataHandler+getAccountTx"></a>

### secDataHandler.getAccountTx : <code>function</code>
Get DB recorded transactions for an account address

**Kind**: instance typedef of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | account address which is searched |


<a name="SECDataHandler+getTokenBlockFromDB"></a>

### secDataHandler.getTokenBlockFromDB(blockHashArray, callback) => <code>None</code>
Get token block according to block hash value

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| blockHashArray | <code>String</code> \| <code>Array</code> | block hash value string or array |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTokenChain"></a>

### secDataHandler.getTokenChain(maxBlockHeight, callback) => <code>None</code>
Get token block chain data, from height 0 to height 'maxBlockHeight'

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| maxBlockHeight | <code>Integer</code> | maximum block height |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTxBlockFromDB"></a>

### secDataHandler.getTxBlockFromDB(blockHashArray, callback) => <code>None</code>
Get transaction block according to block hash value

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| blockHashArray | <code>String</code> \| <code>Array</code> | block hash value string or array |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTxChain"></a>

### secDataHandler.getTxChain(maxBlockHeight, callback) => <code>None</code>
Get transaction block chain data, from height 0 to height 'maxBlockHeight'

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| maxBlockHeight | <code>Integer</code> | maximum block height |
| callback | <code>function</code> | callback function |
