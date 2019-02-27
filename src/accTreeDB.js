const mkdirp = require('mkdirp')
const path = require('path')
const Big = require('big.js')
const Tree = require('merkle-patricia-tree')
const level = require('level')
const dataHandlerUtil = require('./util.js')

const DEC_NUM = 8
const INIT_BALANCE = '1000'

class AccTreeDB {
  /**
   * @param  {Object} config - contains the relative path for storing database
   */
  constructor (config) {
    if (typeof config.DBPath !== 'string' || config.DBPath === '') {
      throw new Error('Needs a valid config input for creating or loading accTree db')
    }

    let root = config.StateRoot
    if (root !== undefined && (typeof root !== 'string' || root.length !== 64)) {
      throw new Error('Needs a valid state root input for creating or loading merkle tree')
    }

    mkdirp.sync(config.DBPath + '/accTree')

    let accTreeDBPath = path.join(config.DBPath, './accTree')

    this._initDB(accTreeDBPath, root)
  }

  /**
   * Load or create databases
   */
  _initDB (accTreeDBPath, stateRoot) {
    try {
      this.accTreeDB = level(accTreeDBPath)
      if (stateRoot === undefined) {
        this.tree = new Tree(this.accTreeDB)
      } else {
        this.tree = new Tree(this.accTreeDB, '0x' + stateRoot)
      }
    } catch (error) {
      // Could be invalid db path or invalid state root
      throw new Error(error)
    }
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
        if (typeof value === 'string') {
          value = value.split(',')
        }
        if (!Array.isArray(value)) {
          value = [value]
        }
        callback(null, value)
      }
    })
  }

  checkRoot (root, callback) {
    root = '0x' + root
    this.tree.checkRoot(root, callback)
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
        if (value !== null) {
          callback(err, JSON.parse(value.toString()))
        } else {
          callback(INIT_BALANCE, [null, '0', { 'From': [] }, { 'To': [] }])
        }
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

  async updateWithBlockChain (blockchain) {
    await dataHandlerUtil._asyncForEach(blockchain, async (block) => {
      await this.updateWithBlock(block)
    })
  }

  async updateWithBlock (block) {
    // parse block.Transactions
    block.Transactions.forEach((tx, index) => {
      if (typeof tx === 'string') {
        block.Transactions[index] = JSON.parse(tx)
      }
    })

    let txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._updateWithTx(tx)
    })
    await this._updateRoots(block.Number, this.getRoot())
  }

  _updateWithTx (tx) {
    let self = this
    return new Promise(function (resolve, reject) {
      if (typeof tx !== 'object') {
        return reject(new Error('Invalid input type, should be object'))
      }

      // update account tx.TxFrom
      self.getAccInfo(tx.TxFrom, (err, data1) => {
        let nonce = ''
        let balance = ''
        let txInfo = {}
        if (err) {
          balance = new Big(INIT_BALANCE)
          nonce = '1'
          txInfo = { From: [tx.TxHash], To: [] }
        } else {
          balance = new Big(data1[0])
          nonce = (parseInt(data1[1]) + 1).toString()

          txInfo = data1[2]
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo)
          }
          if (txInfo.From.indexOf(tx.TxHash) < 0) {
            txInfo.From.push(tx.TxHash)
          }
        }
        balance = balance.minus(tx.Value).minus(tx.TxFee).toFixed(DEC_NUM)
        balance = parseFloat(balance).toString()
        self.putAccInfo(tx.TxFrom, [balance, nonce, txInfo], (err) => {
          if (err) {
            reject(err)
          } else {
            // update account tx.TxTo
            self.getAccInfo(tx.TxTo, (err, data2) => {
              if (err) {
                balance = new Big(INIT_BALANCE)
                nonce = '1'
                txInfo = { From: [], To: [tx.TxHash] }
              } else {
                balance = new Big(data2[0])
                nonce = (parseInt(data2[1]) + 1).toString()
                txInfo = data2[2]
                if (typeof txInfo === 'string') {
                  txInfo = JSON.parse(txInfo)
                }
                if (txInfo.To.indexOf(tx.TxHash) < 0) {
                  txInfo.To.push(tx.TxHash)
                }
              }
              balance = balance.plus(tx.Value).toFixed(DEC_NUM)
              balance = parseFloat(balance).toString()
              self.putAccInfo(tx.TxTo, [balance, nonce, txInfo], (err) => {
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

  async revertWithBlockChain (blockchain) {
    await dataHandlerUtil._asyncForEach(blockchain, async (block) => {
      await this.revertBlock(block)
    })
  }

  async revertBlock (block) {
    let txs = block.Transactions
    await dataHandlerUtil._asyncForEach(txs, async (tx) => {
      await this._revertTx(tx)
    })
    await this._removeRoots(block.Number)
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
        let txInfo = {}
        if (err) {
          resolve()
        } else {
          balance = new Big(data1[0])
          nonce = (parseInt(data1[1]) - 1).toString()

          txInfo = data1[2]
          if (typeof txInfo === 'string') {
            txInfo = JSON.parse(txInfo)
          }
          if (txInfo.From.indexOf(tx.TxHash) > -1) {
            txInfo.From = txInfo.From.filter((hash) => {
              return hash !== tx.TxHash
            })
          }
          balance = balance.plus(tx.Value).plus(tx.TxFee).toFixed(DEC_NUM)
          balance = parseFloat(balance).toString()
        }
        self.putAccInfo(tx.TxFrom, [balance, nonce, txInfo], (err) => {
          if (err) {
            reject(err)
          } else {
            // update account tx.TxTo
            self.getAccInfo(tx.TxTo, (err, data2) => {
              nonce = ''
              balance = ''
              txInfo = {}

              if (err) {
                resolve()
              } else {
                balance = new Big(data2[0])
                nonce = (parseInt(data2[1]) - 1).toString()

                txInfo = data2[2]
                if (typeof txInfo === 'string') {
                  txInfo = JSON.parse(txInfo)
                }
                if (txInfo.To.indexOf(tx.TxHash) > -1) {
                  txInfo.To = txInfo.To.filter((hash) => {
                    return hash !== tx.TxHash
                  })
                }
                balance = balance.minus(tx.Value).toFixed(DEC_NUM)
                balance = parseFloat(balance).toString()
              }
              self.putAccInfo(tx.TxTo, [balance, nonce, txInfo], (err) => {
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
