const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class AccDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading account db')
    }
    mkdirp.sync(config.DBPath + '/acc')
    this.accDBPath = path.join(config.DBPath, './acc')
    this._initDB()
  }

  /**
   * Load or create database
   */
  _initDB () {
    try {
      this.accDB = level(this.accDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  getDBInstance () {
    return this.accDB
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.accDB, this.accDBPath, (err) => {
      if (err) return callback(err)
      else {
        this._initDB()
        callback()
      }
    })
  }

  isAccExist (accAddr, callback) {
    dataHandlerUtil._getDB(this.accDB, accAddr, (err, data) => {
      if (err) callback(null, false)
      else {
        callback(null, true)
      }
    })
  }

  getAccAmount (callback) {
    let length = 0
    this.accDB.createReadStream().on('data', function (data) {
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

  getAllAcc (callback) {
    dataHandlerUtil._getAllDataInDB(this.accDB, callback)
  }

  getAccList (callback) {
    dataHandlerUtil._getAllKeysInDB(this.accDB, callback)
  }

  getAcc (accAddr, callback) {
    dataHandlerUtil._getDB(this.accDB, accAddr, (err, data) => {
      if (err) callback(err, null)
      else {
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
        callback(null, data)
      }
    })
  }

  writeTx (tx, callback) {
    this._writeTx(tx).then(() => {
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

  async _writeTx (tx) {
    try {
      if (typeof tx === 'string') {
        tx = JSON.parse(tx)
      }
      if (tx.TxFrom !== '0000000000000000000000000000000000000000') {
        let txInfo = { From: [], To: [] }
        try {
          txInfo = await this.accDB.get(tx.TxFrom)
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo) || { From: [], To: [] }
          }
        } catch (err) { txInfo = { From: [], To: [] } }
        if (txInfo.From.indexOf(tx.TxHash) < 0) {
          txInfo.From.push(tx.TxHash)
        }
        try {
          await dataHandlerUtil._putJsonDBPromise(this.accDB, tx.TxFrom, txInfo)
        } catch (err) {
          throw err
        }
      }
      if (tx.TxTo !== '0000000000000000000000000000000000000000') {
        let txInfo = { From: [], To: [] }
        try {
          txInfo = await this.accDB.get(tx.TxTo)
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo) || { From: [], To: [] }
          }
        } catch (err) { txInfo = { From: [], To: [] } }
        if (txInfo.To.indexOf(tx.TxHash) < 0) {
          txInfo.To.push(tx.TxHash)
        }
        try {
          await dataHandlerUtil._putJsonDBPromise(this.accDB, tx.TxTo, txInfo)
        } catch (err) {
          throw err
        }
      }
    } catch (err) {
      throw err
    }
  }

  async _delTx (tx) {
    try {
      if (typeof tx === 'string') {
        tx = JSON.parse(tx)
      }
      if (tx.TxFrom !== '0000000000000000000000000000000000000000') {
        let txInfo = { From: [], To: [] }
        try {
          txInfo = await this.accDB.get(tx.TxFrom)
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo) || { From: [], To: [] }
          }
        } catch (err) { txInfo = { From: [], To: [] } }
        if (txInfo.From.indexOf(tx.TxHash) > -1) {
          txInfo.From = txInfo.From.filter((TxHash) => {
            return TxHash !== tx.TxHash
          })
        }
        try {
          await dataHandlerUtil._putJsonDBPromise(this.accDB, tx.TxFrom, txInfo)
        } catch (err) {
          throw err
        }
      }
      if (tx.TxTo !== '0000000000000000000000000000000000000000') {
        let txInfo = { From: [], To: [] }
        try {
          txInfo = await this.accDB.get(tx.TxTo)
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo) || { From: [], To: [] }
          }
        } catch (err) { txInfo = { From: [], To: [] } }
        if (txInfo.To.indexOf(tx.TxHash) > -1) {
          txInfo.To = txInfo.To.filter((TxHash) => {
            return TxHash !== tx.TxHash
          })
        }
        try {
          await dataHandlerUtil._putJsonDBPromise(this.accDB, tx.TxTo, txInfo)
        } catch (err) {
          throw err
        }
      }
    } catch (err) {
      throw err
    }
  }
}

module.exports = AccDB
