const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class SmartContractTxDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading smart contract db')
    }

    mkdirp.sync(config.DBPath + '/smartContractTx')

    let smartContractDBPath = path.join(config.DBPath, './smartContract')

    this._initDB(smartContractDBPath)
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
        buffer = JSON.parse(data.key)
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
