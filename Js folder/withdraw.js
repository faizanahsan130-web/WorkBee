// ======================================
// WorkBee Earnings Dashboard
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// HTML Elements
// ======================================

const totalEarnings = document.getElementById("totalEarnings");
const availableBalance = document.getElementById("availableBalance");
const pendingPayments = document.getElementById("pendingPayments");
const completedPayments = document.getElementById("completedPayments");
const paymentTable = document.getElementById("paymentTable");

let currentUser = null;

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadPayments();

});

// ======================================
// Load Payments
// ======================================

async function loadPayments() {

    paymentTable.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Loading...
            </td>
        </tr>
    `;

    try {

        const q = query(
            collection(db, "payments"),
            where("freelancerId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);

        paymentTable.innerHTML = "";

        let total = 0;
        let available = 0;
        let pending = 0;
        let completed = 0;

        if (snapshot.empty) {

            paymentTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No Payments Found
                    </td>
                </tr>
            `;

        }

        snapshot.forEach((paymentDoc) => {

            const payment = paymentDoc.data();

            const amount = Number(payment.amount || 0);

            total += amount;

            if (payment.status === "Paid") {

                available += amount;
                completed++;

            } else {

                pending += amount;

            }

            let date = "-";

            if (payment.createdAt) {

                date = payment.createdAt
                    .toDate()
                    .toLocaleDateString();

            }

            paymentTable.innerHTML += `
                <tr>

                    <td>${payment.projectTitle || "-"}</td>

                    <td>${payment.clientEmail || "-"}</td>

                    <td>$${amount.toFixed(2)}</td>

                    <td class="${
                        payment.status === "Paid"
                        ? "status-paid"
                        : "status-pending"
                    }">

                        ${payment.status}

                    </td>

                    <td>${date}</td>

                </tr>
            `;

        });

        totalEarnings.textContent =
            "$" + total.toFixed(2);

        availableBalance.textContent =
            "$" + available.toFixed(2);

        pendingPayments.textContent =
            "$" + pending.toFixed(2);

        completedPayments.textContent =
            completed;

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}