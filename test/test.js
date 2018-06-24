const expect = require('chai').expect
const fs = require('fs')
const SecjsDataHandler = require('../src/index')

let jsonPath = './blockchain.json'

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'))

// secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Transactions'))
secData.getAccountTx('1H1qVxChYmjnNxCTmK2JwHcaA2zwUn6XSi')
