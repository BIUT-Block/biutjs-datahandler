const Promise = require('promise')
const level = require('level')

class SECDataHandler {
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading db')
    }

    this.DBPath = config.DBPath
    if (this.DBPath.slice(-1) !== '/') {
      this.DBPath += '/'
    }

    this.asyncList = []
    this.accountDBPath = config.DBPath + 'account/'
    this.productDBPath = config.DBPath + 'product/'
    this.txBlockChainDBPath = config.DBPath + 'txBlockChain/'
    this.tokenBlockChainDBPath = config.DBPath + 'tokenBlockChain/'

    this._createLoadDB()
  }

  // load the databases or create new databases if they are not existing
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

  // update token chain json file to database
  writeTokenChainToDB (jsonFile, callback) {
    if (!this._jsonTypeCheck(jsonFile)) {
      throw new TypeError('Invalid json file')
    }

    let self = this
    let tokenChain = JSON.parse(jsonFile)
    this.asyncList = []

    Object.keys(tokenChain).forEach(function (blockHeight) {
      self._writeTokenBlockToDB(tokenChain[blockHeight])
    })

    Promise.all(this.asyncList).then(function () {
      self.asyncList.forEach(function (async) {
        async.catch(function (rej) {
          callback(rej)
        })
      })
      callback()
    })
  }

  // update a single token chain block into database
  _writeTokenBlockToDB (blockInfo) {
    let self = this

    // token database operations
    this.asyncList.push(this._putDB(self.tokenBlockChainDB, this._combineStrings(blockInfo.Height, 'chain'), 'token'))

    Object.keys(blockInfo).forEach(function (key) {
      let putKey = self._combineStrings(blockInfo.Height, key)
      if (key !== 'Transactions') {
        self.asyncList.push(self._putDB(self.tokenBlockChainDB, putKey, blockInfo[key]))
      } else {
        self.asyncList.push(self._putDB(self.tokenBlockChainDB, putKey, self._txStringify(blockInfo[key])))
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
        self.asyncList.push(self._putDB(self.accountDB, self._combineStrings(transaction.TxFrom, 'payer', transaction.TxHash), blockInfo.Height))
        self.asyncList.push(self._putDB(self.accountDB, self._combineStrings(transaction.TxTo, 'payee', transaction.TxHash), blockInfo.Height))
      }
    })

    // product database operations
    // as token chain has no product info, no data needs to be written to priduction database
    // transaction database operations
    // transaction database does not need to be updated as well
  }

  // writeTxChainToDB () {}
  // _writeTxBlockToDB () {}

  // get db recorded transactions for an account address
  getAccountTx (address) {
    if (typeof address !== 'string') {
      throw new TypeError('Invalid account address')
    }

    let self = this
    console.log('Account address "' + address + '" plays payer role in the following transactions: ')
    this.accountDB.createReadStream({
      gte: self._combineStrings(address, 'payer')
    }).on('data', function (data, err) {
      if (err) {
        return console.log('Ooops! Sth wrong with getAccountTx function', err)
      }

      let transactionHash = self._separateStrings(data.key)[2]
      let transactionBlock = data.value
      console.log('--------------------------')
      console.log('transaction hash is: ' + transactionHash)
      console.log('transaction located block height is: ' + transactionBlock)
    }).on('error', function (err) {
      console.log('Stream occurs an error!', err)
    }).on('close', function () {
      console.log('Stream closed')
    }).on('end', function () {
      console.log('Stream ended')
    })
  }

  // put a key-value pair to db
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

  // get a value from the db according to the "key" input
  _getDB (DB, key) {
    DB.get(key, function (err, value) {
      if (err) {
        return console.log('_getDB function gets an errpr!', err)
      }
      console.log(key + '=' + value)
    })
  }

  // delete a key-value pair from db
  _delDB (DB, key) {
    DB.del(key, function (err) {
      if (err) {
        return console.log('_delDB function gets an errpr!', err)
      }
    })
  }

  // do a serie of operations to db, the operations are defined in the input "array"
  _batchArrayDB (DB, array) {
    DB.batch(array, function (err) {
      if (err) {
        return console.log('_batchArrayDB function gets an errpr!', err)
      }
    })
  }

  // convert a put/get/del/.. operation into batch function input format
  _convertToBatchInput (type, key, value) {
    let output = {}
    output['type'] = type
    output['key'] = key
    output['value'] = value

    return output
  }

  // combine strings with '!' in between
  _combineStrings (input1, input2, input3 = '') {
    if (input3 !== '') {
      return (input1.toString() + '!' + input2.toString() + '!' + input3.toString())
    }

    return (input1.toString() + '!' + input2.toString())
  }

  // remove the '!' symbols in the string and separate it to several strings
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

  // convert each item (here is json format) of a list to string format
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

  // validate input is json format string
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
