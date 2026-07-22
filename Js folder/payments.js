/**
 * ===================================================
 * WorkBee V3 Premium Edition
 * payments.js
 * Complete Functionality for Wallet & Payments
 * ===================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Payments Functionality
    initWalletUI();
    setupEventListeners();
});

// State Management
const walletData = {
    availableBalance: 0.00,
    pendingEscrow: 0.00,
    totalWithdrawn: 0.00,
    transactions: []
};

/**
 * Initialize UI Elements and Fetch Data
 */
function initWalletUI() {
    // Check user authentication (Assuming Firebase Auth is initialized)
    if (typeof firebase !== 'undefined' && firebase.auth()) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                loadUserWalletData(user.uid);
            } else {
                // Redirect if not logged in
                window.location.href = "login.html";
            }
        });
    } else {
        // Fallback demo data render for local testing
        renderWalletBalances();
        renderTransactionHistory();
    }
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    // Deposit & Withdraw Buttons
    const depositBtn = document.getElementById("depositBtn");
    const withdrawBtn = document.getElementById("withdrawBtn");

    if (depositBtn) {
        depositBtn.addEventListener("click", () => openPaymentModal('deposit'));
    }

    if (withdrawBtn) {
        withdrawBtn.addEventListener("click", () => openPaymentModal('withdraw'));
    }

    // Modal Close Triggers
    const closeBtns = document.querySelectorAll(".close-modal, .modal-overlay");
    closeBtns.forEach(btn => {
        btn.addEventListener("click", closeModal);
    });

    // Form Submissions
    const depositForm = document.getElementById("depositForm");
    if (depositForm) {
        depositForm.addEventListener("submit", handleDepositSubmit);
    }

    const withdrawForm = document.getElementById("withdrawForm");
    if (withdrawForm) {
        withdrawForm.addEventListener("submit", handleWithdrawSubmit);
    }
}

/**
 * Fetch Wallet Data from Firebase / Database
 */
async function loadUserWalletData(userId) {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const db = firebase.firestore();
            
            // Fetch Balance
            const walletDoc = await db.collection("wallets").doc(userId).get();
            if (walletDoc.exists) {
                const data = walletDoc.data();
                walletData.availableBalance = data.balance || 0.00;
                walletData.pendingEscrow = data.escrow || 0.00;
                walletData.totalWithdrawn = data.withdrawn || 0.00;
            }

            // Fetch Recent Transactions
            const transSnap = await db.collection("transactions")
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .limit(10)
                .get();

            walletData.transactions = [];
            transSnap.forEach(doc => {
                walletData.transactions.push({ id: doc.id, ...doc.data() });
            });

            renderWalletBalances();
            renderTransactionHistory();
        }
    } catch (error) {
        console.error("Error loading wallet data:", error);
    }
}

/**
 * Render Balances in UI
 */
function renderWalletBalances() {
    const availableElem = document.getElementById("availableBalance");
    const escrowElem = document.getElementById("pendingEscrow");
    const withdrawnElem = document.getElementById("totalWithdrawn");

    if (availableElem) availableElem.innerText = `$${walletData.availableBalance.toFixed(2)}`;
    if (escrowElem) escrowElem.innerText = `$${walletData.pendingEscrow.toFixed(2)}`;
    if (withdrawnElem) withdrawnElem.innerText = `$${walletData.totalWithdrawn.toFixed(2)}`;
}

/**
 * Render Transaction Table / List
 */
function renderTransactionHistory() {
    const container = document.getElementById("transactionList");
    if (!container) return;

    if (walletData.transactions.length === 0) {
        container.innerHTML = `<tr><td colspan="5" style="text-align:center;">Koi transaction record nahi mila.</td></tr>`;
        return;
    }

    container.innerHTML = walletData.transactions.map(item => `
        <tr>
            <td>${item.id.substring(0, 8)}...</td>
            <td>${item.type}</td>
            <td>$${item.amount.toFixed(2)}</td>
            <td><span class="badge ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>${item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString() : 'N/A'}</td>
        </tr>
    `).join('');
}

/**
 * Modal Handling
 */
function openPaymentModal(type) {
    const modal = document.getElementById(`${type}Modal`);
    if (modal) {
        modal.classList.add("active");
        modal.style.display = "block";
    }
}

function closeModal() {
    const modals = document.querySelectorAll(".modal, .payment-modal");
    modals.forEach(m => {
        m.classList.remove("active");
        m.style.display = "none";
    });
}

/**
 * Handle Deposit Action
 */
async function handleDepositSubmit(e) {
    e.preventDefault();
    const amountInput = document.getElementById("depositAmount");
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Barae meharbani sahi amount darj karein.");
        return;
    }

    alert(`$${amount} ki deposit request process ho rahi hai...`);
    // Connect with Stripe/Paypal API or Firebase Cloud Function here
    closeModal();
}

/**
 * Handle Withdraw Action
 */
async function handleWithdrawSubmit(e) {
    e.preventDefault();
    const amountInput = document.getElementById("withdrawAmount");
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Barae meharbani sahi amount darj karein.");
        return;
    }

    if (amount > walletData.availableBalance) {
        alert("Aap ka balance is withdrawal ke liye kam hai.");
        return;
    }

    alert(`$${amount} ki withdrawal request submit ho gayi hai.`);
    closeModal();
}