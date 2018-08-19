const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const ProductDB = require('../src/productDB')
const dataHandlerUtil = require('../src/util.js')

describe('Transaction block chain database class test', () => {
  let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')
  const config = {
    'DBPath': '../data/'
  }
  const secDataTest = new ProductDB(config)

  const transaction = {
    TxHash: 'e973165029e704633de63a7fd615c574dbbedbd3de0a4e3f3c411f1b8898f766',
    ProductInfo: {
      Name: 'Test Product'
    }
  }
  const key = dataHandlerUtil._combineStrings('Name', transaction.ProductInfo.Name, transaction.TxHash)

  describe('writeTxBlockToDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          dataHandlerUtil._getDB(secDataTest.productDB, key, function (err, value) {
            if (err) {
              expect.fail()
            } else {
              expect(value).to.equal('1')
            }
            done()
          })
        }
      })
    })
  })

  describe('isProductDBEmpty() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.isProductDBEmpty((err, emptyFlag) => {
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

  describe('getProductDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.writeTxBlockToDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getProductDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(1)
            }
            done()
          })
        }
      })
    })
  })
})
