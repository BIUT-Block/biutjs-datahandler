const mkdirp = require('mkdirp')
const path = require('path')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class SmartContractTxDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor(config) {
      if (typeof config.DBPath !== 'string' || config.DBPath === '') {
        throw new Error('Needs a valid config input for creating or loading SEC smart contract db')
      }

      mkdirp.sync(config.DBPath + '/smartContractTx')

      this.smartContractDBPath = path.join(config.dbconfig.SecDBPath, './smartContract')

      this._initDB()
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

  deleteTokenMap(contractAddress, callback) {
    dataHandlerUtil._delDB(this.smartContractDB, contractAddress, callback)
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
        if(err.type='NotFoundError'){
          callback(null, null)
        } else {
          callback(err, null)          
        }
      } else {
        callback(null, value.tokenName)
      }
    })
  }
  getSourceCode(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        if(err.type='NotFoundError'){
          callback(null, null)
        } else {
          callback(err, null)          
        }
      } else {
        callback(null, value.sourceCode)
      }
    })
  }
  getApprove(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        if(err.type='NotFoundError'){
          callback(null, null)
        } else {
          callback(err, null)          
        }
      } else {
        callback(null, value.approve)
      }
    })
  }

  getTokenInfo(contractAddress, callback) {
    dataHandlerUtil._getDB(this.smartContractDB, contractAddress, (err, value) => {
      if(err){
        if(err.type='NotFoundError'){
          callback(null, null)
        } else {
          callback(err, null)          
        }
      } else {
        callback(null, value)
      }
    })
  }

  updateWithBlock(block, callback){
    let promiseList = []
    block.Transactions.forEach((tx) => {
      promiseList.push(this._updateWithTx(tx))
    })

    Promise.all(promiseList).then((transactionsList) => {
      block.Transactions = transactionsList
      callback(null, block)
    }).catch((err) => {
      callback(err, null)
    })
  }

  _updateWithTx(tx){
    let self=this
    
  }
}

module.exports = SmartContractTxDB