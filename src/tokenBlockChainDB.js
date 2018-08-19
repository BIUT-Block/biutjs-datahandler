const fs = require('fs')
const path = require('path')
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

    if (!fs.existsSync(config.DBPath)) {
      fs.mkdirSync(config.DBPath)
    }

    this.DBPath = config.DBPath
    this.tokenBlockChainDBPath = path.join(this.DBPath, './tokenBlockChain')
    this._initDB()
  }

  /**
   * Load or create databases
   */
  _initDB () {
    try {
      this.tokenBlockChainDB = level(this.tokenBlockChainDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
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
      tokenPromiseList.push(dataHandlerUtil._putJsonDB(self.tokenBlockChainDB, tokenBlock.Number, tokenBlock))
      tokenPromiseList.push(dataHandlerUtil._putDB(self.tokenBlockChainDB, tokenBlock.Hash, tokenBlock.Number))
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
   * Get all the data in token block chain database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenBlockChainDB (callback) {
    dataHandlerUtil._getAllDataInDB(this.tokenBlockChainDB, callback)
  }

  /**
   * Get token blocks according to block hash values
   * @param  {String | Array} blockHashArray - block hash values, string or array format
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenBlockFromDB (blockHashArray, callback) {
    let self = this

    let buffer = []
    if (typeof blockHashArray === 'string') {
      blockHashArray = [blockHashArray]
    }

    if (!Array.isArray(blockHashArray)) {
      throw new Error('invalid blockHashArray input, should be an array')
    }

    self._getTokenBlockFromDBRecursive(0, blockHashArray, buffer, function (err) {
      if (err) {
        callback(err, null)
      } else {
        callback(null, buffer)
      }
    })
  }

  /**
   * This function is used for recursive
   */
  _getTokenBlockFromDBRecursive (index, array, buffer, callback) {
    let self = this
    this._getTokenBlockFromDB(array[index], (err, value) => {
      if (err) {
        callback(err)
      } else {
        buffer.push(value)
        if (index + 1 < array.length) {
          self._getTokenBlockFromDBRecursive(index + 1, array, buffer, (err) => {
            if (err) {
              callback(err)
            } else {
              callback(null)
            }
          })
        } else {
          callback(null)
        }
      }
    })
  }

  /**
   * Read corresponding block data(json format) from token database
   * @return {None}
   */
  _getTokenBlockFromDB (blockHash, callback) {
    let self = this
    dataHandlerUtil._getDB(this.tokenBlockChainDB, blockHash, (err, value) => {
      if (err) {
        callback(err, null)
      } else {
        dataHandlerUtil._getJsonDB(self.tokenBlockChainDB, value, (err, value) => {
          if (err) {
            callback(err, null)
          } else {
            callback(null, value)
          }
        })
      }
    })
  }

  /**
   * Get token block chain data, from number 'minBlockNumber' to number 'maxBlockNumber'
   * @param {Integer} minBlockNumber - minimum block number
   * @param {Integer} maxBlockNumber - maximum block number
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenChain (minBlockNumber, maxBlockNumber, callback) {
    let buffer = []
    if (minBlockNumber > maxBlockNumber) {
      throw new Error('invalid block numbers')
    }

    this._getTokenChainRecursive(minBlockNumber, maxBlockNumber, buffer, (err) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, buffer)
      }
    })
  }

  /**
   * This function is used for recursive
   */
  _getTokenChainRecursive (index, maxBlockNumber, buffer, callback) {
    let self = this
    this._getTokenChain(index, (err, value) => {
      if (err) {
        callback(err)
      } else {
        buffer.push(value)
        if (index < maxBlockNumber) {
          self._getTokenChainRecursive(index + 1, maxBlockNumber, buffer, (err) => {
            if (err) {
              callback(err)
            } else {
              callback(null)
            }
          })
        } else {
          callback(null)
        }
      }
    })
  }

  /**
   * Read corresponding block data(json format) from token database
   */
  _getTokenChain (number, callback) {
    dataHandlerUtil._getJsonDB(this.tokenBlockChainDB, number, (err, value) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, value)
      }
    })
  }
}

module.exports = TokenBlockChainDB
