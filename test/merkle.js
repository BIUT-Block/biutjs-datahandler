const fs = require('fs')
const Tree = require('merkle-patricia-tree')
const level = require('level')
const path = require('path')
const tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')

let accTreeDB = level('./data')
let tree = new Tree(accTreeDB)

function merklePut (key, count, times, cb) {
  tree.put(key, '', (err) => {
    if (err) return console.error(err)
    else {
      tree.put(key, '12111111111111111111111111' + count, (err) => {
        if (err) return cb(err)
        else if (count >= times) {
          cb()
        } else {
          count++
          merklePut(key, count++, times, cb)
        }
      })
    }
  })
}

let txs = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))[2].Transactions
let key = txs[0].TxFrom
merklePut(key, 0, 100000, (err) => {
  if (err) return console.error(err)
  else {
    console.log('finished')
  }
})
