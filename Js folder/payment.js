// ======================================
// WorkBee Payment System V2
// Part 1 - Complete Replacement
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const totalBalance =
document.getElementById("totalBalance");

const escrowBalance =
document.getElementById("escrowBalance");

const availableBalance =
document.getElementById("availableBalance");

const withdrawnBalance =
document.getElementById("withdrawnBalance");

const paymentForm =
document.getElementById("paymentForm");

const withdrawForm =
document.getElementById("withdrawForm");

const transactionTable =
document.getElementById("transactionTable");

const escrowContainer =
document.getElementById("escrowContainer");

const refreshTransactions =
document.getElementById("refreshTransactions");

// Payment Form

const projectId =
document.getElementById("projectId");

const freelancerEmail =
document.getElementById("freelancerEmail");

const paymentAmount =
document.getElementById("paymentAmount");

const paymentGateway =
document.getElementById("paymentGateway");

// Withdraw Form

const withdrawAmount =
document.getElementById("withdrawAmount");

const withdrawMethod =
document.getElementById("withdrawMethod");

// ======================================
// Variables
// ======================================

let currentUser = null;

let payments = [];

let escrowPayments = [];

let transactions = [];

let unsubscribePayments = null;

let unsubscribeEscrow = null;

let unsubscribeTransactions = null;

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    initializePaymentSystem();

});

// ======================================
// Initialize
// ======================================

function initializePaymentSystem(){

    loadPayments();

    loadEscrow();

    loadTransactions();

}

// ======================================
// Payments Listener
// ======================================

function loadPayments(){

    if(unsubscribePayments){

        unsubscribePayments();

    }

    const q = query(

        collection(db,"payments"),

        where("clientId","==",currentUser.uid),

        orderBy("createdAt","desc")

    );

    unsubscribePayments = onSnapshot(q,(snapshot)=>{

        payments = [];

        snapshot.forEach((docSnap)=>{

            payments.push({

                id:docSnap.id,

                ...docSnap.data()

            });

        });

        updateDashboard();

    });

}

// ======================================
// Escrow Listener
// ======================================

function loadEscrow(){

    if(unsubscribeEscrow){

        unsubscribeEscrow();

    }

    const q = query(

        collection(db,"escrow"),

        where("clientId","==",currentUser.uid),

        orderBy("createdAt","desc")

    );

    unsubscribeEscrow = onSnapshot(q,(snapshot)=>{

        escrowPayments=[];

        snapshot.forEach((docSnap)=>{

            escrowPayments.push({

                id:docSnap.id,

                ...docSnap.data()

            });

        });

        renderEscrow();

    });

}

// ======================================
// Transaction Listener
// ======================================

function loadTransactions(){

    if(unsubscribeTransactions){

        unsubscribeTransactions();

    }

    const q = query(

        collection(db,"transactions"),

        where("userId","==",currentUser.uid),

        orderBy("createdAt","desc")

    );

    unsubscribeTransactions = onSnapshot(q,(snapshot)=>{

        transactions=[];

        snapshot.forEach((docSnap)=>{

            transactions.push({

                id:docSnap.id,

                ...docSnap.data()

            });

        });

        renderTransactions();

    });

}

// ======================================
// Dashboard Summary
// ======================================

function updateDashboard(){

    let total = 0;

    let escrow = 0;

    let withdrawn = 0;

    payments.forEach(item=>{

        total += Number(item.amount || 0);

    });

    escrowPayments.forEach(item=>{

        if(item.status==="Escrow"){

            escrow += Number(item.amount || 0);

        }

    });

    transactions.forEach(item=>{

        if(item.type==="Withdraw"){

            withdrawn += Number(item.amount || 0);

        }

    });

    const available = total - escrow - withdrawn;

    totalBalance.textContent =
    "$" + total.toFixed(2);

    escrowBalance.textContent =
    "$" + escrow.toFixed(2);

    availableBalance.textContent =
    "$" + available.toFixed(2);

    withdrawnBalance.textContent =
    "$" + withdrawn.toFixed(2);

}

console.log("✅ Payment System Initialized");
// ======================================
// WorkBee Payment System V2
// Part 2 - Create Payment & Escrow
// ======================================

// ======================================
// Make Payment
// ======================================

paymentForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const project = projectId.value.trim();

    const freelancer = freelancerEmail.value.trim().toLowerCase();

    const amount = Number(paymentAmount.value);

    const gateway = paymentGateway.value;

    if (!project || !freelancer || amount <= 0) {

        alert("Please fill all required fields.");

        return;

    }

    try {

        const payBtn =
            document.getElementById("payNowBtn");

        payBtn.disabled = true;

        payBtn.textContent = "Processing...";

        // ==================================
        // Create Payment
        // ==================================

        const paymentRef = await addDoc(

            collection(db, "payments"),

            {

                clientId: currentUser.uid,

                clientEmail: currentUser.email,

                freelancerEmail: freelancer,

                projectId: project,

                amount: amount,

                gateway: gateway,

                status: "Escrow",

                createdAt: serverTimestamp()

            }

        );

        // ==================================
        // Create Escrow Record
        // ==================================

        await addDoc(

            collection(db, "escrow"),

            {

                paymentId: paymentRef.id,

                clientId: currentUser.uid,

                freelancerEmail: freelancer,

                projectId: project,

                amount: amount,

                status: "Escrow",

                released: false,

                createdAt: serverTimestamp()

            }

        );

        // ==================================
        // Create Transaction
        // ==================================

        await addDoc(

            collection(db, "transactions"),

            {

                userId: currentUser.uid,

                paymentId: paymentRef.id,

                projectId: project,

                type: "Payment",

                gateway: gateway,

                amount: amount,

                status: "Completed",

                createdAt: serverTimestamp()

            }

        );

        alert(
            "Payment created successfully.\nFunds are now held in Escrow."
        );

        paymentForm.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        const payBtn =
            document.getElementById("payNowBtn");

        payBtn.disabled = false;

        payBtn.textContent =
            "💳 Pay & Hold in Escrow";

    }

});

// ======================================
// Refresh Transactions
// ======================================

refreshTransactions.addEventListener("click", () => {

    loadTransactions();

    loadPayments();

    loadEscrow();

});

// ======================================
// Helper
// ======================================

function formatCurrency(value) {

    return "$" + Number(value).toFixed(2);

}

console.log("✅ Payment Creation Ready");
// ======================================
// WorkBee Payment System V2
// Part 3 - Render Escrow & Transactions
// ======================================

// ======================================
// Render Escrow Cards
// ======================================

function renderEscrow() {

    escrowContainer.innerHTML = "";

    if (escrowPayments.length === 0) {

        escrowContainer.innerHTML = `

            <div class="empty-state">

                <h3>No Escrow Payments</h3>

                <p>
                    Payments held in escrow will appear here.
                </p>

            </div>

        `;

        return;

    }

    escrowPayments.forEach(item => {

        escrowContainer.innerHTML += `

            <div class="escrow-card">

                <div class="escrow-info">

                    <h3>

                        Project #${item.projectId}

                    </h3>

                    <p>

                        Freelancer:
                        ${item.freelancerEmail}

                    </p>

                    <p>

                        Payment ID:
                        ${item.paymentId}

                    </p>

                    <p>

                        Status:
                        <span class="status escrow">

                            ${item.status}

                        </span>

                    </p>

                </div>

                <div>

                    <div class="escrow-amount">

                        ${formatCurrency(item.amount)}

                    </div>

                </div>

            </div>

        `;

    });

}

// ======================================
// Render Transactions
// ======================================

function renderTransactions() {

    transactionTable.innerHTML = "";

    if (transactions.length === 0) {

        transactionTable.innerHTML = `

            <tr>

                <td colspan="6">

                    No Transactions Found

                </td>

            </tr>

        `;

        return;

    }

    transactions.forEach(item => {

        transactionTable.innerHTML += `

            <tr>

                <td>

                    ${formatDate(item.createdAt)}

                </td>

                <td>

                    ${item.projectId || "-"}

                </td>

                <td>

                    ${item.gateway || "-"}

                </td>

                <td>

                    ${formatCurrency(item.amount)}

                </td>

                <td>

                    <span class="status ${getStatusClass(item.status)}">

                        ${item.status}

                    </span>

                </td>

                <td>

                    <button

                        class="action-btn view"

                        onclick="viewTransaction('${item.id}')">

                        View

                    </button>

                </td>

            </tr>

        `;

    });

}

// ======================================
// Status Class
// ======================================

function getStatusClass(status){

    switch(status){

        case "Completed":

            return "completed";

        case "Escrow":

            return "escrow";

        case "Pending":

            return "pending";

        case "Refunded":

            return "refunded";

        case "Failed":

            return "failed";

        default:

            return "pending";

    }

}

// ======================================
// Date Formatter
// ======================================

function formatDate(timestamp){

    if(!timestamp) return "-";

    if(!timestamp.toDate) return "-";

    return timestamp

        .toDate()

        .toLocaleDateString(

            "en-US",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

}

// ======================================
// View Transaction
// ======================================

window.viewTransaction = function(id){

    const tx =

        transactions.find(

            item=>item.id===id

        );

    if(!tx){

        alert("Transaction not found.");

        return;

    }

    alert(

`Transaction Details

Project : ${tx.projectId}

Amount : ${formatCurrency(tx.amount)}

Gateway : ${tx.gateway}

Status : ${tx.status}`

    );

}

console.log("✅ Transactions Loaded Successfully");
// ======================================
// WorkBee Payment System V2
// Part 4 - Release & Refund
// ======================================

import {
    doc,
    updateDoc,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Release Escrow Payment
// ======================================

window.releasePayment = async function(paymentId){

    const escrow = escrowPayments.find(

        item => item.paymentId === paymentId

    );

    if(!escrow){

        alert("Escrow record not found.");

        return;

    }

    const ok = confirm(

        "Release this payment to the freelancer?"

    );

    if(!ok) return;

    try{

        // Update Escrow

        await updateDoc(

            doc(db,"escrow",escrow.id),

            {

                status:"Released",

                released:true,

                releasedAt:serverTimestamp()

            }

        );

        // Update Payment

        await updateDoc(

            doc(db,"payments",paymentId),

            {

                status:"Completed"

            }

        );

        // Transaction Record

        await addDoc(

            collection(db,"transactions"),

            {

                userId:currentUser.uid,

                paymentId:paymentId,

                projectId:escrow.projectId,

                type:"Release",

                gateway:"Escrow",

                amount:escrow.amount,

                status:"Completed",

                createdAt:serverTimestamp()

            }

        );

        alert(

            "Payment released successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Refund Payment
// ======================================

window.refundPayment = async function(paymentId){

    const escrow = escrowPayments.find(

        item => item.paymentId === paymentId

    );

    if(!escrow){

        alert("Escrow record not found.");

        return;

    }

    const ok = confirm(

        "Refund this payment to the client?"

    );

    if(!ok) return;

    try{

        // Update Escrow

        await updateDoc(

            doc(db,"escrow",escrow.id),

            {

                status:"Refunded",

                refunded:true,

                refundedAt:serverTimestamp()

            }

        );

        // Update Payment

        await updateDoc(

            doc(db,"payments",paymentId),

            {

                status:"Refunded"

            }

        );

        // Transaction Record

        await addDoc(

            collection(db,"transactions"),

            {

                userId:currentUser.uid,

                paymentId:paymentId,

                projectId:escrow.projectId,

                type:"Refund",

                gateway:"Escrow",

                amount:escrow.amount,

                status:"Refunded",

                createdAt:serverTimestamp()

            }

        );

        alert(

            "Refund completed successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Escrow Action Buttons
// ======================================

function escrowActions(item){

    if(item.status==="Escrow"){

        return `

            <button
                class="action-btn release"
                onclick="releasePayment('${item.paymentId}')">

                Release

            </button>

            <button
                class="action-btn refund"
                onclick="refundPayment('${item.paymentId}')">

                Refund

            </button>

        `;

    }

    return `
        <span class="status completed">

            ${item.status}

        </span>
    `;

}

console.log("✅ Release & Refund Module Ready");
// ======================================
// WorkBee Payment System V2
// Part 5 - Withdraw Funds & Notifications
// ======================================

// ======================================
// Withdraw Balance
// ======================================

withdrawForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const amount = Number(withdrawAmount.value);

    const method = withdrawMethod.value;

    const available = Number(
        availableBalance.textContent.replace("$","")
    );

    if(amount <= 0){

        alert("Enter a valid amount.");

        return;

    }

    if(amount > available){

        alert("Insufficient available balance.");

        return;

    }

    try{

        const withdrawBtn =
        document.getElementById("withdrawBtn");

        withdrawBtn.disabled = true;

        withdrawBtn.textContent =
        "Processing...";

        // ==================================
        // Save Withdraw Transaction
        // ==================================

        await addDoc(

            collection(db,"transactions"),

            {

                userId:currentUser.uid,

                type:"Withdraw",

                gateway:method,

                amount:amount,

                status:"Pending",

                createdAt:serverTimestamp()

            }

        );

        // ==================================
        // Notification
        // ==================================

        await addDoc(

            collection(db,"notifications"),

            {

                userId:currentUser.uid,

                title:"Withdraw Request",

                message:

                `Your withdrawal request of $${amount.toFixed(2)} via ${method} has been submitted.`,

                type:"payment",

                read:false,

                createdAt:serverTimestamp()

            }

        );

        alert(

            "Withdraw request submitted successfully."

        );

        withdrawForm.reset();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    finally{

        const withdrawBtn =
        document.getElementById("withdrawBtn");

        withdrawBtn.disabled = false;

        withdrawBtn.textContent =
        "💵 Withdraw Balance";

    }

});

// ======================================
// Wallet Summary
// ======================================

function walletSummary(){

    let income = 0;

    let withdrawn = 0;

    let escrow = 0;

    payments.forEach(item=>{

        income += Number(item.amount || 0);

    });

    escrowPayments.forEach(item=>{

        if(item.status==="Escrow"){

            escrow += Number(item.amount || 0);

        }

    });

    transactions.forEach(item=>{

        if(item.type==="Withdraw"){

            withdrawn += Number(item.amount || 0);

        }

    });

    return{

        total:income,

        escrow,

        withdrawn,

        available:

        income - escrow - withdrawn

    };

}

// ======================================
// Refresh Dashboard
// ======================================

function refreshWallet(){

    const wallet = walletSummary();

    totalBalance.textContent =
    formatCurrency(wallet.total);

    escrowBalance.textContent =
    formatCurrency(wallet.escrow);

    withdrawnBalance.textContent =
    formatCurrency(wallet.withdrawn);

    availableBalance.textContent =
    formatCurrency(wallet.available);

}

// ======================================
// Auto Refresh Wallet
// ======================================

setInterval(()=>{

    refreshWallet();

},5000);

console.log("✅ Wallet Module Ready");
// ======================================
// WorkBee Payment System V2
// Part 6 - Production Final
// ======================================

// ======================================
// Cleanup Firestore Listeners
// ======================================

function cleanupPaymentSystem(){

    if(unsubscribePayments){

        unsubscribePayments();

        unsubscribePayments = null;

    }

    if(unsubscribeEscrow){

        unsubscribeEscrow();

        unsubscribeEscrow = null;

    }

    if(unsubscribeTransactions){

        unsubscribeTransactions();

        unsubscribeTransactions = null;

    }

    console.log("Payment listeners stopped.");

}

// ======================================
// Page Cleanup
// ======================================

window.addEventListener(

    "beforeunload",

    cleanupPaymentSystem

);

window.addEventListener(

    "pagehide",

    cleanupPaymentSystem

);

// ======================================
// Online / Offline Events
// ======================================

window.addEventListener("online",()=>{

    console.log("Internet Connected");

    loadPayments();

    loadEscrow();

    loadTransactions();

});

window.addEventListener("offline",()=>{

    console.log("Internet Disconnected");

});

// ======================================
// Dashboard Auto Refresh
// ======================================

function refreshDashboard(){

    updateDashboard();

    renderEscrow();

    renderTransactions();

}

// Refresh every 30 seconds
setInterval(()=>{

    refreshDashboard();

},30000);

// ======================================
// Currency Formatter
// ======================================

function formatMoney(amount){

    return new Intl.NumberFormat(

        "en-US",

        {

            style:"currency",

            currency:"USD"

        }

    ).format(Number(amount||0));

}

// ======================================
// Export Helpers (Optional)
// ======================================

window.paymentHelpers={

    formatMoney,

    refreshDashboard,

    walletSummary

};

// ======================================
// Production Ready Logs
// ======================================

console.log("====================================");

console.log("🐝 WorkBee Payment System V2");

console.log("Production Build");

console.log("Firebase Auth Enabled");

console.log("Realtime Firestore Enabled");

console.log("Escrow Module Enabled");

console.log("Wallet Module Enabled");

console.log("Withdraw Module Enabled");

console.log("Transactions Enabled");

console.log("Performance Optimized");

console.log("Version 2.0");

console.log("====================================");