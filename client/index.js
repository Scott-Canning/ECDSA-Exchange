import "./index.scss";

const server = "http://localhost:3042";

document.getElementById("connect-wallet").addEventListener('click', () => {
    const address = document.getElementById("exchange-address").value;
    const privKey = document.getElementById("exchange-privatekey").value;
    
    if(privKey === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    const body = JSON.stringify({
      address, privKey
    });

    const request = new Request(`${server}/balance`, { method: 'POST', body });
      
    fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
      return response.json();
    }).then(({ balance }) => {
      document.getElementById("balance").innerHTML = balance;
  });
 });


document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const sendersPk = document.getElementById("exchange-privatekey").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  
  const body = JSON.stringify({
    sender, sendersPk, amount, recipient
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
