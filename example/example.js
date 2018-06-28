const fs = require('fs')
const SecjsDataHandler = require('../src/index')

let jsonPath = '../test/blockchain.json'

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTokenChainToDB function')
  } else {
    secData.getAccountTx('1H1qVxChYmjnNxCTmK2JwHcaA2zwUn6XSi', function (output) {
      console.log(output)
    })
  }
})
