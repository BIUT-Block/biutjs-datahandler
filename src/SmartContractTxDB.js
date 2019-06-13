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

    this.smartContractDBPath = path.join(config.DBPath, './smartContract')

    this._initDB()
  }

  /**
   * Load or create database
   */
  _initDB () {
    try {
      this.smartContractDB = level(this.smartContractDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.smartContractDB, this.smartContractDBPath, (err) => {
      if (err) return callback(err)
      else {
        this._initDB()
        callback()
      }
    })
  }

  add (tokenName, contractAddress, callback) {
    dataHandlerUtil._putDB(this.smartContractDB, contractAddress, tokenName, callback)
  }

  getContractAddress (tokenName, callback) {
    let bufferHash = []
    this.smartContractDB.createReadStream().on('data', function (data) {
      if (data.value === tokenName) {
        bufferHash.push(JSON.parse(data.key))
      }
    }).on('error', function (err) {
      // console.log('Stream occurs an error when trying to read all data!')
      callback(err, null)
    }).on('close', function () {
      // console.log('Stream closed')
      // callback(null, [bufferHeight, bufferHash])
    }).on('end', function () {
      // console.log('Stream ended')
      callback(null, bufferHash)
    })
  }

  getTokenName (contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, callback)
  }
}

module.exports = SmartContractTxDB
