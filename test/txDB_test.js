const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const TxBlockChainDB = require('../src/txBlockChainDB')
const dataHandlerUtil = require('../src/util.js')

describe('Transaction block chain database class test', () => {
  let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')
  const config = {
    'DBPath': '../data/',
    'ID': '12345'
  }
  const biutDataTest = new TxBlockChainDB(config)

  describe('writeTxBlockToDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          dataHandlerUtil._getJsonDB(biutDataTest.txBlockChainDB, 1, function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value.TimeStamp).to.equal(1530297318)
            }
          })
          dataHandlerUtil._getJsonDB(biutDataTest.txBlockChainDB, '85aec575af965c0f6daa3179152be5f37977968882a6f48f952fca790305265f', function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal(1)
            }
            done()
          })
        }
      })
    })
  })

  describe('isTxBlockChainDBEmpty() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          biutDataTest.isTxBlockChainDBEmpty((err, emptyFlag) => {
            if (err) {
              expect.fail()
            } else {
              expect(emptyFlag).to.be.false
            }
            done()
          })
        }
      })
    })
  })

  describe('getTxBlockChainDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          biutDataTest.getTxBlockChainDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(13)
            }
            done()
          })
        }
      })
    })
  })

  describe('getTxBlockFromDB() function test', () => {
    it('functionality correctness test', (done) => {
      const txBlockHashArray = [
        '04c7123071429bbfcfb6ffd22501bdcc575f8df820041d63d8c16b94a9696ecf',
        '85aec575af965c0f6daa3179152be5f37977968882a6f48f952fca790305265f'
      ]

      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          biutDataTest.getTxBlockFromDB(txBlockHashArray, (err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(value.length).to.equal(2)
            }
            done()
          })
        }
      })
    })
  })

  describe('getTxChain() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          biutDataTest.getTxChain(0, 3, (err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(value.length).to.equal(4)
            }
            done()
          })
        }
      })
    })
  })

  describe('delBlocksFromHeight() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      biutDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          biutDataTest.delBlocksFromHeight(6, (err) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              biutDataTest.getTxBlockChainDB((err, value) => {
                if (err) {
                  expect.fail()
                } else {
                  expect(Object.keys(value).length).to.equal(6)
                }
                done()
              })
            }
          })
        }
      })
    })
  })

  describe('addUpdateBlock() function test', () => {
    it('functionality correctness test', (done) => {
      let json = { Number: 1, Hash: '04c7123071429bbfcfb6ffd22501bdcc575f8df820041d63d8c16b94a9696ecf' }
      let pos = 2
      let blockArray = [json, json, json]
      biutDataTest.addUpdateBlock(pos, blockArray, (err) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          biutDataTest.getTxBlockChainDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(6)
            }
            done()
          })
        }
      })
    })
  })

  describe('findTxForUser() function test', () => {
    it('functionality correctness test', (done) => {
      let userAddress = '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju'
      biutDataTest.findTxForUser(userAddress, (err, txArray) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          console.log(txArray)
          expect(txArray.length).to.equal(1)
          done()
        }
      })
    })
  })
})
