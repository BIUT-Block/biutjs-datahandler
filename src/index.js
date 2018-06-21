const level = require('level')


class SECDataHandler {
  
  constructor (config) {
    this.path_db = config.path
    this.create_load_db()
  }
  
  _create_load_db () {
    this.db = level( this.path_db )
  }
  
  _put_db (key, value) {
    this.db.put(key, value, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }
  
  _get_db (key) {
    this.db.get(key, function (err, value) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log(key + '=' + value)
    })
  }
  
  _del_db (key) {
    this.db.del(key, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }
  
  _array_batch_db (array) {
    this.db.batch(array, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log('Great success dear leader!')
    })
  }

}

module.exports = SECDataHandler