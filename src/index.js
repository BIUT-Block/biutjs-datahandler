const level = require('level')

class SECDataHandler {
  constructor (config) {
    this.path_db = config.path
    this._createLoadDB()
  }

  _createLoadDB () {
    this.db = level(this.path_db)
  }

  _putDB (key, value) {
    this.db.put(key, value, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _getDB (key) {
    this.db.get(key, function (err, value) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log(key + '=' + value)
    })
  }

  _delDB (key) {
    this.db.del(key, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _batchArrayDB (array) {
    this.db.batch(array, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log('Great success dear leader!')
    })
  }
}

module.exports = SECDataHandler
