const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const TokentxDB = require('../src/tokenTxDB')
const dataHandlerUtil = require('../src/util.js')

let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
const config = {
  'DBPath': '../data/'
}
const secDataTest = new TokentxDB(config)
let chain = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))
let hash = '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d'
// console.log(chain)
// console.log(chain[1].Transactions[0].TxHash)
secDataTest.writeChain(chain, (err) => {
  if (err) throw err
  else {
    secDataTest.getTxHashList((err, data) => {
      if (err) throw err
      else {
        console.log(data)
      }
    })
  }
})

secDataTest.delChain(chain, (err) => {
  if (err) throw err
  else {
    secDataTest.getTxHashList((err, data) => {
      if (err) throw err
      else {
        console.log(data)
      }
    })
  }
})
