const SecjsDataHandler = require('../src/index')

// let tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
// let txJsonPath = path.join(__dirname, '../db-structure/txchain.json')

const config = {
  'DBPath': '../data/'
}
const secData = new SecjsDataHandler(config)

secData.isAccountDBEmpty((err, result) => {
  if (err) {
    console.log('err occurs')
  } else {
    console.log('the accountDB empty flag is ' + result)
  }
})

secData.getAccountDB((err, result) => {
  if (err) {
    console.log('err occurs')
  } else {
    console.log('all the data stored in accountDB is ')
    console.log(result)
  }
})
