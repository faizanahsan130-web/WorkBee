// ======================================
// WorkBee Admin Payments V2
// Part 1 - Complete Replacement
// ======================================

// ======================================
// Firebase
// ======================================

import { auth, db }
from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

// Statistics

const totalPayments =
document.getElementById("totalPayments");

const escrowBalance =
document.getElementById("escrowBalance");

const completedPayments =
document.getElementById("completedPayments");

const refundRequests =
document.getElementById("refundRequests");

// Table

const paymentsTableBody =
document.getElementById("paymentsTableBody");

// Search & Filters

const searchPayment =
document.getElementById("searchPayment");

const statusFilter =
document.getElementById("statusFilter");

const methodFilter =
document.getElementById("methodFilter");

// Buttons

const refreshPayments =
document.getElementById("refreshPayments");

// ======================================
// Variables
// ======================================

let currentAdmin = null;

let payments = [];

let filteredPayments = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentAdmin = user;

    await verifyAdmin();

    initializePayments();

});

// ======================================
// Verify Admin
// ======================================

async function verifyAdmin(){

    const q = query(

        collection(db,"users"),

        where("email","==",currentAdmin.email),

        where("role","==","admin")

    );

    const snapshot =
    await getDocs(q);

    if(snapshot.empty){

        alert("Access Denied");

        window.location.href="client-dashboard.html";

        return;

    }

}

// ======================================
// Initialize
// ======================================

function initializePayments(){

    listenPayments();

    initializeSearch();

    initializeFilters();

    if(refreshPayments){

        refreshPayments.onclick=()=>{

            listenPayments();

        };

    }

}

// ======================================
// Realtime Payments
// ======================================

function listenPayments(){

    onSnapshot(

        collection(db,"payments"),

        snapshot=>{

            payments=[];

            snapshot.forEach(doc=>{

                payments.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            filteredPayments=[...payments];

            updateStatistics();

            renderPayments();

        }

    );

}

// ======================================
// Statistics
// ======================================

function updateStatistics(){

    totalPayments.textContent =

    payments.length;

    completedPayments.textContent =

    payments.filter(

        payment=>

        payment.status==="Completed"

    ).length;

    refundRequests.textContent =

    payments.filter(

        payment=>

        payment.status==="Refund Requested"

    ).length;

    let escrow = 0;

    payments.forEach(payment=>{

        if(payment.status==="Escrow"){

            escrow +=

            Number(payment.amount || 0);

        }

    });

    escrowBalance.textContent =

    "$"+

    escrow.toLocaleString();

}

// ======================================
// Render Table
// ======================================

function renderPayments(){

    paymentsTableBody.innerHTML="";

    if(filteredPayments.length===0){

        paymentsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

No Payments Found

</td>

</tr>

`;

        return;

    }

    filteredPayments.forEach(payment=>{

        paymentsTableBody.innerHTML += `

<tr>

<td>

${payment.id}

</td>

<td class="client-name">

${payment.clientName || "-"}

</td>

<td class="freelancer-name">

${payment.freelancerName || "-"}

</td>

<td class="payment-amount">

$${payment.amount || 0}

</td>

<td class="payment-method">

${payment.method || "-"}

</td>

<td>

<span class="badge badge-${(payment.status || "pending").toLowerCase().replace(/\s/g,"-")}">

${payment.status || "Pending"}

</span>

</td>

<td>

${payment.createdAt || "-"}

</td>

<td>

<div class="action-group">

<button
class="btn-view"
data-id="${payment.id}">

View

</button>

<button
class="btn-release"
data-id="${payment.id}">

Release

</button>

<button
class="btn-refund"
data-id="${payment.id}">

Refund

</button>

<button
class="btn-delete"
data-id="${payment.id}">

Delete

</button>

</div>

</td>

</tr>

`;

    });

}

// ======================================
// Search
// ======================================

function initializeSearch(){

    searchPayment.addEventListener(

        "input",

        applyFilters

    );

}

// ======================================
// Filters
// ======================================

function initializeFilters(){

    statusFilter.addEventListener(

        "change",

        applyFilters

    );

    methodFilter.addEventListener(

        "change",

        applyFilters

    );

}

// ======================================
// Apply Filters
// ======================================

function applyFilters(){

    const keyword =

    searchPayment.value

    .toLowerCase()

    .trim();

    const status =

    statusFilter.value;

    const method =

    methodFilter.value;

    filteredPayments =

    payments.filter(payment=>{

        const searchMatch =

        (payment.clientName || "")

        .toLowerCase()

        .includes(keyword)

        ||

        (payment.freelancerName || "")

        .toLowerCase()

        .includes(keyword)

        ||

        payment.id

        .toLowerCase()

        .includes(keyword);

        const statusMatch =

        status==="All"

        ||

        payment.status===status;

        const methodMatch =

        method==="All"

        ||

        payment.method===method;

        return(

            searchMatch

            &&

            statusMatch

            &&

            methodMatch

        );

    });

    renderPayments();

}

// ======================================
// Final
// ======================================

console.log(

"✅ Admin Payments Part 1 Loaded"

);
// ======================================
// WorkBee Admin Payments V2
// Part 2 - Pagination, Modal & Actions
// ======================================

import {
    doc,
    updateDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const paymentModal =
document.getElementById("paymentModal");

const paymentDetails =
document.getElementById("paymentDetails");

const closePaymentModal =
document.getElementById("closePaymentModal");

const releaseModal =
document.getElementById("releaseModal");

const refundModal =
document.getElementById("refundModal");

const deleteModal =
document.getElementById("deleteModal");

const confirmRelease =
document.getElementById("confirmRelease");

const cancelRelease =
document.getElementById("cancelRelease");

const confirmRefund =
document.getElementById("confirmRefund");

const cancelRefund =
document.getElementById("cancelRefund");

const confirmDelete =
document.getElementById("confirmDelete");

const cancelDelete =
document.getElementById("cancelDelete");

const prevPage =
document.getElementById("prevPage");

const nextPage =
document.getElementById("nextPage");

const pageInfo =
document.getElementById("pageInfo");

// ======================================
// Variables
// ======================================

let selectedPaymentId = null;

let currentPage = 1;

const paymentsPerPage = 10;

// ======================================
// Render Payments (Updated)
// ======================================

function renderPayments(){

    paymentsTableBody.innerHTML="";

    const start =
    (currentPage-1) *
    paymentsPerPage;

    const end =
    start +
    paymentsPerPage;

    const pagePayments =
    filteredPayments.slice(
        start,
        end
    );

    if(pagePayments.length===0){

        paymentsTableBody.innerHTML=`

<tr>

<td colspan="8"
class="loading">

No Payments Found

</td>

</tr>

`;

        updatePagination();

        return;

    }

    pagePayments.forEach(payment=>{

        paymentsTableBody.innerHTML += `

<tr>

<td>${payment.id}</td>

<td class="client-name">
${payment.clientName || "-"}
</td>

<td class="freelancer-name">
${payment.freelancerName || "-"}
</td>

<td class="payment-amount">
$${payment.amount || 0}
</td>

<td class="payment-method">
${payment.method || "-"}
</td>

<td>

<span class="badge badge-${(payment.status || "pending").toLowerCase().replace(/\s/g,"-")}">

${payment.status || "Pending"}

</span>

</td>

<td>

${payment.createdAt || "-"}

</td>

<td>

<div class="action-group">

<button
class="btn-view"
data-id="${payment.id}">

View

</button>

<button
class="btn-release"
data-id="${payment.id}">

Release

</button>

<button
class="btn-refund"
data-id="${payment.id}">

Refund

</button>

<button
class="btn-delete"
data-id="${payment.id}">

Delete

</button>

</div>

</td>

</tr>

`;

    });

    updatePagination();

    attachButtons();

}

// ======================================
// Pagination
// ======================================

function updatePagination(){

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredPayments.length /
            paymentsPerPage
        )
    );

    pageInfo.textContent =
    `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled =
    currentPage===1;

    nextPage.disabled =
    currentPage===totalPages;

}

prevPage.onclick=()=>{

    if(currentPage>1){

        currentPage--;

        renderPayments();

    }

};

nextPage.onclick=()=>{

    const totalPages =
    Math.ceil(
        filteredPayments.length /
        paymentsPerPage
    );

    if(currentPage<totalPages){

        currentPage++;

        renderPayments();

    }

};

// ======================================
// Button Events
// ======================================

function attachButtons(){

document
.querySelectorAll(".btn-view")
.forEach(btn=>{

btn.onclick=()=>{

showPayment(btn.dataset.id);

};

});

document
.querySelectorAll(".btn-release")
.forEach(btn=>{

btn.onclick=()=>{

selectedPaymentId =
btn.dataset.id;

releaseModal.classList.remove("hidden");

};

});

document
.querySelectorAll(".btn-refund")
.forEach(btn=>{

btn.onclick=()=>{

selectedPaymentId =
btn.dataset.id;

refundModal.classList.remove("hidden");

};

});

document
.querySelectorAll(".btn-delete")
.forEach(btn=>{

btn.onclick=()=>{

selectedPaymentId =
btn.dataset.id;

deleteModal.classList.remove("hidden");

};

});

}

// ======================================
// Payment Details
// ======================================

function showPayment(id){

const payment =
payments.find(
p=>p.id===id
);

if(!payment) return;

paymentDetails.innerHTML = `

<h2>

Payment #${payment.id}

</h2>

<hr>

<p>

<strong>Client:</strong>

${payment.clientName || "-"}

</p>

<p>

<strong>Freelancer:</strong>

${payment.freelancerName || "-"}

</p>

<p>

<strong>Amount:</strong>

$${payment.amount || 0}

</p>

<p>

<strong>Method:</strong>

${payment.method || "-"}

</p>

<p>

<strong>Status:</strong>

${payment.status || "-"}

</p>

<p>

<strong>Date:</strong>

${payment.createdAt || "-"}

</p>

`;

paymentModal.classList.remove("hidden");

}

closePaymentModal.onclick=()=>{

paymentModal.classList.add("hidden");

};

// ======================================
// Release Escrow
// ======================================

confirmRelease.onclick = async()=>{

if(!selectedPaymentId) return;

await updateDoc(

doc(
db,
"payments",
selectedPaymentId
),

{

status:"Completed"

}

);

releaseModal.classList.add("hidden");

selectedPaymentId = null;

};

// ======================================
// Refund
// ======================================

confirmRefund.onclick = async()=>{

if(!selectedPaymentId) return;

await updateDoc(

doc(
db,
"payments",
selectedPaymentId
),

{

status:"Refunded"

}

);

refundModal.classList.add("hidden");

selectedPaymentId = null;

};

// ======================================
// Delete
// ======================================

confirmDelete.onclick = async()=>{

if(!selectedPaymentId) return;

await deleteDoc(

doc(
db,
"payments",
selectedPaymentId
)

);

deleteModal.classList.add("hidden");

selectedPaymentId = null;

};

// ======================================
// Cancel Buttons
// ======================================

cancelRelease.onclick=()=>{

releaseModal.classList.add("hidden");

};

cancelRefund.onclick=()=>{

refundModal.classList.add("hidden");

};

cancelDelete.onclick=()=>{

deleteModal.classList.add("hidden");

};

console.log("✅ Admin Payments Part 2 Loaded");
// ======================================
// WorkBee Admin Payments V2
// Part 3 - Analytics, CSV & AI Fraud
// ======================================

import {
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Export CSV
// ======================================

const exportPayments =
document.getElementById("exportPayments");

if(exportPayments){

exportPayments.onclick=()=>{

let csv=

"ID,Client,Freelancer,Amount,Method,Status,Date\n";

payments.forEach(payment=>{

csv +=

`${payment.id},
${payment.clientName || ""},
${payment.freelancerName || ""},
${payment.amount || 0},
${payment.method || ""},
${payment.status || ""},
${payment.createdAt || ""}\n`;

});

const blob=

new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=

"workbee-payments.csv";

a.click();

};

}

// ======================================
// Activity Log
// ======================================

async function logPaymentAction(

action,

paymentId

){

try{

await addDoc(

collection(

db,

"activityLogs"

),

{

module:"Payments",

action,

paymentId,

admin:

currentAdmin.email,

time:

serverTimestamp()

}

);

}catch(error){

console.error(

error

);

}

}

// ======================================
// Fraud Detection
// ======================================

function calculateFraudScore(payment){

let score=100;

// Very High Amount

if(Number(payment.amount)>10000)

score-=25;

// Crypto Payment

if(payment.method==="Crypto")

score-=20;

// Refund Requested

if(payment.status==="Refund Requested")

score-=20;

// Multiple Reports

if(payment.reports)

score-=

payment.reports*10;

// New Account

if(payment.accountAge<7)

score-=15;

if(score<0)

score=0;

return score;

}

// ======================================
// Fraud Badge
// ======================================

function fraudBadge(score){

if(score>=90)

return "🟢 Safe";

if(score>=70)

return "🟡 Medium";

if(score>=40)

return "🟠 Warning";

return "🔴 High Risk";

}

// ======================================
// Revenue Analytics
// ======================================

function calculateRevenue(){

let revenue=0;

let escrow=0;

let refunded=0;

payments.forEach(payment=>{

const amount=

Number(

payment.amount || 0

);

if(payment.status==="Completed")

revenue+=amount;

if(payment.status==="Escrow")

escrow+=amount;

if(payment.status==="Refunded")

refunded+=amount;

});

console.log(

"Revenue:",

revenue

);

console.log(

"Escrow:",

escrow

);

console.log(

"Refunded:",

refunded

);

}

// ======================================
// Analytics Wrapper
// ======================================

const oldUpdateStatistics=

updateStatistics;

updateStatistics=function(){

oldUpdateStatistics();

calculateRevenue();

};

// ======================================
// Loading
// ======================================

function showLoading(){

paymentsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

Loading Payments...

</td>

</tr>

`;

}

// ======================================
// Error
// ======================================

function showError(message){

paymentsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

${message}

</td>

</tr>

`;

}

// ======================================
// Safe Listener
// ======================================

const oldListener=

listenPayments;

listenPayments=function(){

showLoading();

try{

oldListener();

}catch(error){

console.error(error);

showError(

"Unable to load payments."

);

}

};

// ======================================
// Wrap Release
// ======================================

const oldRelease=

confirmRelease.onclick;

confirmRelease.onclick=

async()=>{

await oldRelease();

if(selectedPaymentId){

await logPaymentAction(

"Escrow Released",

selectedPaymentId

);

}

};

// ======================================
// Wrap Refund
// ======================================

const oldRefund=

confirmRefund.onclick;

confirmRefund.onclick=

async()=>{

await oldRefund();

if(selectedPaymentId){

await logPaymentAction(

"Refund Approved",

selectedPaymentId

);

}

};

// ======================================
// Wrap Delete
// ======================================

const oldDelete=

confirmDelete.onclick;

confirmDelete.onclick=

async()=>{

await oldDelete();

if(selectedPaymentId){

await logPaymentAction(

"Payment Deleted",

selectedPaymentId

);

}

};

// ======================================
// Auto Refresh
// ======================================

setInterval(()=>{

renderPayments();

},30000);

// ======================================
// Final
// ======================================

console.log(

"🚀 WorkBee Admin Payments Production Ready"

);