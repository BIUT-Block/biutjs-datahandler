const AccTreeDB = require('../src/accTreeDB.js')
const fs = require('fs')
const path = require('path')

const tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')

const config = {
  'DBPath': './data/'
}
const accTree = new AccTreeDB(config)

function updateTx (tx, count, times, cb) {
  accTree._updateWithTx(tx).then(() => {
    if (count >= times) {
      cb()
    } else {
      count++
      updateTx(txs[0], count++, times, cb)
    }
  }).catch((err) => {
    cb(err)
  })
}

function getInfo (addr, cb) {
  accTree.getAccInfo(txs[0].TxFrom, (e, data) => {
    if (e) return console.error(e)
    console.log('==============')
    console.log(data)
  })
}

let txs = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2].Transactions
updateTx(txs[0], 0, 10000, (err) => {
  if (err) return console.error(err)
  else {
    console.log('finished')
  }
})
