// 🔥 history.js — random live transaction feed

// Generate random short wallet address
function randomWallet() {
  const chars = "abcdef0123456789";
  return "0x" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
       + "..." +
       Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Generate random transaction ID
function randomTxId() {
  const chars = "abcdef0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
       + "..." +
       Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Generate random BNB amount (0.05 to 20)
function randomAmount() {
  return (Math.random() * 1.95 + 0.05).toFixed(3);
}

// Get current time (global)
function currentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Generate random transaction type
function randomType() {
  return Math.random() > 0.5 ? 'Invest' : 'Withdraw';
}

// Create a random transaction object
function createTransaction() {
  const type = randomType();
  return {
    type,
    amount: randomAmount(),
    wallet: randomWallet(),
    txId: randomTxId(),
    time: currentTime()
  };
}

// Render transactions in the live box
function renderLiveTransactions() {
  const container = document.getElementById('liveHistory');
  if (!container) return;

  // Fade out old ones
  Array.from(container.children).forEach(item => {
    item.classList.add('fade-out');
    setTimeout(() => item.remove(), 400);
  });

  // Create 3 new random transactions
  const batch = Array.from({ length: 3 }, createTransaction);

  setTimeout(() => {
    batch.forEach(tx => {
      const div = document.createElement('div');
      div.className = `history-item ${tx.type.toLowerCase()}`;
      div.innerHTML = `
        <span>${tx.type}</span>
        <span>${tx.amount} BNB</span>
        <span>${tx.wallet}</span>
        <span>${tx.time}</span>
      `;
      container.appendChild(div);
    });
  }, 400);
}

// Initialize and loop every 5 seconds
document.addEventListener('DOMContentLoaded', () => {
  renderLiveTransactions();
  setInterval(renderLiveTransactions, 5000);
});
