const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')
const rimraf = require('rimraf')

describe('SecjsDataHandler', () => {
  let jsonPath = path.join(__dirname, './blockchain.json')
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

    it('functionality correctness test', () => {
      secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
        if (err) {
          expect.fail()
        } else {
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (value) {
            expect(value).to.equal('1529288258')
          })
          secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Parent_Hash'), function (value) {
            expect(value).to.equal('13765ba66cf8997b5fc65167eb50b3e323f6df35c53762696e797535c1abc7e3')
          })
        }
      })
    })

    it('invalid input jsonfile test', () => {
      expect(() => { secData.writeTokenChainToDB('1, 2, 3') }).to.throw('Invalid json file')
      expect(() => { secData.writeTokenChainToDB([1, 2, 3]) }).to.throw('Invalid json file')
    })
  })

  describe('getAccountTx() function test', () => {
    rimraf('../data/', function (err) {
      if (err) {
        expect.fail()
      }
    })

    it('functionality correctness test', () => {
      secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
        if (err) {
          expect.fail()
        } else {
          secData.getAccountTx('1H1qVxChYmjnNxCTmK2JwHcaA2zwUn6XSi', function (output) {
            expect(output).to.have.any.keys('b02e70fabaebe94f1ba63dc522dc9fa131b9ee482262f2f5df3ebecc8148dacd')
            expect(output).to.have.any.keys('d1f94b5dd3f349d9e1e62c426f1afa832b3ac0535012e092189a557dd4fea033')
            expect(output).to.have.any.keys('0ee60812875c62888714a19bfe1eb065b720fb639ff637f1e97509fa85b6784c')
            expect(output).to.have.any.keys('218d52ad040d1dc2b25950b2f88243f55438f977ca03f0415a7167e6d01db95d')
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
