const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')

// let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

/* secData.writeTokenChainToDB(fs.readFileSync(tokenJsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTokenChainToDB function')
  } else {
    secData.getAccountTx('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', function (output) {
      console.log(output)
    })
  }
}) */

secData.writeTxChainToDB(fs.readFileSync(txJsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTxChainToDB function')
  } else {
    secData._getDB(secData.txBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (value) {
      console.log(value)
    })
  }
})
