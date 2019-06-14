const path = require('path')
const mkdirp = require('mkdirp')
const Promise = require('promise')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class TokenBlockChainDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading token block chain db')
    }

    mkdirp.sync(config.DBPath + '/tokenBlockChain')

    this.tokenDBPath = path.join(config.DBPath, './tokenBlockChain')
    this._initDB()
  }

  /**
   * Load or create databases
   */
  _initDB () {
    try {
      this.tokenBlockChainDB = level(this.tokenDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  getDBPath () {
    return this.tokenDBPath
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.tokenBlockChainDB, this.tokenDBPath, (err) => { 
      if (err) return callback(err) 
      else { 
        this._initDB() 
        callback() 
      } 
    }) 
  }

  /**
   * Write single token block or full token chain data to database
   * @param  {Array | Object} tokenData - single token block data or full token block chain data
   * @param  {Function} callback - callback function, returns error if exist
   * @return {None}
   */
  writeTokenBlockToDB (tokenData, callback) {
    let self = this
    let tokenPromiseList = []

    if (!Array.isArray(tokenData)) {
      tokenData = [tokenData]
    }

    tokenData.forEach(function (tokenBlock) {
      tokenBlock.Transactions = dataHandlerUtil._txStringify(tokenBlock.Transactions)
      tokenPromiseList.push(dataHandlerUtil._putJsonDBPromise(self.tokenBlockChainDB, tokenBlock.Number, tokenBlock))
      tokenPromiseList.push(dataHandlerUtil._putDBPromise(self.tokenBlockChainDB, tokenBlock.Hash, tokenBlock.Number))
    })

    Promise.all(tokenPromiseList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Check whether the token block chain database is empty
   * @param  {Function} callback - callback function, callback arguments (err, emptyFlag)
   * @return {None}
   */
  isTokenBlockChainDBEmpty (callback) {
    dataHandlerUtil._isDBEmpty(this.tokenBlockChainDB, callback)
  }

  /**
   * Get all the block datas from token block chain database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenBlockChainDB (callback) {
    dataHandlerUtil._getAllBlocksInDBSort(this.tokenBlockChainDB, callback)
  }

  /**
   * Get token blocks according to block hash values
   * @param  {String | Array} blockHashArray - block hash values, string or array format
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenBlockFromDB (blockHashArray, callback) {
    if (typeof blockHashArray === 'string') {
      blockHashArray = [blockHashArray]
    }

    if (!Array.isArray(blockHashArray)) {
      throw new Error('invalid blockHashArray input, should be an array')
    }

    let promise = this._getTokenBlockFromDB(blockHashArray)
    promise.then((data) => {
      callback(null, data)
    }).catch((err) => {
      callback(err, null)
    })
  }

  /**
   * Read corresponding block data(json format) from token database
   * @return {None}
   */
  async _getTokenBlockFromDB (blockHashArray) {
    let self = this
    let buffer = []

    await dataHandlerUtil._asyncForEach(blockHashArray, async (blockHash) => {
      let data = await dataHandlerUtil._getDBPromise(this.tokenBlockChainDB, blockHash)
      if (data[0] !== null) {
        throw data[0]
      } else {
        data = await dataHandlerUtil._getJsonDBPromise(self.tokenBlockChainDB, data[1])
        if (data[0] !== null) {
          throw data[0]
        } else {
          buffer.push(data[1])
        }
      }
    })

    return buffer
  }

  getBlock (number, callback) {
    dataHandlerUtil._getJsonDB(this.tokenBlockChainDB, number, callback)
  }

  getHashList (callback) {
    dataHandlerUtil._getHashList(this.tokenBlockChainDB, callback)
  }

  /**
   * Get token block chain data, from number 'minBlockNumber' to number 'maxBlockNumber'
   * @param {Integer} minBlockNumber - minimum block number
   * @param {Integer} maxBlockNumber - maximum block number
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenChain (minBlockNumber, maxBlockNumber, callback) {
    if (minBlockNumber > maxBlockNumber) {
      throw new Error('invalid block numbers')
    }

    let promise = this._getTokenChain(minBlockNumber, maxBlockNumber)
    promise.then((data) => {
      callback(null, data)
    }).catch((err) => {
      callback(err, null)
    })
  }

  /**
   * Read corresponding block data(json format) from token database
   */
  async _getTokenChain (minHeight, maxHeight) {
    let buffer = []
    for (let i = minHeight; i < maxHeight + 1; i++) {
      let data = await dataHandlerUtil._getJsonDBPromise(this.tokenBlockChainDB, i)
      if (data[0] !== null) {
        throw data[0]
      } else {
        buffer.push(data[1])
      }
    }
    return buffer
  }

  /**
   * Delete blocks which have a higher height than the input 'blockHeight' argument
   * @param {Integer} blockHeight - blocks with larger height will be deleted from database
   * @param  {Function} callback - callback function, callback arguments (err)
   * @return {None}
   */
  delBlocksFromHeight (blockHeight, callback) {
    let self = this
    dataHandlerUtil._getAllBlockHeightsInDB(this.tokenBlockChainDB, (err, data) => {
      if (err) {
        callback(err)
      } else {
        let pos = 0
        let promiseList = []
        let bufferHeight = data[0]
        let bufferHash = data[1]
        if (blockHeight in bufferHeight) {
          pos = bufferHeight.indexOf(blockHeight)
          bufferHeight = bufferHeight.slice(pos)
        } else {
          bufferHeight.push(blockHeight)
          bufferHeight = bufferHeight.sort((a, b) => a - b)
          pos = bufferHeight.indexOf(blockHeight)
          bufferHeight = bufferHeight.slice(pos + 1)
        }

        bufferHeight.forEach((height) => {
          promiseList.push(dataHandlerUtil._delDBPromise(self.tokenBlockChainDB, height))
        })
        bufferHash.forEach((hash) => {
          promiseList.push(dataHandlerUtil._delDBPromise(self.tokenBlockChainDB, hash))
        })

        Promise.all(promiseList).then(() => {
          callback()
        }).catch((err) => {
          callback(err)
        })
      }
    })
  }

  delBlock (block, callback) {
    dataHandlerUtil._delDB(this.tokenBlockChainDB, block.Hash, (err) => {
      if (err) return callback(err)
      dataHandlerUtil._delDB(this.tokenBlockChainDB, block.Number, (err) => {
        if (err) return callback(err)
        callback()
      })
    })
  }

  /**
   * Add new blocks from a specific position if the blocks does not exist
   * Update old blocks from a specific position if the blocks already exist
   * @param {Integer} pos - block add/update starting position
   * @param {Array} blockArray - array of block data(json object)
   * @param  {Function} callback - callback function, callback arguments (err)
   * @return {None}
   */
  addUpdateBlock (pos, blockArray, callback) {
    if (pos < 0 || !Array.isArray(blockArray)) {
      throw new Error('invalid input data')
    }

    let self = this
    const _addUpdateBlock = function (pos, blockArray, callback) {
      let len = blockArray.length
      let promiseList = []
      for (let i = 0; i < len; i++) {
        promiseList.push(dataHandlerUtil._putJsonDBPromise(self.tokenBlockChainDB, pos + i, blockArray[i]))
        if (!('Hash' in blockArray[i])) {
          return callback(new Error('Invalid block data, block hash missing'))
        }
        promiseList.push(dataHandlerUtil._putJsonDBPromise(self.tokenBlockChainDB, blockArray[i].Hash, pos + i))
      }

      Promise.all(promiseList).then(() => {
        callback()
      }).catch((err) => {
        callback(err)
      })
    }

    if (pos === 0) {
      _addUpdateBlock(pos, blockArray, callback)
    } else {
      dataHandlerUtil._getJsonDBPromise(this.tokenBlockChainDB, pos - 1).then((data) => {
        if (data[0] !== null) {
          callback(new Error('Failed to put a block into token database, reason: block number is discontinuous'))
        } else {
          _addUpdateBlock(pos, blockArray, callback)
        }
      })
    }
  }

  /**
   * Find all previous transactions for a user by user wallet address
   * @param {String} userAddress - user account address
   * @param  {Function} callback - callback function, callback arguments (txArray, err)
   * @return {None}
   */
  findTxForUser (userAddress, callback) {
    let txBuffer = []
    this.tokenBlockChainDB.createReadStream().on('data', function (data) {
      if (data.key.length !== dataHandlerUtil.HASH_LENGTH) {
        data.value = JSON.parse(data.value)
        if (('Transactions' in data.value) && (data.value['Transactions'].length !== 0)) {
          data.value['Transactions'].forEach((transaction, index) => {
            try {
              transaction = JSON.parse(transaction)
            } catch (err) {
              // expected errors: JsonParsingError
            }
            if ((transaction.TxFrom === userAddress) || (transaction.TxTo === userAddress)) {
              transaction.BlockNumber = data.value['Number']
              transaction.BlockHash = data.value['Hash']
              transaction.CumulativeGasUsed = data.value['GasUsed']
              transaction.TransactionIndex = index
              transaction.ContractAddress = ''
              transaction.Confirmations = ''
              txBuffer.push(transaction)
            }
          })
        }
      }
    }).on('error', function (err) {
      callback(err, null)
    }).on('close', function () {
    }).on('end', function () {
      callback(null, txBuffer)
    })
  }

  /**
   * Find previous transactions for a user by user transaction hash
   * @param  {String} txHash -transaction hash
   * @param  {Function} callback -callback function, callback arguments (txArray, err)
   * @return {None}
   */
  findTx (txHash, callback) {
    let txBuffer = []
    this.tokenBlockChainDB.createReadStream().on('data', function (data) {
      if (data.key.length !== dataHandlerUtil.HASH_LENGTH) {
        data.value = JSON.parse(data.value)
        if (('Transactions' in data.value) && (data.value['Transactions'].length !== 0)) {
          data.value['Transactions'].forEach((transaction) => {
            try {
              transaction = JSON.parse(transaction)
              if (transaction.TxHash === txHash) {
                txBuffer.push(transaction)
              }
            } catch (err) {
              // expected errors: JsonParsingError or KeyError(TxFrom or TxTo does not exist)
              callback(err, null)
            }
          })
        }
      }
    }).on('error', function (err) {
      callback(err, null)
    }).on('close', function () {
    }).on('end', function () {
      callback(null, txBuffer)
    })
  }

  getTotalRewards (callback) {
    let rewardAmount = 0
    this.tokenBlockChainDB.createReadStream().on('data', function (data) {
      if (data.key.length !== dataHandlerUtil.HASH_LENGTH) {
        data.value = JSON.parse(data.value)
        if (('Transactions' in data.value) && (data.value['Transactions'].length !== 0)) {
          if (typeof data.value['Transactions'][0] === 'string') {
            data.value['Transactions'][0] = JSON.parse(data.value['Transactions'][0])
          }

          if ((data.value['Transactions'][0].TxFrom === '0000000000000000000000000000000000000000') && (data.value['Number'] !== 0)) {
            rewardAmount = rewardAmount + parseFloat(data.value['Transactions'][0].Value)
          }
        }
      }
    }).on('error', function (err) {
      callback(err, null)
    }).on('close', function () {
    }).on('end', function () {
      callback(null, rewardAmount)
    })
  }  
}

module.exports = TokenBlockChainDB
