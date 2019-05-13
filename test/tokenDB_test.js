const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const TokenBlockChainDB = require('../src/tokenBlockChainDB')
const dataHandlerUtil = require('../src/util.js')

describe('Token block chain database class test', () => {
  let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
  const config = {
    'DBPath': '../data/'
  }
  const secDataTest = new TokenBlockChainDB(config)

  describe('writeTokenBlockToDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          dataHandlerUtil._getJsonDB(secDataTest.tokenBlockChainDB, 1, function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value.TimeStamp).to.equal(1530297318)
            }
          })
          dataHandlerUtil._getJsonDB(secDataTest.tokenBlockChainDB, 'd30e75b804fa4ca0b10a5556ef96a51f968509efb3a3edfdd2f478bc8656aa6d', function (err, value) {
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

  describe('isTokenBlockChainDBEmpty() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.isTokenBlockChainDBEmpty((err, emptyFlag) => {
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

  describe('getTokenBlockChainDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getTokenBlockChainDB((err, value) => {
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

  describe('getTokenBlockFromDB() function test', () => {
    it('functionality correctness test', (done) => {
      const tokenBlockHashArray = [
        '5f213ac06cfe4a82e167aa3ea430e520be99dcedb4ab47fd8f668448708e34c1',
        'd30e75b804fa4ca0b10a5556ef96a51f968509efb3a3edfdd2f478bc8656aa6d'
      ]

      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getTokenBlockFromDB(tokenBlockHashArray, (err, value) => {
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

  describe('getTokenChain() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          secDataTest.getTokenChain(1, 2, (err, value) => {
            if (err) {
              console.log(err)
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

  describe('delBlocksFromHeight() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.writeTokenBlockToDB(data, function (err) {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          secDataTest.delBlocksFromHeight(6, (err) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              secDataTest.getTokenBlockChainDB((err, value) => {
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
      let pos = 4
      let blockArray = [json, json, json]
      secDataTest.addUpdateBlock(pos, blockArray, (err) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          secDataTest.getTokenBlockChainDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(7)
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
      secDataTest.findTxForUser(userAddress, (err, txArray) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(txArray.length).to.equal(5)
          done()
        }
      })
    })
  })

  describe('findTx() function test', () => {
    it('functionality correctness test', (done) => {
      let TxHash = '8e10bfb36a8b6b2c81a17d8818863eeabab315baca38adb1b4f029bfe56f9374'
      secDataTest.findTx(TxHash, (err, txArray) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(txArray.length).to.equal(1)
          done()
        }
      })
    })
  })

  describe('clearDB() function test', () => {
    it('functionality correctness test', (done) => {
      secDataTest.clearDB((err) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          secDataTest.getTokenBlockChainDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(0)
            }
            done()
          })
        }
      })
    })
  })
})
