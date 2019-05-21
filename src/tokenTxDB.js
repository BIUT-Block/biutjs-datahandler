const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class TokenTxDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading token transaction db')
    }

    mkdirp.sync(config.DBPath + '/tokenTx')

    let tokenTxDBPath = path.join(config.DBPath, './tokenTx')

    this._initDB(tokenTxDBPath)
  }

  /**
   * Load or create database
   */
  _initDB (tokenTxDBPath) {
    try {
      this.tokenTxDB = level(tokenTxDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.tokenTxDB, callback)
  }

  isTxExist (txHash, callback) {
    dataHandlerUtil._getDB(this.tokenTxDB, txHash, (err, data) => {
      if (err) callback(null, false)
      else {
        callback(null, true)
      }
    })
  }

  getTxAmount (callback) {
    let length = 0
    this.tokenTxDB.createReadStream().on('data', function (data) {
      length = length + 1
    }).on('error', function (err) {
      // console.log('Stream occurs an error when trying to read all data!')
      callback(err, null)
    }).on('close', function () {
      // console.log('Stream closed')
    }).on('end', function () {
      // console.log('Stream ended')
      callback(null, length)
    })
  }
  
  getAllTxs (callback) {
    dataHandlerUtil._getAllDataInDB(this.tokenTxDB, callback)
  }

  getTxHashList (callback) {
    dataHandlerUtil._getAllKeysInDB(this.tokenTxDB, callback)
  }

  getTx (txHash, callback) {
    dataHandlerUtil._getDB(this.tokenTxDB, txHash, (err, data) => {
      if (err) callback(err, null)
      else {
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
        callback(null, data)
      }
    })
  }

  writeTx (tx, block, callback) {
    this._writeTx(tx, block).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  delTx (tx, callback) {
    this._delTx(tx).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  writeBlock (block, callback) {
    this._writeBlock(block).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  delBlock (block, callback) {
    this._delBlock(block).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  writeChain (chain, callback) {
    this._writeChain(chain).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  delChain (chain, callback) {
    this._delChain(chain).then(() => {
      callback()
    }).catch((err) => {
      callback(err)
    })
  }

  async _writeTx (tx, block) {
    try {
      if (typeof tx === 'string') {
        tx = JSON.parse(tx)
      }
      tx.BlockNumber = block.Number
      tx.BlockHash = block.Hash
      await dataHandlerUtil._putJsonDBPromise(this.tokenTxDB, tx.TxHash, tx)
    } catch (e) {
      throw e
    }
  }

  async _delTx (tx) {
    try {
      if (typeof tx === 'string') {
        tx = JSON.parse(tx)
      }
      await dataHandlerUtil._delDBPromise(this.tokenTxDB, tx.TxHash)
    } catch (e) {
      throw e
    }
  }

  async _writeBlock (block) {
    try {
      if (typeof block === 'string') {
        block = JSON.parse(block)
      }
    } catch (e) {
      throw e
    }

    await dataHandlerUtil._asyncForEach(block.Transactions, async (tx) => {
      await this._writeTx(tx, block)
    })
  }

  async _delBlock (block) {
    try {
      if (typeof block === 'string') {
        block = JSON.parse(block)
      }
    } catch (e) {
      throw e
    }

    await dataHandlerUtil._asyncForEach(block.Transactions, async (tx) => {
      await this._delTx(tx)
    })
  }

  async _writeChain (chain) {
    if (!Array.isArray(chain)) {
      throw new Error('invalid type of input argument chain, which should be an array')
    }

    await dataHandlerUtil._asyncForEach(chain, async (block) => {
      await this._writeBlock(block)
    })
  }

  async _delChain (chain) {
    if (!Array.isArray(chain)) {
      throw new Error('invalid type of input argument chain, which should be an array')
    }

    await dataHandlerUtil._asyncForEach(chain, async (block) => {
      await this._delBlock(block)
    })
  }
}

module.exports = TokenTxDB
