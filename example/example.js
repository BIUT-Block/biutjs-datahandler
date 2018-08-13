const fs = require('fs')
const path = require('path')
const SecjsDataHandler = require('../src/index')

let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.writeTokenChainToDB(fs.readFileSync(tokenJsonPath, 'utf8'), function (err) {
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

secData.getTokenChain(2, (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('Here are all the token chain blocks')
    console.log(value)
  }
})






/*
secData.writeTxChainToDB(fs.readFileSync(txJsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTxChainToDB function')
  } else {
    secData.getAccountTx('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', function (output) {
      // console.log(output)
    })
  }
})

const txBlockHashArray = [
  '04c7123071429bbfcfb6ffd22501bdcc575f8df820041d63d8c16b94a9696ecf',
  '11346530b890976525b1742c466600a4fa97c0b0a0bfcb6587fe9765f3fd7f7a'
]

secData.getTxBlockFromDB(txBlockHashArray, (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('get transaction blocks from database has no error, result is:')
    console.log(value)
  }
})

secData.getTxBlockFromDB('a85e16c8a400ed6f4735a1ad9b747603844272ed63da69549bfe29da2827da2c', (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('get transaction blocks from database has no error, result is:')
    console.log(value)
  }
})

secData.getTxChain(1, (err, value) => {
  if (err) {
    console.log('error occurs')
    console.log(err)
  } else {
    console.log('Here are all the transaction chain blocks')
    console.log(value)
  }
})

secData.writeTxChainToDB(fs.readFileSync(txJsonPath, 'utf8'), function (err) {
  if (err) {
    console.log(err)
    throw new Error('Something wrong with writeTxChainToDB function')
  } else {
    secData._getDB(secData.txBlockChainDB, secData._combineStrings(1, 'TimeStamp'), function (value) {
      console.log(value)
    })
  }
}) */
