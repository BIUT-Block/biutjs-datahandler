const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const AccountDB = require('../src/accountDB')

describe('Transaction block chain database class test', () => {
  let accInfoPath = path.join(__dirname, '../db-structure/account.json')
  const config = {
    'DBPath': '../data/'
  }
  const secDataTest = new AccountDB(config)

  describe('writeUserInfoToAccountDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(accInfoPath, 'utf8'))
      secDataTest.writeUserInfoToAccountDB(data, (err) => {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getAccountDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(4)
            }
            done()
          })
        }
      })
    })
  })

  describe('readUserInfofromAccountDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(accInfoPath, 'utf8'))
      secDataTest.writeUserInfoToAccountDB(data, function (err) {
        if (err) {
          expect.fail()
        } else {
          let accName = 'ppg'
          let promise = secDataTest.readUserInfofromAccountDB(accName)
          promise.then((data) => {
            expect(data.length).to.equal(1)
            expect(data[0].password).to.equal('ppgzhenshuai')
            done()
          }).catch((err) => {
            console.log(err)
            expect.fail()
            done()
          })
        }
      })
    })
  })

  describe('isAccountDBEmpty() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(accInfoPath, 'utf8'))
      secDataTest.writeUserInfoToAccountDB(data, (err) => {
        if (err) {
          expect.fail()
        } else {
          secDataTest.isAccountDBEmpty((err, emptyFlag) => {
            if (err) {
              expect.fail()
            } else {
              expect(emptyFlag).to.be.false
            }
            done()
          })
        }
      })
    })
  })

  describe('getAccountDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(accInfoPath, 'utf8'))
      secDataTest.writeUserInfoToAccountDB(data, (err) => {
        if (err) {
          expect.fail()
        } else {
          secDataTest.getAccountDB((err, value) => {
            if (err) {
              expect.fail()
            } else {
              expect(Object.keys(value).length).to.equal(4)
            }
            done()
          })
        }
      })
    })
  })
})
