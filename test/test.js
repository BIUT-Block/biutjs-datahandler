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
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (value) {
            expect(value).to.equal('1530297318')
          })
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Parent_Hash'), function (value) {
            expect(value).to.equal('d30e75b804fa4ca0b10a5556ef96a51f968509efb3a3edfdd2f478bc8656aa6d')
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
          secData._getDB(secData.txBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (value) {
            expect(value).to.equal('1530297318')
          })
          secData._getDB(secData.txBlockChainDB, secData._combineStrings(2, 'Parent_Hash'), function (value) {
            expect(value).to.equal('85aec575af965c0f6daa3179152be5f37977968882a6f48f952fca790305265f')
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
            expect(output).to.have.any.keys('415a66de24c5396d3a4cefb90caafd984a6212b0b1e919b15c728df608c6b0cf')
            expect(output).to.have.any.keys('c538faf86e45519070bb199ccb68ad567e64118509129701a0e2087175b78c6a')
            expect(output).to.have.any.keys('6913ceef69c42d178f7e42aa7249208c7d3969e03f292127dbb3ed4d67fd2313')
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
