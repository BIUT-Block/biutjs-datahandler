const Promise = require('promise')

const dbOpts = {
  valueEncoding: 'json'
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

/* Read all the blocks in a database */
exports._getAllBlocksInDB = function (db, callback) {
  let buffer = []
  db.createReadStream().on('data', function (data) {
    if (data.key.length != 64) {
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

/* Put a key-value pair data to db */
exports._putDB = function (DB, key, value) {
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

/* Put a key-jsonData pair data to db */
exports._putJsonDB = function (DB, key, value) {
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
