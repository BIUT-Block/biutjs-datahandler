const fs = require('fs')
const path = require('path')
const Promise = require('promise')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class TxBlockChainDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading transaction block chain db')
    }

    if (!fs.existsSync(config.DBPath)) {
      fs.mkdirSync(config.DBPath)
    }

    this.DBPath = config.DBPath
    this.txBlockChainDBPath = path.join(this.DBPath, './txBlockChain')
    this._initDB()
  }

  /**
   * Load or create databases
   */
  _initDB () {
    try {
      this.txBlockChainDB = level(this.txBlockChainDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  /**
   * Write single tx block or full transaction chain data to database
   * @param  {Array | Object} txData - single tx block data or full transaction block chain data
   * @param  {Function} callback - callback function, returns error if exist
   * @return {None}
   */
  writeTxBlockToDB (txData, callback) {
    let self = this
    let txPromiseList = []

    if (!Array.isArray(txData)) {
      txData = [txData]
    }

    txData.forEach(function (txBlock) {
      txBlock.Transactions = dataHandlerUtil._txStringify(txBlock.Transactions)
      txPromiseList.push(dataHandlerUtil._putJsonDB(self.txBlockChainDB, txBlock.Number, txBlock))
      txPromiseList.push(dataHandlerUtil._putDB(self.txBlockChainDB, txBlock.Hash, txBlock.Number))
    })

    Promise.all(txPromiseList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Check whether the transaction block chain database is empty
   * @param  {Function} callback - callback function, callback arguments (err, emptyFlag)
   * @return {None}
   */
  isTxBlockChainDBEmpty (callback) {
    dataHandlerUtil._isDBEmpty(this.txBlockChainDB, callback)
  }

  /**
   * Get all the data in transaction block chain database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxBlockChainDB (callback) {
    dataHandlerUtil._getAllDataInDB(this.txBlockChainDB, callback)
  }

  /**
   * Get transaction blocks according to block hash values
   * @param  {String | Array} blockHashArray - block hash values, string or array format
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxBlockFromDB (blockHashArray, callback) {
    let self = this

    let buffer = []
    if (typeof blockHashArray === 'string') {
      blockHashArray = [blockHashArray]
    }

    if (!Array.isArray(blockHashArray)) {
      throw new Error('invalid blockHashArray input, should be an array')
    }

    self._getTxBlockFromDBRecursive(0, blockHashArray, buffer, function (err) {
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
  _getTxBlockFromDBRecursive (index, array, buffer, callback) {
    let self = this
    this._getTxBlockFromDB(array[index], (err, value) => {
      if (err) {
        callback(err)
      } else {
        buffer.push(value)
        if (index + 1 < array.length) {
          self._getTxBlockFromDBRecursive(index + 1, array, buffer, (err) => {
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
   * Read corresponding block data(json format) from transaction database
   * @return {None}
   */
  _getTxBlockFromDB (blockHash, callback) {
    let self = this
    dataHandlerUtil._getDB(this.txBlockChainDB, blockHash, (err, value) => {
      if (err) {
        callback(err, null)
      } else {
        dataHandlerUtil._getJsonDB(self.txBlockChainDB, value, (err, value) => {
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
   * Get transaction block chain data, from number 'minBlockNumber' to number 'maxBlockNumber'
   * @param {Integer} minBlockNumber - minimum block number
   * @param {Integer} maxBlockNumber - maximum block number
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxChain (minBlockNumber, maxBlockNumber, callback) {
    let buffer = []
    if (minBlockNumber > maxBlockNumber) {
      throw new Error('invalid block numbers')
    }

    this._getTxChainRecursive(minBlockNumber, maxBlockNumber, buffer, (err) => {
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
  _getTxChainRecursive (index, maxBlockNumber, buffer, callback) {
    let self = this
    this._getTxChain(index, (err, value) => {
      if (err) {
        callback(err)
      } else {
        buffer.push(value)
        if (index < maxBlockNumber) {
          self._getTxChainRecursive(index + 1, maxBlockNumber, buffer, (err) => {
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
   * Read corresponding block data(json format) from transaction database
   */
  _getTxChain (number, callback) {
    dataHandlerUtil._getJsonDB(this.txBlockChainDB, number, (err, value) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, value)
      }
    })
  }
}

module.exports = TxBlockChainDB
