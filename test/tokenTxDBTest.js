const TokenTxDB = require('../src/tokenTxDB.js')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const tokenJsonPath = path.join(__dirname, '../db-structure/tokenchain.json')
const testData = JSON.parse(fs.readFileSync(tokenJsonPath, 'utf8'))

describe('Token blockchain transaction database class test', () => {
  const config = {
    'DBPath': '../data/'
  }

  const tokenDB = new TokenTxDB(config)

  it('writeChain() functionality test', (done) => {
    let chain = testData
    tokenDB.writeChain(chain, (err) => {
      if (err) {
        expect.fail()
      } else {
        done()
      }
    })
  })

  it('getTxHashList() functionality test', (done) => {
    tokenDB.getTxHashList((err, list) => {
      if (err) {
        expect.fail()
      } else {
        expect(list).deep.equal([
          '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d',
          '511570b94bcf98061265974f74b29fbe5e179c47fc22b1eb7505901fe97f8c3f',
          '8e10bfb36a8b6b2c81a17d8818863eeabab315baca38adb1b4f029bfe56f9374',
          'adc1464538bb2ecbba627692d58db9958b76ed8bfdbc5b52d644596e9e3c3eec',
          'f3701c2a94590a353a6b91c3fdc058f22fbd262d282fac4ae55272e41af0efd2'
        ])
        done()
      }
    })
  })

  it('isTxExist() functionality test', (done) => {
    let nonExistTx = '123'
    let existedTx = '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d'
    tokenDB.isTxExist(nonExistTx, (err, result) => {
      if (err) {
        expect.fail()
      } else {
        expect(result).to.be.false
        tokenDB.isTxExist(existedTx, (err, result) => {
          if (err) {
            expect.fail()
          } else {
            expect(result).to.be.true
          }
        })
        done()
      }
    })
  })

  it('getTx() functionality test', (done) => {
    let txHash = '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d'
    tokenDB.getTx(txHash, (err, data) => {
      if (err) {
        expect.fail()
      } else {
        expect(data).deep.equal({
          TxHash: '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d',
          TxReceiptStatus: 'success',
          Version: '0.0.1',
          BlockNumber: 1,
          TimeStamp: 1530297310,
          TxFrom: '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju',
          TxTo: '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju',
          Value: 0,
          GasLimit: 4279,
          GasUsedByTxn: 374,
          GasPrice: 0.001,
          TxFee: 0.374,
          Nonce: 7268,
          InputData: 'Test Token Transaction'
        })
      }
    })
    done()
  })

  it('clearDB() functionality test', (done) => {
    tokenDB.clearDB((err) => {
      if (err) {
        expect.fail()
      } else {
        tokenDB.getTxHashList((err, list) => {
          if (err) {
            expect.fail()
          } else {
            expect(list).deep.equal([])
            done()
          }
        })
      }
    })
  })

  it('writeBlock() functionality test', (done) => {
    let block = testData[1]
    let txHash = '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d'
    tokenDB.writeBlock(block, (err) => {
      if (err) {
        expect.fail()
      } else {
        tokenDB.getTx(txHash, (err, data) => {
          if (err) {
            expect.fail()
          } else {
            expect(data).deep.equal({
              TxHash: '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d',
              TxReceiptStatus: 'success',
              Version: '0.0.1',
              BlockNumber: 1,
              TimeStamp: 1530297310,
              TxFrom: '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju',
              TxTo: '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju',
              Value: 0,
              GasLimit: 4279,
              GasUsedByTxn: 374,
              GasPrice: 0.001,
              TxFee: 0.374,
              Nonce: 7268,
              InputData: 'Test Token Transaction'
            })
            done()
          }
        })
      }
    })
  })

  it('delChain() functionality test', (done) => {
    let chain = [testData[1]]
    tokenDB.delChain(chain, (err) => {
      if (err) {
        expect.fail()
      } else {
        tokenDB.getTxHashList((err, list) => {
          if (err) {
            console.log(err)
            expect.fail()
          } else {
            expect(list).deep.equal([])
            done()
          }
        })
      }
    })
  })
})
