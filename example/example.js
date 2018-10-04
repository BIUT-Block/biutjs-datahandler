const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')

let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
// let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

let data = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
secData.writeTokenChainToDB(data, function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTokenChainToDB function')
  } else {
    secData.getAccountTx('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', function (output) {
      // console.log(output)
    })
    secData._getDB(secData.accountDB, secData._combineStrings('token', '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', 'balance'), function (err, value) {
      if (err) {
        console.log(err)
      } else {
        console.log(value)
      }
    })
  }
})

const tokenBlockHashArray = [
  '5f213ac06cfe4a82e167aa3ea430e520be99dcedb4ab47fd8f668448708e34c1',
  'd30e75b804fa4ca0b10a5556ef96a51f968509efb3a3edfdd2f478bc8656aa6d'
]

secData.getTokenBlockFromDB(tokenBlockHashArray, (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('get token blocks from database has no error, result is:')
    console.log(value)
  }
})

secData.getTokenBlockFromDB('5f213ac06cfe4a82e167aa3ea430e520be99dcedb4ab47fd8f668448708e34c1', (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('get token blocks from database has no error, result is:')
    console.log(value)
  }
})

secData.getTokenChain(1, 2, (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('Here are all the token chain blocks')
    console.log(value)
  }
})
