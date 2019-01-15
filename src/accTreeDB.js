const mkdirp = require('mkdirp')
const path = require('path')
const Big = require('big.js')
const Tree = require('merkle-patricia-tree')
const level = require('level')
const dataHandlerUtil = require('./util.js')

const DEC_NUM = 8
const INIT_BALANCE = '10'

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
    dataHandlerUtil._clearDB(this.tree, (err) => {
      if (err) {
        callback(err)
      } else {
        this._clearRoots(callback)
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

  getRoots (callback) {
    this.accTreeDB.get('Roots', (err, value) => {
      if (err) {
        callback(null, [])
      } else {
        if (!Array.isArray(value)) {
          value = [value]
        }
        callback(null, value)
      }
    })
  }

  _updateRoots (blockNum, newRoot) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.getRoots((err, roots) => {
        if (err) {
          reject(err)
        } else {
          if (blockNum > roots.length) {
            return reject(new Error(`blockNumber ${blockNum} exceeds the length of roots array (${roots.length})`), null)
          }
          roots[blockNum] = newRoot
          self.accTreeDB.put('Roots', roots, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }
      })
    })
  }

  _removeRoots (blockNum) {
    let self = this
    return new Promise(function (resolve, reject) {
      self.getRoots((err, roots) => {
        if (err) {
          reject(err)
        } else {
          if (blockNum > roots.length) {
            return reject(new Error(`blockNumber ${blockNum} exceeds the length of roots array (${roots.length})`), null)
          }
          roots[blockNum] = undefined
          self.accTreeDB.put('Roots', roots, (err) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        }
      })
    })
  }

  _clearRoots (callback) {
    dataHandlerUtil._clearDB(this.accTreeDB, callback)
  }

  getAccInfo (accAddress, callback) {
    this.tree.get(accAddress, (err, value) => {
      try {
        callback(err, JSON.parse(value.toString()))
      } catch (err) {
        callback(err, null)
      }
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

  async updateWithBlock (block) {
    let txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._updateWithTx(tx)
      await this._updateRoots(block.Number, this.getRoot())
    })
  }

  _updateWithTx (tx) {
    let self = this
    return new Promise(function (resolve, reject) {
      if (typeof tx !== 'object') {
        reject(new Error('Invalid input type, should be object'))
      }

      // update account tx.TxFrom
      self.getAccInfo(tx.TxFrom, (err, data1) => {
        let nonce = ''
        let balance = ''
        if (err) {
          nonce = '1'
          balance = new Big(INIT_BALANCE)
        } else {
          nonce = (parseInt(data1[1]) + 1).toString()
          balance = new Big(data1[0])
        }
        balance = balance.minus(tx.Value).minus(tx.TxFee).toFixed(DEC_NUM)
        balance = parseFloat(balance).toString()
        self.putAccInfo(tx.TxFrom, [balance, nonce], (err) => {
          if (err) {
            reject(err)
          } else {
            // update account tx.TxTo
            self.getAccInfo(tx.TxTo, (err, data2) => {
              if (err) {
                nonce = '1'
                balance = new Big(INIT_BALANCE)
              } else {
                nonce = (parseInt(data2[1]) + 1).toString()
                balance = new Big(data2[0])
              }
              balance = balance.plus(tx.Value).toFixed(DEC_NUM)
              balance = parseFloat(balance).toString()
              self.putAccInfo(tx.TxTo, [balance, nonce], (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            })
          }
        })
      })
    })
  }

  async revertBlock (block) {
    let txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._revertTx(tx)
      // await this._removeRoots(block.Number)
    })
  }

  _revertTx (tx) {
    let self = this
    return new Promise(function (resolve, reject) {
      if (typeof tx !== 'object') {
        reject(new Error('Invalid input type, should be object'))
      }

      // update account tx.TxFrom
      self.getAccInfo(tx.TxFrom, (err, data1) => {
        let nonce = ''
        let balance = ''
        if (err) {
          reject(err)
        } else {
          nonce = (parseInt(data1[1]) - 1).toString()
          balance = new Big(data1[0])
        }
        balance = balance.plus(tx.Value).plus(tx.TxFee).toFixed(DEC_NUM)
        balance = parseFloat(balance).toString()
        self.putAccInfo(tx.TxFrom, [balance, nonce], (err) => {
          if (err) {
            reject(err)
          } else {
            // update account tx.TxTo
            self.getAccInfo(tx.TxTo, (err, data2) => {
              if (err) {
                reject(err)
              } else {
                nonce = (parseInt(data2[1]) - 1).toString()
                balance = new Big(data2[0])
              }
              balance = balance.minus(tx.Value).toFixed(DEC_NUM)
              balance = parseFloat(balance).toString()
              self.putAccInfo(tx.TxTo, [balance, nonce], (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            })
          }
        })
      })
    })
  }
}

module.exports = AccTreeDB
