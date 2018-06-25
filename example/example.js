const fs = require('fs')
const SecjsDataHandler = require('../src/index')

let jsonPath = '../test/blockchain.json'

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
  if (err) {
    console.log('this is in test.js file')
    console.log(err)
  } else {
    // secData._getDB(secData.tokenBlockChainDB, secData._combineStrings(2, 'Transactions'))
    secData.getAccountTx('1H1qVxChYmjnNxCTmK2JwHcaA2zwUn6XSi')
  }
})
