const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const TxBlockChainDB = require('../src/txBlockChainDB')
const dataHandlerUtil = require('../src/util.js')

describe('Transaction block chain database class test', () => {
  let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')
  const config = {
    'DBPath': '../data/'
  }
  const secDataTest = new TxBlockChainDB(config)

  describe('writeTxBlockToDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          dataHandlerUtil._getJsonDB(secDataTest.txBlockChainDB, 1, function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value.TimeStamp).to.equal(1530297318)
            }
          })
          dataHandlerUtil._getJsonDB(secDataTest.txBlockChainDB, '85aec575af965c0f6daa3179152be5f37977968882a6f48f952fca790305265f', function (err, value) {
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
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.isTxBlockChainDBEmpty((err, emptyFlag) => {
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
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getTxBlockChainDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(2)
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
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getTxBlockFromDB(txBlockHashArray, (err, value) => {
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
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getTxChain(0, 0, (err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(value.length).to.equal(1)
            }
            done()
          })
        }
      })
    })
  })
})
