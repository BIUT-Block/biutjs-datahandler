const AccTreeDB = require('../src/accTreeDB.js')

const config = {
  'DBPath': '../data/',
  'StateRoot': '0x2eb39ae30f26e27dfdbcfbc114323daa9dd2c74786974e19a775c24432d429e3'
}
const accTree = new AccTreeDB(config)

// accTree.putAccInfo('12345', ['1.1', 2], (err) => {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log('success')
//     console.log(accTree.getRoot())
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
