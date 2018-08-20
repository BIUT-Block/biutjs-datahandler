const fs = require('fs')
const path = require('path')
const Promise = require('promise')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class AccountDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading account block chain db')
    }

    if (!fs.existsSync(config.DBPath)) {
      fs.mkdirSync(config.DBPath)
    }

    this.DBPath = config.DBPath
    this.accountDBPath = path.join(this.DBPath, './account')
    this._initDB()
  }

  /**
   * Load or create databases
   */
  _initDB () {
    try {
      this.accountDB = level(this.accountDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  /**
   * Write tx block chain transactions to account database
   * @param  {Array | Object} txData - single tx block data or full transaction block chain data
   * @param  {Function} callback - callback function, returns error if exist
   * @return {None}
   */
  updateAccountDBTxChain (txData, callback) {
    let self = this
    let accPromiseList = []

    if (!Array.isArray(txData)) {
      txData = [txData]
    }

    let key = ''
    txData.forEach(function (txBlock) {
      txBlock.Transactions.forEach(function (transaction) {
        if (typeof transaction.BuyerAddress !== 'undefined' && typeof transaction.SellerAddress !== 'undefined') {
          key = dataHandlerUtil._combineStrings('tx', transaction.BuyerAddress, 'payer', transaction.TxHash)
          accPromiseList.push(dataHandlerUtil._putDB(self.accountDB, key, transaction.BlockNumber))
          key = dataHandlerUtil._combineStrings('tx', transaction.SellerAddress, 'payee', transaction.TxHash)
          accPromiseList.push(dataHandlerUtil._putDB(self.accountDB, key, transaction.BlockNumber))
        }
      })
    })

    Promise.all(accPromiseList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Write token block chain transactions to account database
   * @param  {Array | Object} tokenData - single token block data or full token block chain data
   * @param  {Function} callback - callback function, returns error if exist
   * @return {None}
   */
  updateAccountDBTokenChain (tokenData, callback) {
    let self = this
    let accPromiseList = []

    if (!Array.isArray(tokenData)) {
      tokenData = [tokenData]
    }

    let key = ''
    tokenData.forEach(function (tokenBlock) {
      tokenBlock.Transactions.forEach(function (transaction) {
        if (typeof transaction.TxFrom !== 'undefined' && typeof transaction.TxTo !== 'undefined') {
          key = dataHandlerUtil._combineStrings('token', transaction.TxFrom, 'payer', transaction.TxHash)
          accPromiseList.push(dataHandlerUtil._putDB(self.accountDB, key, tokenBlock.Number))
          key = dataHandlerUtil._combineStrings('token', transaction.TxTo, 'payee', transaction.TxHash)
          accPromiseList.push(dataHandlerUtil._putDB(self.accountDB, key, tokenBlock.Number))
        }
      })
    })

    Promise.all(accPromiseList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Check whether the account database is empty
   * @param  {Function} callback - callback function, callback arguments (err, emptyFlag)
   * @return {None}
   */
  isAccountDBEmpty (callback) {
    dataHandlerUtil._isDBEmpty(this.accountDB, callback)
  }

  /**
   * Get all the data in account database
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  getAccountDB (callback) {
    dataHandlerUtil._getAllDataInDB(this.accountDB, callback)
  }
}

module.exports = AccountDB
