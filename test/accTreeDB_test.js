const AccTreeDB = require('../src/accTreeDB.js')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const testData = require('../db-structure/accTree.js').testData

const accTreeJson = path.join(__dirname, '../db-structure/accTree.json')

describe('Account Tree block chain database class test', () => {
  const config = {
    'DBPath': '../data/'
  }
  const accTree = new AccTreeDB(config)

  it('Clear DB test', (done) => {
    let address = '28f6af3bf89b7de2b5177f7747650d7321027055'
    let data = [{ SEC: '1.2', SEN: '1.5' }, 0]
    let root1 = accTree.getRoot()
    accTree.putAccInfo(address, data, (err) => {
      if (err) {
        expect.fail()
      } else {
        let root2 = accTree.getRoot()
        expect(root1).to.not.equal(root2)
        accTree.getAccInfo(address, (err, value) => {
          if (err) {
            expect.fail()
          } else {
            expect(value).to.deep.equal(data)
            accTree.clearDB((err) => {
              if (err) {
                expect.fail()
              } else {
                let root3 = accTree.getRoot()
                expect(root1).to.equal(root3)
                done()
              }
            })
          }
        })
      }
    })
  })

  it('Check if the merkle tree has the same root if data is written in different orders', (done) => {
    let index = 0
    let length = Object.keys(testData).length
    // Object.keys(testData).reverse().forEach((address) => {
    Object.keys(testData).forEach((address) => {
      accTree.putAccInfo(address, testData[address], (err) => {
        if (err) {
          expect.fail()
        } else {
          if (index + 1 === length) {
            accTree.clearDB((err) => {
              if (err) {
                expect.fail()
              } else {
                done()
              }
            })
          }
          index++
        }
      })
    })
  })

  it('_updateWithTx functionality test', (done) => {
    let txs = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))[2].Transactions
    accTree._updateWithTx(txs[0]).then(() => {
      let addr = '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju'
      accTree.getAccInfo(addr, (err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal([
            '999',
            '1',
            {
              From: ['8e10bfb36a8b6b2c81a17d8818863eeabab315baca38adb1b4f029bfe56f9374'],
              To: []
            }
          ])
          done()
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })

  it('updateWithBlock functionality test', (done) => {
    accTree.clearDB((err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        let block = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))[0]
        accTree.updateWithBlock(block).then(() => {
          block = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))[1]
          accTree.updateWithBlock(block).then(() => {
            block = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))[2]
            accTree.updateWithBlock(block).then(() => {
              accTree.getRoots((err, array) => {
                if (err) {
                  console.log(err)
                  expect.fail()
                } else {
                  expect(array).to.deep.equal(['56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
                                               '7aed57cc4144f1d5129390c72e036e15def10374eda35e49c01a668299489b14',
                                               'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1'])
                  done()
                }
              })
            }).catch((err) => {
              console.log(err)
              expect.fail()
            })
          }).catch((err) => {
            console.log(err)
            expect.fail()
          })
        }).catch((err) => {
          console.log(err)
          expect.fail()
        })
      }
    })
  })

  it('updateWithBlockChain functionality test', (done) => {
    accTree.clearDB((err) => {
      if (err) {
        console.log(err)
        expect.fail()
      } else {
        let blockchain = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))
        accTree.updateWithBlockChain(blockchain).then(() => {
          accTree.getRoots((err, array) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              expect(array).to.deep.equal([ '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
                                            '7aed57cc4144f1d5129390c72e036e15def10374eda35e49c01a668299489b14',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1',
                                            'ff075f75a22a75e60c952cc1533ab4661c480bb1209a4c3695702a693c2e34f1' ])
              accTree.getAccInfo('1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju', (err, info) => {
                if (err) {
                  console.log(err)
                  expect.fail()
                } else {
                  expect(info).to.deep.equal([ '999',
                      '5',
                      { From:
                        [ '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d',
                          '8e10bfb36a8b6b2c81a17d8818863eeabab315baca38adb1b4f029bfe56f9374',
                          '511570b94bcf98061265974f74b29fbe5e179c47fc22b1eb7505901fe97f8c3f',
                          'adc1464538bb2ecbba627692d58db9958b76ed8bfdbc5b52d644596e9e3c3eec',
                          'f3701c2a94590a353a6b91c3fdc058f22fbd262d282fac4ae55272e41af0efd2' ],
                        To:
                        [ '401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d',
                          '511570b94bcf98061265974f74b29fbe5e179c47fc22b1eb7505901fe97f8c3f',
                          'adc1464538bb2ecbba627692d58db9958b76ed8bfdbc5b52d644596e9e3c3eec',
                          'f3701c2a94590a353a6b91c3fdc058f22fbd262d282fac4ae55272e41af0efd2' ]
                      }
                    ]
                  )
                  done()
                }
              })
            }
          })
        }).catch((err) => {
          console.log(err)
          expect.fail()
        })
      }
    })
  })

  it('revertBlock functionality test', (done) => {
    let block = JSON.parse(fs.readFileSync(accTreeJson, 'utf8'))[2]
    accTree.revertBlock(block).then(() => {
      let addr = '1CmqKHsdhqJhkoWm9w5ALJXTPemxL339ju'
      accTree.getAccInfo(addr, (err, data) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(data).to.deep.equal([
            '1000',
            '1',
            {
              From: ['401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d'],
              To: ['401407fa4423c317f9c4d288e08c69c6853fea934ce53a094281358c1ef6526d']
            }
          ])
          accTree.clearDB((err) => {
            if (err) {
              expect.fail()
            } else {
              done()
            }
          })
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })

  it('_updateRoots functionality test', (done) => {
    accTree._updateRoots(0, 'test').then(() => {
      accTree.getRoots((err, rootArray) => {
        if (err) {
          console.log(err)
          expect.fail()
        } else {
          expect(rootArray).to.deep.equal(['test'])
          accTree._clearRoots((err) => {
            if (err) {
              console.log(err)
              expect.fail()
            } else {
              accTree.getRoots((err, array) => {
                if (err) {
                  console.log(err)
                  expect.fail()
                } else {
                  expect(array).to.deep.equal([])
                  done()
                }
              })
            }
          })
        }
      })
    }).catch((err) => {
      console.log(err)
      expect.fail()
    })
  })
})
