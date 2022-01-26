import "./index.scss";
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Transaction = require('../Server/Transaction');
const Account = require('../server/Account.js');
const SHA256 = require('crypto-js/sha256');

const server = "http://localhost:3042";

// seed accounts with random balances
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

// create dict with demo keys
function genNewKeyPair() {
  let key = ec.genKeyPair();
  let publicKey = '0x' + key.getPublic().encode('hex').slice(0,40);
  let randBalance = getRandomInt(100, 500);
  let addressData = {
    publicKey: publicKey,
    privateKey: key.getPrivate().toString(16),
    balance: randBalance
  }
  return addressData;
};


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
};

const genesisAccount = new Account(0, 21000000);

document.getElementById("generate-wallet").addEventListener('click', () => {
  document.getElementById("exchange-address").innerHTML = '';
  document.getElementById("exchange-privatekey").innerHTML = '';
  
  const newUser = genNewKeyPair();
  const newAccount = new Account(newUser.publicKey, 0)
  const tx = new Transaction(genesisAccount, newAccount, newUser.balance);
  
  // output pk pair to console for user
  console.log(newUser);
  console.log(tx);

  const body = JSON.stringify({ tx });
  const request = new Request(`${server}/newWallet`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
    
  }).then(({ success, blockHeight }) => {
    let txStatus = "Transaction Failed";
    if(success) { 
      txStatus = "Transaction Succeeded";
      document.getElementById("success").innerHTML = txStatus;
      document.getElementById("blockheight").innerHTML = blockHeight;
    }
    else {
      return;
    }
  });
});


document.getElementById("connect-wallet").addEventListener('click', () => {
    const address = document.getElementById("exchange-address").value;
    const privKey = document.getElementById("exchange-privatekey").value;
      
    const verified = verifySignature("", privKey);

    if(!verified) {
      document.getElementById("balance").innerHTML = 0;
      return;
    }
    console.log("verified: ", verified);

    const body = JSON.stringify({
      verified, address
    });

    const request = new Request(`${server}/balance`, { method: 'POST', body });
      
    fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
      return response.json();
    }).then(({ account }) => {
      document.getElementById("balance").innerHTML = " " + account.balance;
  });
});


document.getElementById("transfer-amount").addEventListener('click', () => {
  const privKey = document.getElementById("exchange-privatekey").value;
  const senderAddress = document.getElementById("exchange-address").value;
  const receiverAddress = document.getElementById("recipient").value;
  const amount = document.getElementById("send-amount").value;
  
  //const tx = new Transaction(senderAddress, receiverAddress, amount);
  const verified = verifySignature(JSON.stringify(senderAddress, receiverAddress, amount), privKey);

  if(!verified) {
    document.getElementById("exchange-privatekey").innerHTML = "Invalid Private Key";
    return;
  }

  const body = JSON.stringify({
    verified, senderAddress, receiverAddress, amount
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ success, balance, blockHeight }) => {
    let txStatus = "Transaction Failed";
    if(success) { 
      txStatus = "Transaction Succeeded";
    }
    document.getElementById("success").innerHTML = txStatus;
    document.getElementById("balance").innerHTML = balance;
    document.getElementById("blockheight").innerHTML = blockHeight;
  });
});
