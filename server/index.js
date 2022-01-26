const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const e = require('express');
const Chain = require('./Blockchain.js');
const Transaction = require('./Transaction.js');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const bc = new Chain();
bc.genesisBlock();

app.post('/newWallet', (req, res) => {
  const { tx } = req.body;
  const { sender, receiver, amount } = tx;
  newTx = new Transaction(sender, receiver, amount);
  const { success, /* balance */ } = bc.addTransaction(newTx);
  const blockHeight = bc.height.toString();
  
  res.json({
    "success": success,
    "blockHeight": blockHeight
  });
});


app.post('/balance', (req, res) => {
  const { address, verified } = req.body;

  // return balance only if user private key is verified on client
  if(verified) {
    console.log("Wallet Connected")
    account = bc.getAccount(address);
    res.send({ account: account });
  } 
  else {
    balance = 0;
    res.send({ account: undefined });
  }
});


app.post('/send', (req, res) => {
  const { verified, senderAddress, receiverAddress, amount } = req.body;

  if(verified) {
      console.log("Signature Verified");
      sender = bc.getAccount(senderAddress);
      receiver = bc.getAccount(receiverAddress);
      tx = new Transaction(sender, receiver, amount);
      const { success, balance } = bc.addTransaction(tx);

      const blockHeight = bc.height;

      if (success){
        res.json({
          "success": success,
          "balance": balance,
          "blockHeight": blockHeight
        });
      } 
      else if (!success) {
        console.log("Signature NOT Verified")
        res.json({
          "success": success,
          "balance": balance,
          "blockHeight": blockHeight
        });
      } else {
        console.log("Invalid Credentials")
        res.json({
          "success": success,
          "balance": 0,
          "blockHeight": blockHeight
        });
      }
    }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // output key pairs to use on front-end
});
