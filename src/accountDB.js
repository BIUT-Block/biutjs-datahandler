const mkdirp = require('mkdirp')
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

    mkdirp.sync(config.DBPath + '/account')

    let accDBPath = path.join(config.DBPath, './account')
    this._initDB(accDBPath)
  }

  /**
   * Load or create databases
   */
  _initDB (accDBPath) {
    try {
      this.accountDB = level(accDBPath)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  /**
   * Write user account information to account database
   * @param  {Array | Object} accDataList - single user account info(json object) or a list of user account info
   * @param  {Function} callback - callback function, returns error if exist
   * @return {None}
   */
  writeUserInfoToAccountDB (accDataList, callback) {
    let self = this
    let accPromiseList = []

    if (!Array.isArray(accDataList)) {
      accDataList = [accDataList]
    }

    let key = ''
    accDataList.forEach(function (accData) {
      if (typeof accData.account !== 'undefined') {
        key = dataHandlerUtil._combineStrings('accName', accData.account)
        accPromiseList.push(dataHandlerUtil._putJsonDBPromise(self.accountDB, key, accData))
      } else {
        callback(new Error('invalid input, user account address cannot be found'))
      }
    })

    Promise.all(accPromiseList).then(function () {
      callback()
    }).catch(function (err) {
      callback(err)
    })
  }

  /**
   * Read user account information from account database, returns a promise object
   * @param  {Array | String} accNameList - single user account address(string) or a list of user account addresses
   * @return {Promise Object} - promise object
   */
  async readUserInfofromAccountDB (accNameList) {
    let self = this

    if (!Array.isArray(accNameList)) {
      accNameList = [accNameList]
    }

    let key = ''
    let buffer = []
    await dataHandlerUtil._asyncForEach(accNameList, async (accName) => {
      key = dataHandlerUtil._combineStrings('accName', accName)
      let data = await dataHandlerUtil._getJsonDBPromise(self.accountDB, key)
      if (data[0] !== null) {
        throw data[0]
      } else {
        buffer.push(data[1])
      }
    })

    return buffer
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

  /**
   * Check whether an account is in AccountDB
   * @param  {String} accName - account name
   * @param  {Function} callback - callback function, callback arguments (err, block object array)
   * @return {None}
   */
  isAccountInAccountDB (accName, callback) {
    let key = dataHandlerUtil._combineStrings('accName', accName)
    dataHandlerUtil._getJsonDB(this.accountDB, key, (err, value) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, value)
      }
    })
  }
}

module.exports = AccountDB
