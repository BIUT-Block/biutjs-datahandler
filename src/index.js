const Promise = require('promise')
const level = require('level')

class SECDataHandler {
  /**
   * @param  {Object} config - contains the path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading db')
    }

    this.DBPath = config.DBPath
    if (this.DBPath.slice(-1) !== '/') {
      this.DBPath += '/'
    }

    this.accAddrLength = 34 // config.addrLength
    this.tokenAccBalance = {}
    this.txAccBalance = {}

    this.accountDBPath = config.DBPath + 'account/'
    this.productDBPath = config.DBPath + 'product/'
    this.txBlockChainDBPath = config.DBPath + 'txBlockChain/'
    this.tokenBlockChainDBPath = config.DBPath + 'tokenBlockChain/'

    this._createLoadDB()
  }

  /**
   * Load or create databases
   * @return {None}
   */
  _createLoadDB () {
    try {
      this.accountDB = level(this.accountDBPath)
      this.productDB = level(this.productDBPath)
      this.txBlockChainDB = level(this.txBlockChainDBPath)
      this.tokenBlockChainDB = level(this.tokenBlockChainDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  /**
   * Update token chain json file to database
   * @param  {String} jsonFile - string which is in json format. E.g, '{"1": {"TimeStamp": 1529288258, ...}}' (blockHeight: {block}, ...)
   * @callback {err} - returns error if exist
   */
  writeTokenChainToDB (jsonFile, callback) {
    if (!this._jsonTypeCheck(jsonFile)) {
      throw new TypeError('Invalid json file')
    }

    let self = this
    let tokenChain = JSON.parse(jsonFile)
    this.tokenAsyncList = []

    Object.keys(tokenChain).forEach(function (blockHeight) {
      self._writeTokenBlockToDB(tokenChain[blockHeight])
    })

    Promise.all(this.tokenAsyncList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Update a single token chain block into database
   * @param  {Object} blockInfo - format define in "tokenchain-block-model.js" (in "secjs-block" project)
   * @return {None}
   */
  _writeTokenBlockToDB (blockInfo) {
    let self = this

    // token database operations
    Object.keys(blockInfo).forEach(function (key) {
      let putKey = self._combineStrings(blockInfo.Height, key)
      if (key !== 'Transactions') {
        self.tokenAsyncList.push(self._putDB(self.tokenBlockChainDB, putKey, blockInfo[key]))
      } else {
        self.tokenAsyncList.push(self._putDB(self.tokenBlockChainDB, putKey, self._txStringify(blockInfo[key])))
      }
    })

    // account database operations
    blockInfo.Transactions.forEach(function (transaction) {
      // very limited data is stored in account db, more information about the transaction can be found in token database
      if (!self._jsonTypeCheck(transaction)) {
        throw new TypeError('Invalid json file')
      }
      transaction = JSON.parse(transaction)

      if (typeof transaction.TxFrom !== 'undefined' && typeof transaction.TxTo !== 'undefined') {
        self.tokenAsyncList.push(self._putDB(self.accountDB, self._combineStrings('token', transaction.TxFrom, 'payer', transaction.TxHash), blockInfo.Height))
        self.tokenAsyncList.push(self._putDB(self.accountDB, self._combineStrings('token', transaction.TxTo, 'payee', transaction.TxHash), blockInfo.Height))
      }
    })

    // product database operations
    // as token chain has no product info, no data needs to be written to priduction database
  }

  /**
   * Update transaction chain json file to database
   * @param  {String} jsonFile - string which is in json format. E.g, '{"1": {"TimeStamp": 1529288258, ...}}' (blockHeight: {block}, ...)
   * @callback {err} - returns error if exist
   */
  writeTxChainToDB (jsonFile, callback) {
    if (!this._jsonTypeCheck(jsonFile)) {
      throw new TypeError('Invalid json file')
    }

    let self = this
    let txChain = JSON.parse(jsonFile)
    this.txAsyncList = []

    Object.keys(txChain).forEach(function (blockHeight) {
      self._writeTxBlockToDB(txChain[blockHeight])
    })

    Promise.all(this.txAsyncList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Update a single transaction chain block into database
   * @param  {Object} blockInfo - format define in "transactionchain-block-model.js" (in "secjs-block" project)
   * @return {None}
   */
  _writeTxBlockToDB (blockInfo) {
    let self = this

    // tx database operations
    Object.keys(blockInfo).forEach(function (key) {
      let putKey = self._combineStrings(blockInfo.Height, key)
      if (key !== 'Transactions') {
        self.txAsyncList.push(self._putDB(self.txBlockChainDBPath, putKey, blockInfo[key]))
      } else {
        self.txAsyncList.push(self._putDB(self.txBlockChainDBPath, putKey, self._txStringify(blockInfo[key])))
      }
    })

    // account database operations
    blockInfo.Transactions.forEach(function (transaction) {
      // very limited data is stored in account db, more information about the transaction can be found in transaction database
      if (!self._jsonTypeCheck(transaction)) {
        throw new TypeError('Invalid json file')
      }
      transaction = JSON.parse(transaction)

      if (typeof transaction.TxFrom !== 'undefined' && typeof transaction.TxTo !== 'undefined') {
        self.txAsyncList.push(self._putDB(self.accountDB, self._combineStrings('tx', transaction.BuyerAddress, 'payer', transaction.TxHash), transaction.BlockHeight))
        self.txAsyncList.push(self._putDB(self.accountDB, self._combineStrings('tx', transaction.SellerAddress, 'payee', transaction.TxHash), transaction.BlockHeight))
      }
    })

    // product database operations
    blockInfo.Transactions.forEach(function (transaction) {
      // very limited data is stored in product db, more information about the transaction can be found in transaction database
      if (!self._jsonTypeCheck(transaction)) {
        throw new TypeError('Invalid json file')
      }
      transaction = JSON.parse(transaction)

      if (typeof transaction.ProductInfo.Name !== 'undefined') {
        self.txAsyncList.push(self._putDB(self.productDB, self._combineStrings(transaction.ProductInfo.Name, 'name', transaction.TxHash), transaction.BlockHeight))
      }
    })
  }

  /**
   * Get account DB recorded token chain transactions for an account address
   * @param  {String} address - account address which is searched
   * @callback {Object} output - account address previous transaction list
   */
  getAccountTx (address, callback) {
    if (!this._accAddrValidate(address)) {
      throw new TypeError('Invalid account address')
    }

    let self = this
    let output = {}
    console.log('Account address "' + address + '" plays payer role in the following transactions: ')
    this.accountDB.createReadStream({
      gte: self._combineStrings('token', address, 'payer')
    }).on('data', function (data, err) {
      if (err) {
        return console.log('Ooops! Sth wrong with getAccountTx function', err)
      }

      let transactionHash = self._separateStrings(data.key)[3]
      let transactionBlock = data.value
      output[transactionHash] = transactionBlock

      console.log('--------------------------')
      console.log('transaction hash is: ' + transactionHash)
      console.log('transaction located block height is: ' + transactionBlock)
    }).on('error', function (err) {
      console.log('Stream occurs an error!', err)
    }).on('close', function () {
      console.log('Stream closed')
    }).on('end', function () {
      console.log('Stream ended')
      callback(output)
    })
  }

  /**
   * Put a key-value pair to db
   * @param  {leveldb} DB - database which will be operated
   * @param  {String} key - 'key' for the key-value pair
   * @param  {String | Array | Object} value - 'value' for the key-value pair
   * @return {PromiseObject} - a promise object which can indicate the async function is finished or not
   */
  _putDB (DB, key, value) {
    return new Promise(function (resolve, reject) {
      DB.put(key, value, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // get a value from the DB according to the "key" input (never used, for testing purpose)
  _getDB (DB, key, callback) {
    DB.get(key, function (err, value) {
      if (err) {
        return console.log('_getDB function gets an errpr!', err)
      }
      // console.log(key + '=' + value)
      callback(value)
    })
  }

  // delete a key-value pair from DB (never used, for testing purpose)
  _delDB (DB, key) {
    DB.del(key, function (err) {
      if (err) {
        return console.log('_delDB function gets an errpr!', err)
      }
    })
  }

  // do a serie of operations to DB, the operations are defined in the input "array" (never used, for testing purpose)
  _batchArrayDB (DB, array) {
    DB.batch(array, function (err) {
      if (err) {
        return console.log('_batchArrayDB function gets an errpr!', err)
      }
    })
  }

  // convert a put/get/del/.. operation into batch function input format (never used, for testing purpose)
  _convertToBatchInput (type, key, value) {
    let output = {}
    output['type'] = type
    output['key'] = key
    output['value'] = value

    return output
  }

  /**
   * Combine strings with '!' in between, the combined string is used for DB key index
   * @param  {String} input1 - first string
   * @param  {String} input2 - second string
   * @param  {String} input3 - third string (optional)
   * @return {String} - combined string
   */
  _combineStrings (input1, input2, input3 = '', input4 = '') {
    if (input4 !== '') {
      return (input1.toString() + '!' + input2.toString() + '!' + input3.toString() + '!' + input4.toString())
    } else if (input3 !== '') {
      return (input1.toString() + '!' + input2.toString() + '!' + input3.toString())
    }

    return (input1.toString() + '!' + input2.toString())
  }

  /**
   * remove the '!' symbols in the string and separate it to several strings
   * @param  {String} input - input string which would be separated
   * @return {Array}
   */
  _separateStrings (input) {
    if (typeof input !== 'string') {
      console.log(input)
      throw new TypeError('Invalid input data type to be separated')
    }

    let buffer = ''
    let output = []
    for (let i = 0; i < input.length; i++) {
      if (input.charAt(i) === '!') {
        output.push(buffer)
        buffer = ''
      } else if (i === input.length - 1) {
        buffer += input.charAt(i)
        output.push(buffer)
        buffer = ''
      } else {
        buffer += input.charAt(i)
      }
    }

    return output
  }

  /**
   * Convert each item within an array (object format) to string format
   * @param  {Array} transactionList - input array
   * @return {Array}
   */
  _txStringify (transactionList) {
    if (!Array.isArray(transactionList) && Object.keys(transactionList).length) {
      throw new TypeError('Invalid transactionList input')
    }

    if (transactionList !== []) {
      transactionList.forEach(function (transaction, index) {
        transactionList[index] = JSON.stringify(transactionList[index])
      })
    }

    return transactionList
  }

  /**
   * Validate the account address is legal
   * @param  {String} accAddr - Account address
   * @return {Boolean}
   */
  _accAddrValidate (accAddr) {
    if (typeof accAddr !== 'string') {
      return false
    }

    if (accAddr.length !== this.accAddrLength) {
      return false
    }

    return true
  }

  /**
   * Validate input is json format string
   * @param  {String} jsonFile - json format string
   * @return {Boolean}
   */
  _jsonTypeCheck (jsonFile) {
    try {
      JSON.parse(jsonFile)
    } catch (error) {
      return false
    }

    return true
  }
}

module.exports = SECDataHandler
