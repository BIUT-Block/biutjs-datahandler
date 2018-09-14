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
   * Get all the block datas from token block chain database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getTokenBlockChainDB (callback) {
    dataHandlerUtil._getAllBlocksInDB(this.tokenBlockChainDB, callback)
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

  delBlocksFromHeight(blockHeight, callback) {
    if (blockHeight < 1) {
      throw new Error("invalid input block height")
    }

    let self = this
    let promiseList = []
    dataHandlerUtil._getAllBlockHeightsInDB(this.tokenBlockChainDB, (err, data) => {
      if (err) {
        callback(err)
      } else {
        if (blockHeight in data) {
          pos = data.indexOf(blockHeight)
          data = data.slice(pos)
          data.forEach((height) => {
            promiseList.push(dataHandlerUtil._delDBPromise(self.tokenBlockChainDB, height))
          })
        }
        data.push(blockHeight)
        
        data.indexOf(blockHeight)
        callback()
      }
    })
  }
}

module.exports = TokenBlockChainDB
