<a name="SECDataHandler"></a>

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard) 

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)]

## SECDataHandler

This package uses leveldb to store and handle data from SEC blockchain

* [SECDataHandler](#SECDataHandler)
    * [new SECDataHandler(config)](#new_SECDataHandler_new)
    * [.writeTokenChainToDB(jsonFile, callback)](#SECDataHandler+writeTokenChainToDB) => <code>None</code>
    * [.writeTxChainToDB(jsonFile, callback)](#SECDataHandler+writeTxChainToDB) => <code>None</code>
    * [.getAccountTx(address, callback)](#SECDataHandler+getAccountTx) => <code>None</code>
    * [.getTokenBlockFromDB(blockHashArray, callback)](#SECDataHandler+getTokenBlockFromDB) => <code>None</code>
    * [.getTokenChain(minBlockHeight, maxBlockHeight, callback)](#SECDataHandler+getTokenChain) => <code>None</code>
    * [.getTxBlockFromDB(blockHashArray, callback)](#SECDataHandler+getTxBlockFromDB) => <code>None</code>
    * [.getTxChain(minBlockHeight, maxBlockHeight, callback)](#SECDataHandler+getTxChain) => <code>None</code>
    * [.isAccountDBEmpty(callback)](#SECDataHandler+isAccountDBEmpty) => <code>None</code>
    * [.isProductDBEmpty(callback)](#SECDataHandler+isProductDBEmpty) => <code>None</code>
    * [.isTokenBlockChainDBEmpty(callback)](#SECDataHandler+isTokenBlockChainDBEmpty) => <code>None</code>
    * [.isTxBlockChainDBEmpty(callback)](#SECDataHandler+isTxBlockChainDBEmpty) => <code>None</code>
    * [.getAccountDB(callback)](#SECDataHandler+getAccountDB) => <code>None</code>
    * [.getProductDB(callback)](#SECDataHandler+getProductDB) => <code>None</code>
    * [.getTokenBlockChainDB(callback)](#SECDataHandler+getTokenBlockChainDB) => <code>None</code>
    * [.getTxBlockChainDB(callback)](#SECDataHandler+getTxBlockChainDB) => <code>None</code>

<a name="SECDataHandler+writeTokenChainToDB"></a>

### secDataHandler.writeTokenChainToDB(jsonFile, callback) => <code>None</code>
Update token chain data to database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| jsonFile | <code>String</code> | token block chain data in string format. E.g, '[{"TimeStamp": 1529288258, ...}, {"TimeStamp": 1529288304, ...}]' |
| callback | <code>function</code> | callback function, returns error if exist |


<a name="SECDataHandler+writeTxChainToDB"></a>

### secDataHandler.writeTxChainToDB(jsonFile, callback) => <code>None</code>
Update transaction chain data to database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| jsonFile | <code>String</code> | transaction block chain data in string format.  E.g, '[{"TimeStamp": 1529288258, ...}, {"TimeStamp": 1529288304, ...}]' |
| callback | <code>function</code> | callback function, returns error if exist |


<a name="SECDataHandler+getAccountTx"></a>

### secDataHandler.getAccountTx(address, callback) => <code>None</code>
Get account DB recorded token chain transactions for an account address

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | account address which is searched |
| callback | <code>function</code> | callback function, returns account address previous transaction list |


<a name="SECDataHandler+getTokenBlockFromDB"></a>

### secDataHandler.getTokenBlockFromDB(blockHashArray, callback) => <code>None</code>
Get token block according to block hash value

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| blockHashArray | <code>String, Array</code> | block hash value string or array |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTokenChain"></a>

### secDataHandler.getTokenChain(minBlockHeight, maxBlockHeight, callback) => <code>None</code>
Get token block chain data, from height 'minBlockHeight' to height 'maxBlockHeight'

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| minBlockHeight | <code>Integer</code> | minimum block height |
| maxBlockHeight | <code>Integer</code> | maximum block height |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTxBlockFromDB"></a>

### secDataHandler.getTxBlockFromDB(blockHashArray, callback) => <code>None</code>
Get transaction block according to block hash value

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| blockHashArray | <code>String, Array</code> | block hash value string or array |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getTxChain"></a>

### secDataHandler.getTxChain(minBlockHeight, maxBlockHeight, callback) => <code>None</code>
Get transaction block chain data, from height 'minBlockHeight' to height 'maxBlockHeight'

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| minBlockHeight | <code>Integer</code> | minimum block height |
| maxBlockHeight | <code>Integer</code> | maximum block height |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+isAccountDBEmpty"></a>

### secDataHandler.isAccountDBEmpty(callback) => <code>None</code>
Check whether the account database is empty

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+isProductDBEmpty"></a>

### secDataHandler.isProductDBEmpty(callback) => <code>None</code>
Check whether the product database is empty

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+isTokenBlockChainDBEmpty"></a>

### secDataHandler.isTokenBlockChainDBEmpty(callback) => <code>None</code>
Check whether the token block chain database is empty

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+isTxBlockChainDBEmpty"></a>

### secDataHandler.isTxBlockChainDBEmpty(callback) => <code>None</code>
Check whether the transaction block chain database is empty

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |


<a name="SECDataHandler+getAccountDB"></a>

### secDataHandler.getAccountDB(callback) => <code>None</code>
Get all the data in account database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+getProductDB"></a>

### secDataHandler.getProductDB(callback) => <code>None</code>
Get all the data in product database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+getTokenBlockChainDB"></a>

### secDataHandler.getTokenBlockChainDB(callback) => <code>None</code>
Get all the data in token block chain database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |

<a name="SECDataHandler+getTxBlockChainDB"></a>

### secDataHandler.getTxBlockChainDB(callback) => <code>None</code>
Get all the data in transaction block chain database

**Kind**: instance method of [<code>SECDataHandler</code>](#SECDataHandler)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | callback function |
