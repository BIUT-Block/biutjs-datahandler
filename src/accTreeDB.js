const mkdirp = require('mkdirp')
const path = require('path')
const Tree = require('merkle-patricia-tree')
const level = require('level')

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
      let accTreeDB = level(accTreeDBPath)
      this.tree = new Tree(accTreeDB)
    } catch (error) {
      // Could be invalid db path
      throw new Error(error)
    }
  }

  getRoot () {
    return this.tree.root
  }

  getAccInfo (accAddress, callback) {
    this.tree.get(accAddress, callback)
  }

  getRawAccInfo (accAddress, callback) {
    this.tree.getRaw(accAddress, callback)
  }

  putAccInfo (accAddress, infoArray, callback) {
    this.tree.put(accAddress, infoArray, callback)
  }

  putRawAccInfo (accAddress, infoArray, callback) {
    this.tree.putRaw(accAddress, infoArray, callback)
  }

  delRawAccInfo (accAddress, callback) {
    this.tree.delRaw(accAddress, callback)
  }

  delAccInfo (accAddress, callback) {
    this.tree.del(accAddress, callback)
  }
}

module.exports = AccTreeDB
