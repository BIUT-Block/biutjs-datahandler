const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')
const rimraf = require('rimraf')

describe('SecjsDataHandler', () => {
  let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
  let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')
  const config = {
    'DBPath': '../data/'
  }
  const secData = new SecjsDataHandler(config)

  describe('writeTokenChainToDB() function test', () => {
    rimraf('../data/', function (err) {
      if (err) {
        expect.fail()
      }
    })

    it('functionality correctness test', (done) => {
      secData.writeTokenChainToDB(fs.readFileSync(tokenJsonPath, 'utf8'), function (err) {
        if (err) {
          expect.fail()
        } else {
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal('1530297318')
            }
          })
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Parent_Hash'), function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal('d30e75b804fa4ca0b10a5556ef96a51f968509efb3a3edfdd2f478bc8656aa6d')
            }
          })
        }
        done()
      })
    })

    it('invalid input jsonfile test', () => {
      expect(() => { secData.writeTokenChainToDB('1, 2, 3') }).to.throw('Invalid imported block chain file')
      expect(() => { secData.writeTokenChainToDB([1, 2, 3]) }).to.throw('Invalid imported block chain file')
    })
  })

  describe('writeTxChainToDB() function test', () => {
    rimraf('../data/', function (err) {
      if (err) {
        expect.fail()
      }
    })

    it('functionality correctness test', (done) => {
      secData.writeTxChainToDB(fs.readFileSync(txJsonPath, 'utf8'), function (err) {
        if (err) {
          expect.fail()
        } else {
          secData._getDB(secData.txBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal('1530297318')
            }
          })
          secData._getDB(secData.txBlockChainDB, secData._combineStrings(2, 'Parent_Hash'), function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal('85aec575af965c0f6daa3179152be5f37977968882a6f48f952fca790305265f')
            }
          })
        }
        done()
      })
    })

    it('invalid input jsonfile test', () => {
      expect(() => { secData.writeTxChainToDB('1, 2, 3') }).to.throw('Invalid imported block chain file')
      expect(() => { secData.writeTxChainToDB([1, 2, 3]) }).to.throw('Invalid imported block chain file')
    })
  })

  describe('getAccountTx() function test', () => {
    rimraf('../data/', function (err) {
      if (err) {
        expect.fail()
      }
    })

    it('functionality correctness test', (done) => {
      secData.writeTokenChainToDB(fs.readFileSync(tokenJsonPath, 'utf8'), function (err) {
        if (err) {
          expect.fail()
        } else {
          secData.getAccountTx('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', function (output) {
            expect(output).to.have.any.keys('401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d')
            expect(output).to.have.any.keys('8e10bfb36a8b6b2c81a17d8818863eeabab315baca38adb1b4f029bfe56f9374')
            expect(output).to.have.any.keys('511570b94bcf98061265974f74b29fbe5e179c47fc22b1eb7505901fe97f8c3f')
            expect(output).to.have.any.keys('adc1464538bb2ecbba627692d58db9958b76ed8bfdbc5b52d644596e9e3c3eec')
            done()
          })
        }
      })
    })

    it('invalid input address test', () => {
      expect(() => { secData.getAccountTx('123') }).to.throw('Invalid account address')
      expect(() => { secData.getAccountTx('1, 2, 3') }).to.throw('Invalid account address')
      expect(() => { secData.getAccountTx([1, 2, 3]) }).to.throw('Invalid account address')
      expect(() => { secData.getAccountTx({'a': 1, 'b': 2}) }).to.throw('Invalid account address')
    })
  })
})
