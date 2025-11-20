// =============================
// FRONTEND LOGIC (Full v3.1 — Added Reinvest Function)
// =============================

// Requires: CONTRACT_ADDRESS and CONTRACT_ABI defined globally (e.g. in abi.js)

let web3;
let contract;
let userAccount;

// =============================
// DOM ELEMENTS
// =============================
const connectBtn = document.getElementById("connectBtn");
const walletShort = document.getElementById("walletShort");
const balanceEl = document.getElementById("balance");
const contractBalanceEl = document.getElementById("contractBalance");
const stakeBtn = document.getElementById("stakeBtn");
const withdrawBtn = document.getElementById("withdrawBtn");
const reinvestBtn = document.getElementById("reinvestBtn");
const stakeAmount = document.getElementById("stakeAmount");
const refLink = document.getElementById("refLink");
const copyRef = document.getElementById("copyRef");
const withdrawableEl = document.getElementById("withdrawable");
const totalStakedEl = document.getElementById("totalStaked");
const totalWithdrawnEl = document.getElementById("totalWithdrawn");
const totalDepositsEl = document.getElementById("totalDeposits");

// =============================
// HELPER: SAFE TEXT SET
// =============================
function setText(el, text) {
  if (!el) return;
  el.innerText = text;
}

// =============================
// CONNECT WALLET
// =============================
if (connectBtn) {
  connectBtn.addEventListener("click", async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];

      if (!CONTRACT_ABI || !CONTRACT_ADDRESS) {
        alert("Contract configuration missing!");
        return;
      }

      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      connectBtn.style.display = "none";
      setText(walletShort, `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`);
      await updateUI();

      // Auto refresh when account changes
      window.ethereum.on("accountsChanged", async (acc) => {
        userAccount = acc[0];
        setText(walletShort, `${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`);
        await updateUI();
      });
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet.");
    }
  });
}

// =============================
// STAKE / INVEST
// =============================
if (stakeBtn) {
  stakeBtn.addEventListener("click", async () => {
    if (!contract || !userAccount) return alert("Connect your wallet first.");

    const amount = parseFloat(stakeAmount.value);
    if (isNaN(amount) || amount <= 0)
      return alert("Enter a valid amount greater than 0.");

    // Referral address
    let ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref || !web3.utils.isAddress(ref)) {
      ref = "0x3330fe6144a5ED99835F21994a39e7fBd451a616"; // default referral
    }

    const valueWei = web3.utils.toWei(amount.toString(), "ether");

    try {
      await contract.methods.invest(ref).send({
        from: userAccount,
        value: valueWei
      });

      alert("✅ Stake successful!");
      await updateUI();
    } catch (err) {
      console.error(err);
      alert("❌ Stake failed: " + (err.message || err));
    }
  });
}

// =============================
// WITHDRAW
// =============================
if (withdrawBtn) {
  withdrawBtn.addEventListener("click", async () => {
    if (!contract || !userAccount)
      return alert("Connect your wallet first.");

    try {
      await contract.methods.withdraw().send({
        from: userAccount
      });

      alert("✅ Withdraw successful!");
      await updateUI();
    } catch (err) {
      console.error(err);
      alert("❌ Withdraw failed: " + (err.message || err));
    }
  });
}

// =============================
// ✅ REINVEST FUNCTION
// =============================
if (reinvestBtn) {
  reinvestBtn.addEventListener("click", async () => {
    if (!contract || !userAccount)
      return alert("Connect your wallet first.");

    try {
      // This assumes the smart contract has a `reinvest()` method.
      await contract.methods.reinvest().send({
        from: userAccount
      });

      alert("✅ Reinvest successful!");
      await updateUI();
    } catch (err) {
      console.error(err);
      alert("❌ Reinvest failed: " + (err.message || err));
    }
  });
}

// =============================
// COPY REFERRAL LINK
// =============================
if (copyRef) {
  copyRef.addEventListener("click", async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink.value);
    alert("Referral link copied!");
  });
}

// =============================
// UPDATE DASHBOARD
// =============================
async function updateUI() {
  if (!web3 || !contract || !userAccount) return;

  try {
    // Wallet balance
    const bal = await web3.eth.getBalance(userAccount);
    setText(balanceEl, `${parseFloat(web3.utils.fromWei(bal, "ether")).toFixed(4)} BNB`);

    // Contract balance
    const contractBal = await contract.methods.msgvalue().call();
    setText(contractBalanceEl, `${parseFloat(web3.utils.fromWei(contractBal, "ether")).toFixed(4)} BNB`);

    // Withdrawable
    const withdrawable = await contract.methods.getUserAvailable(userAccount).call();
    setText(withdrawableEl, `${parseFloat(web3.utils.fromWei(withdrawable, "ether")).toFixed(6)} BNB`);

    // Global Total Staked
    const totalStaked = await contract.methods.totalStaked().call();
    setText(totalStakedEl, `${parseFloat(web3.utils.fromWei(totalStaked, "ether")).toFixed(4)} BNB`);

    // User Total Deposits
    const totalDeposits = await contract.methods.getUserTotalDeposits(userAccount).call();
    setText(totalDepositsEl, `${parseFloat(web3.utils.fromWei(totalDeposits, "ether")).toFixed(4)} BNB`);

    // User Total Withdrawn
    const totalWithdrawn = await contract.methods.getUserTotalWithdrawn(userAccount).call();
    setText(totalWithdrawnEl, `${parseFloat(web3.utils.fromWei(totalWithdrawn, "ether")).toFixed(6)} BNB`);

    // Referral Link
    const base = window.location.origin + window.location.pathname;
    refLink.value = `${base}?ref=${userAccount}`;
  } catch (err) {
    console.error("updateUI failed:", err);
  }
}
