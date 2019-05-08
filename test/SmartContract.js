const SmartContractTxDB = require('../src/SmartContractTxDB.js')
const expect = require('chai').expect

describe('Smart Contract database class test', () => {
  const config = {
    'DBPath': '../data/'
  }
  const smartContract = new SmartContractTxDB(config)

  it('add/getContractAddress functions test', (done) => {
    smartContract.add('SEC', '12345', (err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        smartContract.getContractAddress('SEC', (err, addArray) => {
          if (err) {
            console.log(err)
            expect.fail()
          } else {
            expect(addArray).to.deep.equal([12345])
            done()
          }
        })
      }
    })
  })

  it('add/getTokenName functions test', (done) => {
    smartContract.add('SEC', '12345', (err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        smartContract.getTokenName('12345', (err, tokenName) => {
          if (err) {
            console.log(err)
            expect.fail()
          } else {
            expect(tokenName).to.equal('SEC')
            done()
          }
        })
      }
    })
  })

  it('clear function test', (done) => {
    smartContract.clearDB((err) => {
      if (err) console.error(err)
      done()
    })
  })
})
