const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')

let jsonPath = path.join(__dirname, '../db-structure/tokenchain.json')

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.writeTokenChainToDB(fs.readFileSync(jsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTokenChainToDB function')
  } else {
    secData.getAccountTx('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', function (output) {
      console.log(output)
    })
  }
})
