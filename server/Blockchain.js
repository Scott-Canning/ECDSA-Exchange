const Block = require('./Block.js');

class Blockchain {
    constructor() {
        this.chain = [];
        this.height = 0;
    };
    
    genesisBlock() {
        let block = new Block();
        this.chain.push(block);
    }

    addBlock(newBlock) {
        // increment block number if not genesis block and add prev hash param
        if(this.height > 0) {
            newBlock.blockNumber = this.chain[this.height - 1].blockNumber + 1;
            newBlock.previousHash = this.chain[this.height - 1].toHash();
        } else {
            newBlock.blockNumber = 1;
        }
        // hash(data + previousHash) of n - 1 block
        
        this.height++;
        this.chain.push(newBlock);
    };
    
    isValid() {
        for(let i = 1; i < this.chain.length; i++) {
            if (this.chain[i - 1].toHash().toString() !== 
                this.chain[i].previousHash.toString()) {
                return false;
            }
        }
        return true;
    }

    getBalance(address){
        let blockIndex = this.height
        console.log(this.chain[blockIndex]);
        for(let i = blockIndex; i >= 0; i--){
            for(let n = this.chain[blockIndex].txCount - 1; n >= 0; n--){
                let sender = this.chain[blockIndex].transactions[n].sender;
                let receiver = this.chain[blockIndex].transactions[n].receiver;
                if(sender.address === address){
                    return sender.balance;
                } 
                else if (receiver.address === address){
                    return receiver.balance;
                }
            }
        }
        return 0;
    }
};
module.exports = Blockchain;