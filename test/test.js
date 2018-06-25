const expect = require('chai').expect
const fs = require('fs')
const SecjsDataHandler = require('../src/index')

describe('SecjsDataHandler', () => {
  let jsonPath = './blockchain.json'
  const config = {
    'DBPath': '../data/'
  }
  const secData = new SecjsDataHandler(config)

  describe('writeTokenChainToDB() function test', () => {
    it('functionality correctness test', () => {
    })

    it('invalid input jsonfile test', () => {
    })
  })

  describe('getAccountTx() function test', () => {
    it('functionality correctness test', () => {
      secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
        if (err) {
          console.log('this is in test.js file')
          console.log(err)
        } else {
          // secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Transactions'))
          secData.getAccountTx('1H1qVxChYmjnNxCTmK2JwHcaA2zwUn6XSi')
        }
      })
    })

    it('invalid input address test', () => {
    })
  })
})
