const AccTreeDB = require('../src/accTreeDB.js')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const testData = require('../db-structure/accTree.js').testData

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
    let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
    let txs = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2].Transactions
    accTree._updateWithTx(txs[0]).then(() => {
      accTree.getAllDB((err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal({ '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju': ['9.216', '2'] })
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
        let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
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
                                               '2ee43c62ec80787e342c000eeb814c35d6743c6523a12aa842398ea501675470',
                                               '0ef00479d093945bb8b72036f08041642728ac14530ecd5f253e090d327dc369'])
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

  it('revertBlock functionality test', (done) => {
    let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
    let block = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2]
    accTree.revertBlock(block).then(() => {
      accTree.getAllDB((err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal({ '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju': ['9.626', '2'] })
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
