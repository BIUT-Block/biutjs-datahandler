const level = require('level')

class SECDataHandler {
  constructor (config) {
    this.DBPath = config.DBPath
    this.userDBPath = config.DBPath + '/user/'
    this.productDBPath = config.DBPath + '/product/'
    this.txBlockChainDBPath = config.DBPath + '/txBlockChain/'
    this.tokenBlockChainDBPath = config.DBPath + '/tokenBlockChain/'
    
    this._createLoadDB()
  }
  
   _createLoadDB () {
    this.userDB = level(this.userDBPath)
    this.productDB = level(this.productDBPath)
    this.txBlockChainDB = level(this.txBlockChainDBPath)
    this.tokenBlockChainDB = level(this.tokenBlockChainDBPath)
  }
  
  writeTokenChainJsonToDB (jsonFile) {
    let self = this

    if (this._jsonTypeCheck(jsonFile)) {
      let tokenChain = JSON.parse(jsonFile)
    }

    Object.keys(tokenChain).foreach(function (blockHeight) {
      self._putDB(self.tokenBlockChainDB, blockHeight, tokenChain[blockHeight])
      self.writeTokenChainBlockJsonToDB(tokenChain[blockHeight])
    })
    
  }
  
  writeTokenChainBlockJsonToDB () {
    
  }
  
  // writeTxChainJsonToDB () {}
  // writeTxChainBlockJsonToDB () {}
  
  getUserPreviousTx (address) {
    
  }

  _putDB (DB, key, value) {
    DB.put(key, value, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _getDB (DB, key) {
    DB.get(key, function (err, value) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log(key + '=' + value)
    })
  }

  _delDB (DB, key) {
    DB.del(key, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
    })
  }

  _batchArrayDB (DB, array) {
    DB.batch(array, function (err) {
      if (err) {
        return console.log('Ooops!', err)
      }
      console.log('Great success dear leader!')
    })
  }
  
  _jsonTypeCheck (json_file) {
    try {
      JSON.parse(json_file)
    } catch (e) {
      throw new TypeError('Invalid json file')
    }

    return true
  }
}

module.exports = SECDataHandler
