const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');
const e = require('express');


// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

function verifySignature(message, privateKey){

  const msgHash = SHA256(message).toString();
  const sendersPrivateKey = ec.keyFromPrivate(privateKey);
  const signature = sendersPrivateKey.sign(msgHash);
  const senderSignature = {
    r: signature.r.toString(16),
    s: signature.s.toString(16)
}

  const pubPoint = sendersPrivateKey.getPublic();
  const x = pubPoint.getX().toString('hex');
  const y = pubPoint.getY().toString('hex');
  const sendersPublicKey = {
    x: x,
    y: y
  };

  const key = ec.keyFromPublic(sendersPublicKey, 'hex');
  return key.verify(SHA256(message).toString(), senderSignature);
}

// seed accounts with random balances
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// create dict with demo keys
const addresses = {};
for(let i = 0; i < 3; i++) {
  let key = ec.genKeyPair();
  let publicKey = '0x' + key.getPublic().encode('hex').slice(0,40);
  let randBalance = getRandomInt(100, 500);
  let addressData = {
    privateKey: key.getPrivate().toString(16),
    publicX: key.getPublic().x.toString(16),
    publicY: key.getPublic().y.toString(16),
    balance: randBalance
  }
  addresses[publicKey] = addressData;
}

app.post('/balance', (req, res) => {
  const {address, privKey} = req.body;
  const privateKey = addresses[address].privateKey;
  let balance = 0;

  // return balance only if users supplies correct private key
  if(privateKey === privKey){
    console.log("wallet connected")
    balance = addresses[address].balance;
    res.send({ balance: balance });
  } else {
    balance = 0;
    res.send({ balance: balance});
  }
});

app.post('/send', (req, res) => {
  const {sender, sendersPk, recipient, amount} = req.body;

  const message = {
    sender: sender,
    recipient: recipient,
    amount: amount
  };

  const privateKey = addresses[sender].privateKey;
  if(privateKey === sendersPk){
    if(verifySignature(message, sendersPk)){
      console.log("signature verified")
      if(addresses[sender].balance >= amount){
        addresses[sender].balance -= amount;
        addresses[recipient].balance = (addresses[recipient].balance || 0) + +amount;
        res.send({ balance: addresses[sender].balance });
      } else {
        console.log("insufficient balance")
        res.send({ balance: addresses[sender].balance })
      }
    } else {
      console.log("signature NOT verified")
      res.send({ balance: 0 })
    }
  } else {
    console.log("incorrect credentials")
    res.send({ balance: 0 })
  };
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // output key pairs to use on front-end
  console.log(addresses);
});
