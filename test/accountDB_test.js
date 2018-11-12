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
          let privateKey = '1fca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378'
          let promise = secDataTest.readUserInfofromAccountDB(privateKey)
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

  describe('isAccountInAccountDB() function test', () => {
    it('functionality correctness test', (done) => {
      let data = JSON.parse(fs.readFileSync(accInfoPath, 'utf8'))
      secDataTest.writeUserInfoToAccountDB(data, (err) => {
        if (err) {
          expect.fail()
        } else {
          let privateKey = '1fca4cdd31923b50f4214af5d2ae10e7ac45a5019e9431cc195482d707485378'
          secDataTest.isAccountInAccountDB(privateKey, (err, value) => {
            expect(err).to.be.null
            expect(value).to.not.be.null
          })

          privateKey = 'NodeDefaultAccount'
          secDataTest.isAccountInAccountDB(privateKey, (err, value) => {
            expect(err).to.not.be.null
            expect(value).to.be.null
            done()
          })
        }
      })
    })
  })
})
