const level = require('level')

class SECDataHandler {
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for SECDataHandler class construction')
    }

    this.DBPath = config.DBPath
    if (this.DBPath.slice(-1) !== '/') {
      this.DBPath += '/'
    }

    this.userDBPath = config.DBPath + 'user/'
    this.productDBPath = config.DBPath + 'product/'
    this.txBlockChainDBPath = config.DBPath + 'txBlockChain/'
    this.tokenBlockChainDBPath = config.DBPath + 'tokenBlockChain/'

    this._createLoadDB()
  }

  _createLoadDB () {
    this.userDB = level(this.userDBPath)
    this.productDB = level(this.productDBPath)
    this.txBlockChainDB = level(this.txBlockChainDBPath)
    this.tokenBlockChainDB = level(this.tokenBlockChainDBPath)
  }

  writeTokenChainToDB (jsonFile) {
    if (!this._jsonTypeCheck(jsonFile)) {
      throw new TypeError('Invalid json file')
    }

    let self = this
    let tokenChain = JSON.parse(jsonFile)

    Object.keys(tokenChain).forEach(function (blockHeight) {
      self.writeTokenBlockToDB(tokenChain[blockHeight])
    })
  }

  writeTokenBlockToDB (blockInfo) {
    let self = this

    // token database operations
    this._putDB(self.tokenBlockChainDB, this._combineStrings(blockInfo.Height, 'chain'), 'token')

    Object.keys(blockInfo).forEach(function (key) {
      let putKey = self._combineStrings(blockInfo.Height, key)
      if (key !== 'Transactions') {
        self._putDB(self.tokenBlockChainDB, putKey, blockInfo[key])
      } else {
        self._putDB(self.tokenBlockChainDB, putKey, self._txStringify(blockInfo[key]))
      }
    })

    // user database operations
    blockInfo.Transactions.forEach(function (transaction) {
      // very limited data is stored in user db, more information about the transaction can be found in token database
      if (!self._jsonTypeCheck(transaction)) {
        throw new TypeError('Invalid json file')
      }
      transaction = JSON.parse(transaction)

      if (typeof transaction.TxFrom !== 'undefined' && typeof transaction.TxTo !== 'undefined') {
        self._putDB(self.userDB, self._combineStrings(transaction.TxFrom, 'payer', transaction.TxHash), blockInfo.Height)
        self._putDB(self.userDB, self._combineStrings(transaction.TxTo, 'payee', transaction.TxHash), blockInfo.Height)
      }
    })

    // product database operations
    // token chain has no product info, so no updates on this database?
    // transaction database operations
    // transaction database does not need to be updated as well
  }

  // writeTxChainToDB () {}
  // writeTxBlockToDB () {}

  getUserTx (address) {
    if (typeof address !== 'string') {
      throw new TypeError('Invalid user address')
    }

    let self = this
    this.userDB.createReadStream({
      gte: self._combineStrings(address, 'payer')
    }).on('data', function (data, err) {
      if (err) {
        return console.log('Ooops! Sth wrong with getUserTx function', err)
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

  // _getDBKeyList (DB)
  // _removeDuplicatedBlock()
  // _removeDuplicatedUser()
  // _removeDuplicatedProduct()

  _putDB (DB, key, value) {
    DB.put(key, value, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _getDB (DB, key) {
    DB.get(key, function (err, value) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log(key + '=' + value)
    })
  }

  _delDB (DB, key) {
    DB.del(key, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _batchArrayDB (DB, array) {
    DB.batch(array, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log('Great success dear leader!')
    })
  }

  _convertToBatchInput (type, key, value) {
    let output = {}
    output['type'] = type
    output['key'] = key
    output['value'] = value

    return output
  }

  _combineStrings (input1, input2, input3 = '') {
    if (input3 !== '') {
      return (input1.toString() + '!' + input2.toString() + '!' + input3.toString())
    }

    return (input1.toString() + '!' + input2.toString())
  }

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

  _jsonTypeCheck (jsonFile) {
    try {
      JSON.parse(jsonFile)
    } catch (e) {
      return false
    }

    return true
  }
}

module.exports = SECDataHandler
