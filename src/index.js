const AccountDB = require('./accountDB')
const ProductDB = require('./productDB')
const TokenBlockChainDB = require('./tokenBlockChainDB')
const TxBlockChainDB = require('./txBlockChainDB')

module.exports = {
  AccountDB: AccountDB,
  ProductDB: ProductDB,
  TokenBlockChainDB: TokenBlockChainDB,
  TxBlockChainDB: TxBlockChainDB
}
