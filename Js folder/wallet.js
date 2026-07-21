// ======================================
// WorkBee Wallet V2
// Part 1 - Complete Replacement
// ======================================

// Firebase Config
import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM
// ======================================

const availableBalance =
document.getElementById("availableBalance");

const pendingBalance =
document.getElementById("pendingBalance");

const escrowBalance =
document.getElementById("escrowBalance");

const totalEarnings =
document.getElementById("totalEarnings");

const paidProjects =
document.getElementById("paidProjects");

const withdrawCount =
document.getElementById("withdrawCount");

const depositCount =
document.getElementById("depositCount");

const escrowCount =
document.getElementById("escrowCount");

const transactionTable =
document.getElementById("transactionTable");

// ======================================
// Variables
// ======================================

let currentUser = null;

let walletData = {

    available:0,
    pending:0,
    escrow:0,
    earnings:0,

    deposits:0,
    withdrawals:0,
    projects:0,
    activeEscrow:0

};

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="login.html";
        return;

    }

    currentUser=user;

    await initializeWallet();

});

// ======================================
// Initialize Wallet
// ======================================

async function initializeWallet(){

    await loadWallet();

    loadTransactions();

    console.log("💰 Wallet Ready");

}

// ======================================
// Load Wallet
// ======================================

async function loadWallet(){

    const ref=doc(

        db,
        "wallets",
        currentUser.uid

    );

    const snap=await getDoc(ref);

    if(!snap.exists()){

        await setDoc(ref,{

            available:0,
            pending:0,
            escrow:0,
            earnings:0,

            deposits:0,
            withdrawals:0,
            projects:0,
            activeEscrow:0,

            createdAt:serverTimestamp()

        });

        return loadWallet();

    }

    walletData=snap.data();

    updateWalletUI();

}

// ======================================
// Update Dashboard
// ======================================

function updateWalletUI(){

    availableBalance.textContent=

        "$"+Number(

            walletData.available

        ).toFixed(2);

    pendingBalance.textContent=

        "$"+Number(

            walletData.pending

        ).toFixed(2);

    escrowBalance.textContent=

        "$"+Number(

            walletData.escrow

        ).toFixed(2);

    totalEarnings.textContent=

        "$"+Number(

            walletData.earnings

        ).toFixed(2);

    paidProjects.textContent=

        walletData.projects || 0;

    withdrawCount.textContent=

        walletData.withdrawals || 0;

    depositCount.textContent=

        walletData.deposits || 0;

    escrowCount.textContent=

        walletData.activeEscrow || 0;

}

// ======================================
// Load Transactions
// ======================================

function loadTransactions(){

    const q=query(

        collection(db,"transactions"),

        where(

            "userId",

            "==",

            currentUser.uid

        ),

        orderBy(

            "createdAt",

            "desc"

        )

    );

    onSnapshot(q,(snapshot)=>{

        transactionTable.innerHTML="";

        if(snapshot.empty){

            transactionTable.innerHTML=`

            <tr>

            <td colspan="5">

            No Transactions Found

            </td>

            </tr>

            `;

            return;

        }

        snapshot.forEach(doc=>{

            renderTransaction(doc.data());

        });

    });

}

// ======================================
// Render Transaction
// ======================================

function renderTransaction(data){

    transactionTable.innerHTML += `

<tr>

<td>${formatDate(data.createdAt)}</td>

<td>${capitalize(data.type)}</td>

<td>$${Number(data.amount).toFixed(2)}</td>

<td>

<span class="status ${data.status}">

${capitalize(data.status)}

</span>

</td>

<td>${data.reference || "-"}</td>

</tr>

`;

}

// ======================================
// Helpers
// ======================================

function capitalize(text){

    if(!text) return "";

    return text.charAt(0).toUpperCase()

    + text.slice(1);

}

function formatDate(timestamp){

    if(!timestamp) return "-";

    try{

        return timestamp

        .toDate()

        .toLocaleDateString();

    }

    catch{

        return "-";

    }

}

console.log("✅ wallet.js Part 1 Loaded");
// ======================================
// WorkBee Wallet V2
// Part 2 - Deposit, Withdraw & Escrow
// ======================================

import {
    addDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

const depositModal = document.getElementById("depositModal");
const withdrawModal = document.getElementById("withdrawModal");

const confirmDeposit = document.getElementById("confirmDeposit");
const cancelDeposit = document.getElementById("cancelDeposit");

const confirmWithdraw = document.getElementById("confirmWithdraw");
const cancelWithdraw = document.getElementById("cancelWithdraw");

const escrowProjects =
document.getElementById("escrowProjects");

// ======================================
// Deposit Modal
// ======================================

depositBtn.onclick=()=>{

    depositModal.classList.remove("hidden");

};

cancelDeposit.onclick=()=>{

    depositModal.classList.add("hidden");

};

// ======================================
// Withdraw Modal
// ======================================

withdrawBtn.onclick=()=>{

    withdrawModal.classList.remove("hidden");

};

cancelWithdraw.onclick=()=>{

    withdrawModal.classList.add("hidden");

};

// ======================================
// Deposit
// ======================================

confirmDeposit.onclick=async()=>{

    const amount=

    Number(

        document.getElementById("depositAmount").value

    );

    const method=

    document.getElementById("depositMethod").value;

    if(amount<=0){

        alert("Enter valid amount.");

        return;

    }

    await addDoc(

        collection(db,"transactions"),

        {

            userId:currentUser.uid,

            type:"deposit",

            amount,

            method,

            status:"pending",

            reference:

            "DEP-"+Date.now(),

            createdAt:serverTimestamp()

        }

    );

    alert(

        "Deposit request submitted."

    );

    depositModal.classList.add("hidden");

};

// ======================================
// Withdraw
// ======================================

confirmWithdraw.onclick=async()=>{

    const amount=

    Number(

        document.getElementById("withdrawAmount").value

    );

    const method=

    document.getElementById("withdrawMethod").value;

    if(amount<=0){

        alert("Enter valid amount.");

        return;

    }

    if(amount>walletData.available){

        alert(

            "Insufficient balance."

        );

        return;

    }

    await addDoc(

        collection(db,"transactions"),

        {

            userId:currentUser.uid,

            type:"withdraw",

            amount,

            method,

            status:"pending",

            reference:

            "WD-"+Date.now(),

            createdAt:serverTimestamp()

        }

    );

    alert(

        "Withdrawal request submitted."

    );

    withdrawModal.classList.add("hidden");

};

// ======================================
// Escrow Projects
// ======================================

function loadEscrowProjects(){

    const q=query(

        collection(db,"projects"),

        where(

            "freelancerId",

            "==",

            currentUser.uid

        ),

        where(

            "paymentStatus",

            "==",

            "escrow"

        )

    );

    onSnapshot(q,(snapshot)=>{

        escrowProjects.innerHTML="";

        if(snapshot.empty){

            escrowProjects.innerHTML=`

            <div class="empty-card">

            No Active Escrow Projects

            </div>

            `;

            return;

        }

        snapshot.forEach(doc=>{

            const project=doc.data();

            escrowProjects.innerHTML += `

            <div class="wallet-card">

                <h3>${project.title}</h3>

                <p>

                Client:

                ${project.clientName}

                </p>

                <h2>

                $${Number(project.budget).toFixed(2)}

                </h2>

                <span>

                Funds Protected in Escrow

                </span>

            </div>

            `;

        });

    });

}

// ======================================
// Refresh Wallet
// ======================================

async function refreshWallet(){

    await loadWallet();

}

// ======================================
// Auto Refresh
// ======================================

setInterval(()=>{

    refreshWallet();

},30000);

// ======================================
// Initialize Escrow
// ======================================

loadEscrowProjects();

console.log("💰 Wallet Part 2 Loaded");
// ======================================
// WorkBee Wallet V2
// Part 3 - AI Fraud Detection & Analytics
// ======================================

// ======================================
// DOM
// ======================================

const fraudAlert =
document.getElementById("fraudAlert");

const transactionFilter =
document.getElementById("transactionFilter");

const chartCanvas =
document.getElementById("earningsChart");

// ======================================
// AI Fraud Detection
// ======================================

function detectFraud(type, amount){

    let riskScore = 0;

    if(type === "withdraw" && amount >= 1000){

        riskScore += 40;

    }

    if(type === "deposit" && amount >= 5000){

        riskScore += 30;

    }

    if(type === "withdraw" && amount > walletData.available){

        riskScore += 80;

    }

    return {

        suspicious: riskScore >= 50,

        riskScore

    };

}

// ======================================
// Fraud Alert
// ======================================

function showFraudAlert(message){

    if(!fraudAlert) return;

    fraudAlert.innerHTML = `
        ⚠ <strong>AI Security Alert</strong><br>
        ${message}
    `;

    fraudAlert.classList.remove("hidden");

}

function hideFraudAlert(){

    if(!fraudAlert) return;

    fraudAlert.classList.add("hidden");

}

// ======================================
// Deposit Validation
// ======================================

const oldDepositHandler = confirmDeposit.onclick;

confirmDeposit.onclick = async()=>{

    const amount = Number(

        document.getElementById("depositAmount").value

    );

    const fraud = detectFraud("deposit", amount);

    if(fraud.suspicious){

        showFraudAlert(

            "Large deposit detected. Manual verification may be required."

        );

    }else{

        hideFraudAlert();

    }

    await oldDepositHandler();

};

// ======================================
// Withdraw Validation
// ======================================

const oldWithdrawHandler = confirmWithdraw.onclick;

confirmWithdraw.onclick = async()=>{

    const amount = Number(

        document.getElementById("withdrawAmount").value

    );

    const fraud = detectFraud("withdraw", amount);

    if(fraud.suspicious){

        showFraudAlert(

            "High-risk withdrawal detected."

        );

    }else{

        hideFraudAlert();

    }

    await oldWithdrawHandler();

};

// ======================================
// Transaction Filter
// ======================================

if(transactionFilter){

transactionFilter.addEventListener(

"change",

()=>{

const filter =

transactionFilter.value;

document

.querySelectorAll(

"#transactionTable tr"

)

.forEach(row=>{

if(filter==="all"){

row.style.display="";

return;

}

const typeCell=

row.children[1];

if(!typeCell) return;

const type=

typeCell.innerText

.toLowerCase();

row.style.display=

type.includes(filter)

?

""

:

"none";

});

});

}

// ======================================
// Wallet Analytics
// ======================================

function walletAnalytics(){

    console.table({

        Available: walletData.available,

        Pending: walletData.pending,

        Escrow: walletData.escrow,

        Earnings: walletData.earnings,

        Deposits: walletData.deposits,

        Withdrawals: walletData.withdrawals

    });

}

// ======================================
// Earnings Chart Placeholder
// ======================================

function initializeChart(){

    if(!chartCanvas) return;

    const ctx =

    chartCanvas.getContext("2d");

    ctx.clearRect(

        0,

        0,

        chartCanvas.width,

        chartCanvas.height

    );

    ctx.fillStyle="#64748b";

    ctx.font="18px Poppins";

    ctx.fillText(

        "Monthly Earnings Chart",

        30,

        60

    );

    ctx.fillStyle="#facc15";

    ctx.fillRect(40,180,50,-80);

    ctx.fillRect(120,180,50,-120);

    ctx.fillRect(200,180,50,-60);

    ctx.fillRect(280,180,50,-150);

    ctx.fillRect(360,180,50,-110);

}

// ======================================
// Auto Analytics
// ======================================

setInterval(()=>{

    walletAnalytics();

},60000);

// ======================================
// Initialize
// ======================================

initializeChart();

console.log("💰 Wallet Part 3 Loaded");
// ======================================
// WorkBee Wallet V2
// Part 4 - Production Final
// ======================================

import {
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Export Transactions CSV
// ======================================

function exportTransactionsCSV(){

    const rows=[];

    rows.push([
        "Date",
        "Type",
        "Amount",
        "Status",
        "Reference"
    ]);

    document
    .querySelectorAll("#transactionTable tr")
    .forEach(row=>{

        const cols=row.querySelectorAll("td");

        if(cols.length!==5) return;

        rows.push([

            cols[0].innerText,
            cols[1].innerText,
            cols[2].innerText,
            cols[3].innerText,
            cols[4].innerText

        ]);

    });

    const csv=rows
    .map(r=>r.join(","))
    .join("\n");

    const blob=new Blob([csv],{

        type:"text/csv"

    });

    const url=

    URL.createObjectURL(blob);

    const a=

    document.createElement("a");

    a.href=url;

    a.download="workbee-transactions.csv";

    a.click();

    URL.revokeObjectURL(url);

}

// ======================================
// Escrow Release
// ======================================

async function releaseEscrow(

projectId,

amount

){

    try{

        const batch=

        writeBatch(db);

        const walletRef=

        doc(

            db,

            "wallets",

            currentUser.uid

        );

        batch.update(

            walletRef,

            {

                escrow:increment(-amount),

                available:increment(amount),

                earnings:increment(amount),

                activeEscrow:increment(-1),

                projects:increment(1)

            }

        );

        const projectRef=

        doc(

            db,

            "projects",

            projectId

        );

        batch.update(

            projectRef,

            {

                paymentStatus:"released",

                releasedAt:

                serverTimestamp()

            }

        );

        await batch.commit();

        alert(

            "Escrow released successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to release escrow."

        );

    }

}

// ======================================
// Admin Notification
// ======================================

async function notifyAdmin(

type,

message

){

    try{

        await addDoc(

            collection(

                db,

                "admin_notifications"

            ),

            {

                type,

                message,

                userId:

                currentUser.uid,

                email:

                currentUser.email,

                createdAt:

                serverTimestamp(),

                read:false

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Fraud Escalation
// ======================================

function escalateFraud(

risk,

message

){

    if(risk<50) return;

    showFraudAlert(message);

    notifyAdmin(

        "wallet_fraud",

        message

    );

}

// ======================================
// Safe Async Wrapper
// ======================================

async function safeExecute(task){

    try{

        await task();

    }

    catch(error){

        console.error(error);

        alert(

            "Unexpected error occurred."

        );

    }

}

// ======================================
// Performance
// ======================================

window.addEventListener(

"visibilitychange",

()=>{

    if(document.hidden){

        console.log(

            "Wallet paused."

        );

    }else{

        refreshWallet();

    }

});

// ======================================
// Cleanup
// ======================================

window.addEventListener(

"beforeunload",

()=>{

    console.log(

        "Wallet session ended."

    );

});

// ======================================
// Global Helpers
// ======================================

window.exportTransactionsCSV=

exportTransactionsCSV;

window.releaseEscrow=

releaseEscrow;

// ======================================
// Production Ready
// ======================================

console.log(
"🚀 WorkBee Wallet Production Ready");