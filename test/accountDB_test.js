const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const AccountDB = require('../src/accountDB')
const dataHandlerUtil = require('../src/util.js')

describe('Transaction block chain database class test', () => {
  let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
  let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')
  const config = {
    'DBPath': '../data/'
  }
  const secDataTest = new AccountDB(config)

  describe('updateAccountDBTokenChain() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
      secDataTest.updateAccountDBTokenChain(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          let key = dataHandlerUtil._combineStrings('token', '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', 'payer', '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d')
          dataHandlerUtil._getDB(secDataTest.accountDB, key, function (err, value) {
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

  describe('updateAccountDBTxChain() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.updateAccountDBTxChain(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          let key = dataHandlerUtil._combineStrings('tx', '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', 'payer', 'e973165029e704633de63a7fd615c574dbbedbd3de0a4e3f3c411f1b8898f766')
          dataHandlerUtil._getDB(secDataTest.accountDB, key, function (err, value) {
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

  describe('isAccountDBEmpty() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.updateAccountDBTxChain(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.isAccountDBEmpty((err, emptyFlag) => {
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

  describe('getAccountDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(txJsonPath, 'utf8'))
      secDataTest.updateAccountDBTxChain(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getAccountDB((err, value) => {
            console.log(value)
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(12)
            }
            done()
          })
        }
      })
    })
  })
})
