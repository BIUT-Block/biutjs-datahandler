const mkdirp = require('mkdirp')
const path = require('path')
const Big = require('bignumber.js')
const Tree = require('merkle-patricia-tree')
const level = require('level')
const dataHandlerUtil = require('./util.js')

const DEC_NUM = 8
Big.config({ ROUNDING_MODE: 0 })
Big.set({ ROUNDING_MODE: Big.ROUND_DOWN })
let INIT_BALANCE = '0'
if (process.env.netType === 'test' || process.env.netType === 'develop') {
  INIT_BALANCE = '600000'
}

class AccTreeDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading accTree db')
    }

    this.root = config.StateRoot
    if (this.root !== undefined && (typeof this.root !== 'string' || this.root.length !== 64)) {
      throw new Error('Needs a valid state root input for creating or loading merkle tree')
    }

    this._initDB(config.DBPath)
    this.chainName = config.chainName
  }

  /**
   * Load or create databases
   */
  _initDB (dbPath = undefined) {
    if (dbPath !== undefined) {
      this.accTreeDBPath = path.join(dbPath, './accTree')
    }
    mkdirp.sync(this.accTreeDBPath)

    try {
      this.accTreeDB = level(this.accTreeDBPath)
      if (this.root === undefined) {
        this.tree = new Tree(this.accTreeDB)
      } else {
        this.tree = new Tree(this.accTreeDB, '0x' + this.root)
      }
    } catch (error) {
      // Could be invalid db path or invalid state root
      throw new Error(error)
    }
  }

  setAccDB (accDB) {
    this.accDB = accDB
  }

  constructNewTree (root = undefined) {
    if (root !== undefined && (typeof root !== 'string' || root.length !== 64)) {
      throw new Error('Needs a valid state root input to construct a new merkle tree')
    }
    if (root === undefined) {
      this.tree = new Tree(this.accTreeDB)
    } else {
      this.tree = new Tree(this.accTreeDB, '0x' + root)
    }
  }

  clearDB (callback) {
    dataHandlerUtil._clearDB(this.accTreeDB, this.accTreeDBPath, (err) => {
      if (err) return callback(err)
      else {
        this._initDB()
        callback()
      }
    })
  }

  getAllDB (callback) {
    dataHandlerUtil._getAllDataInDB(this.tree, (err, data) => {
      if (err) {
        callback(err, null)
      } else {
        Object.keys(data).forEach((key) => {
          data[key] = JSON.parse(data[key].toString())
        })
        callback(null, data)
      }
    })
  }

  getRoot () {
    return this.tree.root.toString('hex')
  }

  checkRoot (root, callback) {
    root = '0x' + root
    this.tree.checkRoot(root, callback)
  }

  getAccInfo (accAddress, tokenName, callback) {
    this.tree.get(accAddress, (err, value) => {
      if (err) return callback(err)
      try {
        if (value === null || value === undefined) {
          if (tokenName === 'All') {
            callback(null, [{ [this.chainName]: INIT_BALANCE }, '0', { From: [], To: [] }])
          } else {
            callback(null, [{ [this.chainName]: INIT_BALANCE, [tokenName]: INIT_BALANCE }, '0', { From: [], To: [] }])
          }
        } else {
          const valueJson = JSON.parse(value.toString()) || [{ [this.chainName]: INIT_BALANCE, [tokenName]: INIT_BALANCE }, '0', { From: [], To: [] }]
          if (typeof valueJson[0] === 'string') {
            valueJson[0] = {
              [this.chainName]: valueJson[0]
            }
          }
          if (!(this.chainName in valueJson[0])) {
            valueJson[0][this.chainName] = INIT_BALANCE
          }
          this.accDB.getAcc(accAddress, (err, accData) => {
            if (err) {
              valueJson.push({ From: [], To: [] })
              return callback(null, valueJson)
            } else {
              valueJson.push(accData)
              callback(null, valueJson)
            }
          })
        }
      } catch (e) {
        callback(e, null)
      }
    })
  }

  putAccInfo (accAddress, infoArray, callback) {
    // if (accAddress !== '0000000000000000000000000000000000000000') {
    if (typeof infoArray !== 'string') {
      infoArray = JSON.stringify(infoArray)
    }
    // console.log(infoArray)
    this.tree.put(accAddress, infoArray, callback)
    // } else {
    //   callback()
    // }
  }

  async updateWithBlockChain (blockchain) {
    await dataHandlerUtil._asyncForEach(blockchain, async (block) => {
      await this.updateWithBlock(block)
    })
  }

  _typeCheck (variable) {
    if (typeof variable !== 'string') return false
    if (isNaN(parseInt(variable))) return false
    return true
  }

  async updateWithBlock (block) {
    const txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._updateWithTx(tx)
    })
  }

  _updateWithTx (tx) {
    const self = this
    return new Promise(function (resolve, reject) {
      if (typeof tx !== 'object') {
        return reject(new Error('Invalid input type, should be object'))
      }
      if (tx.TxFrom === '' || tx.TxTo === '') {
        return resolve()
      }
      // update account tx.TxFrom
      self.getAccInfo(tx.TxFrom, tx.TokenName, (err, data1) => {
        let nonce = ''
        let balance = ''
        // let txInfo = {}
        if (err) {
          data1 = []
          data1[0] = {}
          data1[2] = { From: [], To: [] }
          balance = new Big(INIT_BALANCE)
          nonce = '1'
        } else {
          if (data1[0][tx.TokenName] === undefined) {
            console.error('undefined in accTreeDB found')
            balance = new Big(INIT_BALANCE)
          } else {
            balance = new Big(data1[0][tx.TokenName])
          }
          nonce = (parseInt(data1[1]) + 1).toString()
        }
        if (data1[2].From.indexOf(tx.TxHash) < 0) {
          balance = balance.minus(tx.Value).toFixed(DEC_NUM)
          balance = parseFloat(balance).toString()
          data1[0][tx.TokenName] = balance
          self.putAccInfo(tx.TxFrom, [data1[0], nonce], (err) => {
            if (err) {
              console.error(err)
              reject(err)
            } else {
              resolve()
            }
          })
        }
        self.getAccInfo(tx.TxTo, tx.TokenName, (err, data2) => {
          if (err) {
            data2 = []
            data2[0] = {}
            data2[2] = { From: [], To: [] }
            balance = new Big(INIT_BALANCE)
            nonce = '1'
          } else {
            if (data2[0][tx.TokenName] === undefined) {
              console.error('undefined in accTreeDB found')
              balance = new Big(INIT_BALANCE)
            } else {
              balance = new Big(data2[0][tx.TokenName])
            }
            nonce = (parseInt(data2[1]) + 1).toString()
          }
          if (data2[2].To.indexOf(tx.TxHash) < 0) {
            balance = balance.plus(tx.Value).toFixed(DEC_NUM)
            balance = parseFloat(balance).toString()
            data2[0][tx.TokenName] = balance
            self.putAccInfo(tx.TxTo, [data2[0], nonce], (err) => {
              if (err) {
                console.error(err)
                reject(err)
              } else {
                resolve()
              }
            })
          }
          self.accDB.writeTx(tx, (err) => {
            if (err) {
              console.error(err)
              reject(err)
            } else {
              resolve()
            }
          })
        })
      })
    })
  }

  async revertWithBlockChain (blockchain) {
    await dataHandlerUtil._asyncForEach(blockchain, async (block) => {
      await this.revertBlock(block)
    })
  }

  async revertBlock (block) {
    const txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._revertTx(tx)
    })
  }

  _revertTx (tx) {
    const self = this
    return new Promise(function (resolve, reject) {
      if (typeof tx !== 'object') {
        return reject(new Error('Invalid input type, should be object'))
      }
      self.getAccInfo(tx.TxFrom, tx.TokenName, (err, data1) => {
        let nonce = '1'
        let balance = new Big(INIT_BALANCE)
        if (err) {
          console.error(err)
          reject(err)
        } else {
          if (data1[2].From.indexOf(tx.TxHash) > -1) {
            if (data1[0][tx.TokenName] === undefined) {
              console.error('undefined in accTreeDB found')
              balance = new Big(INIT_BALANCE)
            } else {
              balance = new Big(data1[0][tx.TokenName])
            }
            nonce = (parseInt(data1[1]) - 1).toString()
            balance = balance.plus(tx.Value).toFixed(DEC_NUM)
            balance = parseFloat(balance).toString()
            data1[0][tx.TokenName] = balance
            self.putAccInfo(tx.TxFrom, [data1[0], nonce], (err) => {
              if (err) {
                console.error(err)
                reject(err)
              } else {
                resolve()
              }
            })
          } else {
            console.error(new Error(`Can not find TxHash ${tx.TxHash} in AccDB ${tx.TxFrom} From List`))
            reject(err)
          }
        }
        self.getAccInfo(tx.TxTo, tx.TokenName, (err, data2) => {
          let nonce = '1'
          let balance = new Big(INIT_BALANCE)
          // txInfo = {}
          if (err) {
            console.error(err)
            reject(err)
          } else {
            if (data1[2].To.indexOf(tx.TxHash) > -1) {
              if (data2[0][tx.TokenName] === undefined) {
                console.error('undefined in accTreeDB found')
                balance = new Big(INIT_BALANCE)
              } else {
                balance = new Big(data2[0][tx.TokenName])
              }
              nonce = (parseInt(data2[1]) - 1).toString()
              balance = balance.minus(tx.Value).toFixed(DEC_NUM)
              balance = parseFloat(balance).toString()
              data2[0][tx.TokenName] = balance
              self.putAccInfo(tx.TxTo, [data2[0], nonce], (err) => {
                if (err) {
                  console.error(err)
                  reject(err)
                } else {
                  resolve()
                }
              })
            } else {
              console.error(new Error(`Can not find TxHash ${tx.TxHash} in AccDB ${tx.TxFrom} To List`))
              reject(err)
            }
          }
          self.accDB.delTx(tx, (err) => {
            if (err) {
              console.error(err)
              reject(err)
            } else {
              resolve()
            }
          })
        })
      })
    })
  }
}

module.exports = AccTreeDB
