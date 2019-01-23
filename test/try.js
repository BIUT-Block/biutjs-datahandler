const AccTreeDB = require('../src/accTreeDB.js')

const config = {
  'DBPath': '../data/'
}
const accTree = new AccTreeDB(config)

// accTree.putAccInfo('12345', ['1.1', 2], (err) => {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log('success')
//   }
// })

accTree.getAccInfo('12345', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    console.log('data')
    console.log(data)
  }
})
