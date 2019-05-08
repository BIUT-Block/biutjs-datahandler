const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class SmartContractTxDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if(config.chainName === 'SEC'){
      if (typeof config.dbconfig.SecDBPath !== 'string' || config.dbconfig.SecDBPath === '') {
        throw new Error('Needs a valid config input for creating or loading SEC smart contract db')
      }
  
      mkdirp.sync(config.dbconfig.SecDBPath + '/smartContractTx')
  
      let smartContractDBPath = path.join(config.dbconfig.SecDBPath, './smartContract')
  
      this._initDB(smartContractDBPath)
    } else if(config.chainName === 'SEN'){
      if (typeof config.dbconfig.SenDBPath !== 'string' || config.dbconfig.SenDBPath === '') {
        throw new Error('Needs a valid config input for creating or loading SEN smart contract db')
      }
  
      mkdirp.sync(config.dbconfig.SenDBPath + '/smartContractTx')
  
      let smartContractDBPath = path.join(config.dbconfig.SenDBPath, './smartContract')
  
      this._initDB(smartContractDBPath)
    }
  }

  /**
   * Load or create database
   */
  _initDB (smartContractDBPath) {
    try {
      this.smartContractDB = level(smartContractDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.smartContractDB, callback)
  }

  add (tokenName, contractAddress, callback) {
    dataHandlerUtil._putDB(this.smartContractDB, contractAddress, tokenName, callback)
  }

  getContractAddress (tokenName, callback) {
    let buffer = ''
    let readStream = this.smartContractDB.createReadStream()
    readStream.on('data', function (data) {
      if (data.value === tokenName) {
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
      callback(null, buffer)
    })
  }

  getTokenName (contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, callback)
  }
}

module.exports = SmartContractTxDB
