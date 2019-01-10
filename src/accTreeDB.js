const mkdirp = require('mkdirp')
const path = require('path')
const Tree = require('merkle-patricia-tree')
const level = require('level')
const dataHandlerUtil = require('./util.js')

class AccTreeDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading accTree db')
    }

    mkdirp.sync(config.DBPath + '/accTree')

    let accTreeDBPath = path.join(config.DBPath, './accTree')
    this._initDB(accTreeDBPath)
  }

  /**
   * Load or create databases
   */
  _initDB (accTreeDBPath) {
    try {
      this.accTreeDB = level(accTreeDBPath)
      this.tree = new Tree(this.accTreeDB)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.tree, callback)
  }

  getRoot () {
    return this.tree.root.toString('hex')
  }

  getAccInfo (accAddress, callback) {
    this.tree.get(accAddress, (err, value) => {
      callback(err, JSON.parse(value.toString()))
    })
  }

  putAccInfo (accAddress, infoArray, callback) {
    if (typeof infoArray !== 'string') {
      infoArray = JSON.stringify(infoArray)
    }
    this.tree.put(accAddress, infoArray, callback)
  }

  delAccInfo (accAddress, callback) {
    this.tree.del(accAddress, callback)
  }
}

module.exports = AccTreeDB
