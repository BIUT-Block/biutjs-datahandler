const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const AccountDB = require('../src/accountDB')
const dataHandlerUtil = require('../src/util.js')

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
          let accAddr = 'b14ab53e38da1c172f877dbc6d65e4a1b0474c3c'
          let promise = secDataTest.readUserInfofromAccountDB(accAddr)
          promise.then((data) => {
            expect(data.length).to.equal(1)
            expect(data[0].address).to.equal('b14ab53e38da1c172f877dbc6d65e4a1b0474c3c')
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
