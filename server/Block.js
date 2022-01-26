const SHA256 = require("crypto-js/sha256");

class Block {
    constructor() {
        this.transactions = [];
        this.txCount = 0;
        this.blockSize = 10;
        this.blockNumber = 0;
    }

    toHash() {
        return SHA256(this.transaction + this.previousHash);
    }

    hasSpace() {
         return (this.txCount < this.blockSize);
    }
};

module.exports = Block;