
class Address {
    constructor(address, balance) {
        this.address = address;
        this.balance = balance;
    }

    updateBalance(newBalance) {
        if(newBalance >= 0) {
            this.balance = newBalance;
        }
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }
}

module.exports = Address;