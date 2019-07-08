const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class SmartContractTxDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor(config) {
    if (config.chainName === 'SEC') {
      if (typeof config.dbconfig.SecDBPath !== 'string' || config.dbconfig.SecDBPath === '') {
        throw new Error('Needs a valid config input for creating or loading SEC smart contract db')
      }

      mkdirp.sync(config.dbconfig.SecDBPath + '/smartContractTx')

      this.smartContractDBPath = path.join(config.dbconfig.SecDBPath, './smartContract')

      this._initDB()
    } else if (config.chainName === 'SEN') {
      if (typeof config.dbconfig.SenDBPath !== 'string' || config.dbconfig.SenDBPath === '') {
        throw new Error('Needs a valid config input for creating or loading SEN smart contract db')
      }

      mkdirp.sync(config.dbconfig.SenDBPath + '/smartContractTx')

      this.smartContractDBPath = path.join(config.dbconfig.SenDBPath, './smartContract')

      this._initDB()
    }
  }

  /**
   * Load or create database
   */
  _initDB() {
    try {
      this.smartContractDB = level(this.smartContractDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  clearDB(callback) {
    dataHandlerUtil._clearDB(this.smartContractDB, this.smartContractDBPath, (err) => {
      if (err) return callback(err)
      else {
        this._initDB()
        callback()
      }
    })
  }

  addTokenMap(tokenInfo, contractAddress, callback) {
    dataHandlerUtil._putDB(this.smartContractDB, contractAddress, tokenInfo, callback)
  }

  getContractAddress(tokenName, callback) {
    let buffer = ''
    let readStream = this.smartContractDB.createReadStream()
    readStream.on('data', function (data) {
      if (data.value.tokenName === tokenName) {
        buffer = data.key
        readStream.destroy()
      }
    }).on('error', function (err) {
      // console.log('Stream occurs an error when trying to read all data!')
      callback(err, null)
    }).on('close', function () {
      // console.log('Stream closed')
      callback(null, buffer)
    }).on('end', function () {
      // console.log('Stream ended')
      //callback(null, buffer)
    })
  }

  getTokenName(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        callback(err, null)
      } else {
        callback(null, value.tokenName)
      }
    })
  }
  getSourceCode(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        callback(err, null)
      } else {
        callback(null, value.sourceCode)
      }
    })
  }
  getDepositBalance(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        callback(err, null)
      } else {
        callback(null, value.depositBalance)
      }
    })
  }
  getTokenInfo(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        callback(err, null)
      } else {
        callback(null, value)
      }
    })
  }    
}

module.exports = SmartContractTxDB