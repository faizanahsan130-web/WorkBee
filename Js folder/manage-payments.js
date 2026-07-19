// ======================================
// WorkBee Admin - Manage Payments
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// HTML Elements
// ======================================

const paymentsTable = document.getElementById("paymentsTable");
const searchPayment = document.getElementById("searchPayment");

const totalPayments = document.getElementById("totalPayments");
const completedPayments = document.getElementById("completedPayments");
const pendingPayments = document.getElementById("pendingPayments");

let allPayments = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadPayments();

});

// ======================================
// Load Payments
// ======================================

async function loadPayments() {

    paymentsTable.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;">
                Loading Payments...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "payments"));

        allPayments = [];

        paymentsTable.innerHTML = "";

        let totalAmount = 0;
        let completed = 0;
        let pending = 0;

        if (snapshot.empty) {

            paymentsTable.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        No Payments Found
                    </td>
                </tr>
            `;

            totalPayments.textContent = "$0";
            completedPayments.textContent = "0";
            pendingPayments.textContent = "0";

            return;

        }

        snapshot.forEach((paymentDoc) => {

            const payment = paymentDoc.data();

            payment.id = paymentDoc.id;

            allPayments.push(payment);

            totalAmount += Number(payment.amount || 0);

            if ((payment.status || "Pending") === "Completed") {
                completed++;
            } else {
                pending++;
            }

        });

        totalPayments.textContent = "$" + totalAmount.toFixed(2);
        completedPayments.textContent = completed;
        pendingPayments.textContent = pending;

        renderPayments(allPayments);

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Payments
// ======================================

function renderPayments(payments) {

    paymentsTable.innerHTML = "";

    payments.forEach(payment => {

        let status = payment.status || "Pending";
        let statusClass = "status-pending";

        if (status === "Completed") {

            statusClass = "status-completed";

        } else if (status === "Failed") {

            statusClass = "status-failed";

        }

        paymentsTable.innerHTML += `

        <tr>

            <td>${payment.projectTitle || "-"}</td>

            <td>${payment.clientEmail || "-"}</td>

            <td>${payment.freelancerEmail || "-"}</td>

            <td>$${payment.amount || 0}</td>

            <td>${payment.method || "-"}</td>

            <td>

                <span class="${statusClass}">
                    ${status}
                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewPayment('${payment.id}')">

                    View

                </button>

                <button
                    class="action-btn complete-btn"
                    onclick="completePayment('${payment.id}')">

                    Complete

                </button>

                <button
                    class="action-btn pending-btn"
                    onclick="pendingPayment('${payment.id}')">

                    Pending

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deletePayment('${payment.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

searchPayment.addEventListener("input", () => {

    const value = searchPayment.value.toLowerCase();

    const filtered = allPayments.filter(payment =>

        (payment.projectTitle || "").toLowerCase().includes(value)

        ||

        (payment.clientEmail || "").toLowerCase().includes(value)

        ||

        (payment.freelancerEmail || "").toLowerCase().includes(value)

    );

    renderPayments(filtered);

});

// ======================================
// View Payment
// ======================================

window.viewPayment = function(id){

    const payment = allPayments.find(p => p.id === id);

    if(!payment) return;

    alert(

`Project:
${payment.projectTitle}

Client:
${payment.clientEmail}

Freelancer:
${payment.freelancerEmail}

Amount:
$${payment.amount}

Method:
${payment.method}

Status:
${payment.status || "Pending"}`

    );

};

// ======================================
// Complete Payment
// ======================================

window.completePayment = async function(id){

    try{

        await updateDoc(doc(db,"payments",id),{

            status:"Completed"

        });

        alert("✅ Payment Completed");

        loadPayments();

    }

    catch(error){

        alert(error.message);

    }

};

// ======================================
// Pending Payment
// ======================================

window.pendingPayment = async function(id){

    try{

        await updateDoc(doc(db,"payments",id),{

            status:"Pending"

        });

        alert("⏳ Payment Marked Pending");

        loadPayments();

    }

    catch(error){

        alert(error.message);

    }

};

// ======================================
// Delete Payment
// ======================================

window.deletePayment = async function(id){

    const ok = confirm("Delete this payment?");

    if(!ok) return;

    try{

        await deleteDoc(doc(db,"payments",id));

        alert("🗑 Payment Deleted");

        loadPayments();

    }

    catch(error){

        alert(error.message);

    }

};