const AccTreeDB = require('../src/accTreeDB.js')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const testData = require('../db-structure/accTree.js').testData

const tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')

describe('Account Tree block chain database class test', () => {
  const config = {
    'DBPath': '../data/'
  }
  const accTree = new AccTreeDB(config)

  it('Clear DB test', (done) => {
    let address = '28f6af3bf89b7de2b5177f7747650d7321027055'
    let data = [1.2, 0]
    let root1 = accTree.getRoot()
    accTree.putAccInfo(address, data, (err) => {
      if (err) {
        expect.fail()
      } else {
        let root2 = accTree.getRoot()
        expect(root1).to.not.equal(root2)
        accTree.getAccInfo(address, (err, value) => {
          if (err) {
            expect.fail()
          } else {
            expect(value).to.deep.equal(data)
            accTree.clearDB((err) => {
              if (err) {
                expect.fail()
              } else {
                let root3 = accTree.getRoot()
                expect(root1).to.equal(root3)
                done()
              }
            })
          }
        })
      }
    })
  })

  it('Check if the merkle tree has the same root if data is written in different orders', (done) => {
    let index = 0
    let length = Object.keys(testData).length
    // Object.keys(testData).reverse().forEach((address) => {
    Object.keys(testData).forEach((address) => {
      accTree.putAccInfo(address, testData[address], (err) => {
        if (err) {
          expect.fail()
        } else {
          if (index + 1 === length) {
            accTree.clearDB((err) => {
              if (err) {
                expect.fail()
              } else {
                done()
              }
            })
          }
          index++
        }
      })
    })
  })

  it('_updateWithTx functionality test', (done) => {
    let txs = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2].Transactions
    accTree._updateWithTx(txs[0]).then(() => {
      accTree.getAllDB((err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal({ '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju': ['999.216', '2'] })
          done()
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })

  it('updateWithBlock functionality test', (done) => {
    accTree.clearDB((err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        let block = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[0]
        accTree.updateWithBlock(block).then(() => {
          block = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[1]
          accTree.updateWithBlock(block).then(() => {
            block = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2]
            accTree.updateWithBlock(block).then(() => {
              accTree.getRoots((err, array) => {
                if (err) {
                  console.log(err)
                  expect.fail()
                } else {
                  expect(array).to.deep.equal(['56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
                                               '8d73fae6d4a00f14319d7f4661f89b8d51956c26c8b91784e95fb084640d1f0a',
                                               '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5'])
                  done()
                }
              })
            }).catch((err) => {
              console.log(err)
              expect.fail()
            })
          }).catch((err) => {
            console.log(err)
            expect.fail()
          })
        }).catch((err) => {
          console.log(err)
          expect.fail()
        })
      }
    })
  })

  it('updateWithBlockChain functionality test', (done) => {
    accTree.clearDB((err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        let blockchain = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
        accTree.updateWithBlockChain(blockchain).then(() => {
          accTree.getRoots((err, array) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              expect(array).to.deep.equal([ '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
                                            '8d73fae6d4a00f14319d7f4661f89b8d51956c26c8b91784e95fb084640d1f0a',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5',
                                            '0357ab93477913855aa1133db8b92e430a1e3a5c5ab799eea9a1cea66f845bf5' ])
              done()
            }
          })
        }).catch((err) => {
          console.log(err)
          expect.fail()
        })
      }
    })
  })

  it('revertBlock functionality test', (done) => {
    let block = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2]
    accTree.revertBlock(block).then(() => {
      accTree.getAllDB((err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal({ '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju': ['999.626', '2'] })
          accTree.clearDB((err) => {
            if (err) {
              expect.fail()
            } else {
              done()
            }
          })
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })

  it('_updateRoots functionality test', (done) => {
    accTree._updateRoots(0, 'test').then(() => {
      accTree.getRoots((err, rootArray) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(rootArray).to.deep.equal(['test'])
          accTree._clearRoots((err) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              accTree.getRoots((err, array) => {
                if (err) {
                  console.log(err)
                  expect.fail()
                } else {
                  expect(array).to.deep.equal([])
                  done()
                }
              })
            }
          })
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })
})
