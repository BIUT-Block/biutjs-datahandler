const AccTreeDB = require('../src/accTreeDB.js')

const config = {
  'DBPath': '../data/'
  // 'StateRoot': '2eb39ae30f26e27dfdbcfbc114323daa9dd2c74786974e19a775c24432d429e3'
}
const root = '2eb39ae30f26e27dfdbcfbc114323daa9dd2c74786974e19a775c24432d429e3'
const accTree = new AccTreeDB(config)
// console.log(accTree.getRoot())

// accTree.constructNewTree(root)

// accTree.putAccInfo('12345', ['1.1', 2], (err) => {
//   if (err) {
//     console.log(err)
//   } else {
//     console.log('success')
//     console.log(accTree.getRoot())
//   }
// })

// accTree.getAccInfo('12345', (err, data) => {
//   if (err) {
//     console.log('===============')
//     // console.log(err)
//     // accTree.constructNewTree(root)
//     accTree.getAccInfo('12345', (err, data) => {
//       if (err) {
//         console.log(accTree.getRoot())
//         console.log('2222222222')
//       } else {
//         console.log(accTree.getRoot())
//         console.log(data)
//       }
//     })
//   } else {
//     console.log('data')
//     console.log(data)
//   }
// })

accTree.checkRoot('2eb39ae30f26e27dfdbcfbc114323daa9dd2c74786974e19a775c24432d429e3', (err, result) => {
  console.log(err)
  console.log(result)
})
