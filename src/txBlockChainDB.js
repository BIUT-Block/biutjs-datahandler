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
   * Get all the block datas from transaction block chain database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxBlockChainDB (callback) {
    dataHandlerUtil._getAllBlocksInDB(this.txBlockChainDB, callback)
  }

  /**
   * Get transaction blocks according to block hash values
   * @param  {String | Array} blockHashArray - block hash values, string or array format
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxBlockFromDB (blockHashArray, callback) {
    if (typeof blockHashArray === 'string') {
      blockHashArray = [blockHashArray]
    }

    if (!Array.isArray(blockHashArray)) {
      throw new Error('invalid blockHashArray input, should be an array')
    }

    let promise = this._getTxBlockFromDB(blockHashArray)
    promise.then((data) => {
      callback(null, data)
    }).catch((err) => {
      callback(err, null)
    })
  }

  /**
   * Read corresponding block data(json format) from transaction database
   * @return {None}
   */
  async _getTxBlockFromDB (blockHashArray) {
    let self = this
    let buffer = []

    await dataHandlerUtil._asyncForEach(blockHashArray, async (blockHash) => {
      let data = await dataHandlerUtil._getDBPromise(this.txBlockChainDB, blockHash)
      if (data[0] !== null) {
        throw data[0]
      } else {
        data = await dataHandlerUtil._getJsonDBPromise(self.txBlockChainDB, data[1])
        if (data[0] !== null) {
          throw data[0]
        } else {
          buffer.push(data[1])
        }
      }
    })

    return buffer
  }

  /**
   * Get transaction block chain data, from number 'minBlockNumber' to number 'maxBlockNumber'
   * @param {Integer} minBlockNumber - minimum block number
   * @param {Integer} maxBlockNumber - maximum block number
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTxChain (minBlockNumber, maxBlockNumber, callback) {
    if (minBlockNumber > maxBlockNumber) {
      throw new Error('invalid block numbers')
    }

    let promise = this._getTxChain(minBlockNumber, maxBlockNumber)
    promise.then((data) => {
      callback(null, data)
    }).catch((err) => {
      callback(err, null)
    })
  }

  /**
   * Read corresponding block data(json format) from transaction database
   */
  async _getTxChain (minHeight, maxHeight) {
    let buffer = []
    for (let i = minHeight; i < maxHeight + 1; i++) {
      let data = await dataHandlerUtil._getJsonDBPromise(this.txBlockChainDB, i)
      if (data[0] !== null) {
        throw data[0]
      } else {
        buffer.push(data[1])
      }
    }
    return buffer
  }
}

module.exports = TxBlockChainDB
