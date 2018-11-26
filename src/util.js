const Promise = require('promise')

exports.HASH_LENGTH = 64
const dbOpts = {
  valueEncoding: 'json'
}

/* array for each functions async call */
exports._asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

/* Check whether the database is empty */
exports._isDBEmpty = function (db, callback) {
  let emptyFlag = true
  db.createReadStream().on('data', function (data) {
    emptyFlag = false
  }).on('error', function (err) {
    // console.log('DB empty checking stream occurs an error!')
    callback(err, null)
  }).on('close', function () {
    // console.log('Stream closed')
  }).on('end', function () {
    // console.log('Stream ended')
    callback(null, emptyFlag)
  })
}

/* Read all the data in a database */
exports._getAllDataInDB = function (db, callback) {
  let buffer = {}
  db.createReadStream().on('data', function (data) {
    buffer[data.key] = data.value
  }).on('error', function (err) {
    // console.log('Stream occurs an error when trying to read all data!')
    callback(err, null)
  }).on('close', function () {
    // console.log('Stream closed')
  }).on('end', function () {
    // console.log('Stream ended')
    callback(null, buffer)
  })
}

/* Read all the blocks in a database, this function is used by accountDB and productDB */
exports._getAllBlocksInDB = function (db, callback) {
  let buffer = []
  db.createReadStream().on('data', function (data) {
    if (data.key.length !== exports.HASH_LENGTH) {
      data.value = JSON.parse(data.value)
      if (('Transactions' in data.value) && (data.value['Transactions'].length !== 0)) {
        let txBuffer = []
        data.value['Transactions'].forEach((transaction) => {
          txBuffer.push(JSON.parse(transaction))
        })
        data.value['Transactions'] = txBuffer
      }
      buffer.push(data.value)
    }
  }).on('error', function (err) {
    // console.log('Stream occurs an error when trying to read all data!')
    callback(err, null)
  }).on('close', function () {
    // console.log('Stream closed')
  }).on('end', function () {
    // console.log('Stream ended')
    callback(null, buffer)
  })
}

/* Read all the blocks in a database, this function is used by txBlockChainDB and tokenBlockChainDB */
exports._getAllBlocksInDBSort = function (db, callback) {
  let buffer = []
  db.createReadStream().on('data', function (data) {
    if (data.key.length !== exports.HASH_LENGTH) {
      data.value = JSON.parse(data.value)
      if (('Transactions' in data.value) && (data.value['Transactions'].length !== 0)) {
        let txBuffer = []
        data.value['Transactions'].forEach((transaction) => {
          if (typeof transaction === 'string') {
            txBuffer.push(JSON.parse(transaction))
          } else if (typeof transaction === 'object') {
            txBuffer.push(transaction)
          }
        })
        data.value['Transactions'] = txBuffer
      }
      buffer.push(data.value)
    }
  }).on('error', function (err) {
    // console.log('Stream occurs an error when trying to read all data!')
    callback(err, null)
  }).on('close', function () {
    // console.log('Stream closed')
  }).on('end', function () {
    // console.log('Stream ended')
    buffer = buffer.sort((a, b) => parseInt(a['Number']) - parseInt(b['Number']))
    callback(null, buffer)
  })
}

/* Read all the block heights in a database */
exports._getAllBlockHeightsInDB = function (db, callback) {
  let bufferHeight = []
  let bufferHash = []
  db.createReadStream().on('data', function (data) {
    if (data.key.length !== exports.HASH_LENGTH) {
      bufferHeight.push(parseInt(data.key, 10))
      bufferHash.push(JSON.parse(data.value).Hash)
    }
  }).on('error', function (err) {
    // console.log('Stream occurs an error when trying to read all data!')
    callback(err, null)
  }).on('close', function () {
    // console.log('Stream closed')
  }).on('end', function () {
    // console.log('Stream ended')
    bufferHeight = bufferHeight.sort((a, b) => a - b)
    callback(null, [bufferHeight, bufferHash])
  })
}

/* Put a key-value pair data to db */
exports._putDB = function (DB, key, value, callback) {
  DB.put(key, value, function (err) {
    if (err) {
      callback(err)
    } else {
      callback()
    }
  })
}

/* Put a key-jsonData pair data to db */
exports._putJsonDB = function (DB, key, value, callback) {
  DB.put(key, value, dbOpts, function (err) {
    if (err) {
      callback(err)
    } else {
      callback()
    }
  })
}

/* Put a key-value pair data to db, return a promise object */
exports._putDBPromise = function (DB, key, value) {
  return new Promise(function (resolve, reject) {
    DB.put(key, value, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/* Put a key-jsonData pair data to db, return a promise object */
exports._putJsonDBPromise = function (DB, key, value) {
  return new Promise(function (resolve, reject) {
    DB.put(key, value, dbOpts, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/* Get a value from the DB according to the "key" input */
exports._getDB = function (DB, key, callback) {
  DB.get(key, function (err, value) {
    if (err) {
      callback(err, null)
    } else {
      // console.log(key + '=' + value)
      callback(null, value)
    }
  })
}

/* Get a value which is in json format from the DB according to the "key" input */
exports._getJsonDB = function (DB, key, callback) {
  DB.get(key, dbOpts, function (err, value) {
    if (err) {
      callback(err, null)
    } else {
      // console.log(key + '=' + value)
      callback(null, value)
    }
  })
}

/* Get a value from the DB according to the "key" input, return a promise object */
exports._getDBPromise = function (DB, key) {
  return new Promise(function (resolve) {
    DB.get(key, function (err, value) {
      if (err) {
        resolve([err, value])
      } else {
        // console.log(key + '=' + value)
        resolve([null, value])
      }
    })
  })
}

/* Get a value which is in json format from the DB according to the "key" input, return a promise object */
exports._getJsonDBPromise = function (DB, key) {
  return new Promise(function (resolve) {
    DB.get(key, dbOpts, function (err, value) {
      if (err) {
        resolve([err, null])
      } else {
        if (('Transactions' in value) && (value['Transactions'].length !== 0)) {
          let txBuffer = []
          if (typeof value['Transactions'] === 'string') {
            value['Transactions'] = JSON.parse(value['Transactions'])
          }
          value['Transactions'].forEach((transaction) => {
            try {
              txBuffer.push(JSON.parse(transaction))
            } catch (err) {
              txBuffer.push(transaction)
            }
          })
          value['Transactions'] = txBuffer
        }
        resolve([null, value])
      }
    })
  })
}

/* Delete a value from the DB according to the "key" input */
exports._delDB = function (DB, key, callback) {
  DB.del(key, function (err) {
    if (err) {
      callback(err)
    } else {
      callback()
    }
  })
}

/* Delete a value from the DB according to the "key" input, return a promise object */
exports._delDBPromise = function (DB, key) {
  return new Promise(function (resolve, reject) {
    DB.del(key, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/* Convert each item within an array (object format) to string format */
exports._txStringify = function (transactionList) {
  if (!Array.isArray(transactionList) && Object.keys(transactionList).length) {
    throw new TypeError('Invalid transactionList input')
  }

  if (transactionList !== []) {
    transactionList.forEach(function (transaction, index) {
      transactionList[index] = JSON.stringify(transactionList[index])
    })
  }

  return transactionList
}

/* Validate input is json format string */
exports._jsonTypeCheck = function (jsonFile) {
  try {
    JSON.parse(jsonFile)
  } catch (error) {
    return false
  }

  return true
}

/* Combine strings with '!' in between, the combined string is used for DB key index */
exports._combineStrings = function (input1, input2, input3 = '', input4 = '') {
  if (input4 !== '') {
    return (input1.toString() + '!' + input2.toString() + '!' + input3.toString() + '!' + input4.toString())
  } else if (input3 !== '') {
    return (input1.toString() + '!' + input2.toString() + '!' + input3.toString())
  }

  return (input1.toString() + '!' + input2.toString())
}
