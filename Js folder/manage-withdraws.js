// ======================================
// WorkBee Admin - Manage Withdraw Requests
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

const withdrawTable = document.getElementById("withdrawTable");
const searchWithdraw = document.getElementById("searchWithdraw");

const totalRequests = document.getElementById("totalRequests");
const pendingRequests = document.getElementById("pendingRequests");
const approvedRequests = document.getElementById("approvedRequests");
const totalAmount = document.getElementById("totalAmount");

let allWithdraws = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadWithdraws();

});

// ======================================
// Load Withdraw Requests
// ======================================

async function loadWithdraws() {

    withdrawTable.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Loading Withdraw Requests...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "withdraws"));

        allWithdraws = [];

        withdrawTable.innerHTML = "";

        let total = 0;
        let pending = 0;
        let approved = 0;

        if (snapshot.empty) {

            withdrawTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No Withdraw Requests Found
                    </td>
                </tr>
            `;

            totalRequests.textContent = "0";
            pendingRequests.textContent = "0";
            approvedRequests.textContent = "0";
            totalAmount.textContent = "$0";

            return;

        }

        snapshot.forEach((withdrawDoc) => {

            const withdraw = withdrawDoc.data();

            withdraw.id = withdrawDoc.id;

            allWithdraws.push(withdraw);

            total += Number(withdraw.amount || 0);

            const status = withdraw.status || "Pending";

            if (status === "Pending") pending++;

            if (status === "Approved" || status === "Paid") approved++;

        });

        totalRequests.textContent = allWithdraws.length;
        pendingRequests.textContent = pending;
        approvedRequests.textContent = approved;
        totalAmount.textContent = "$" + total.toFixed(2);

        renderWithdraws(allWithdraws);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Table
// ======================================

function renderWithdraws(withdraws) {

    withdrawTable.innerHTML = "";

    withdraws.forEach(withdraw => {

        let statusClass = "status-pending";

        if (withdraw.status === "Approved")
            statusClass = "status-approved";

        if (withdraw.status === "Paid")
            statusClass = "status-paid";

        if (withdraw.status === "Rejected")
            statusClass = "status-rejected";

        withdrawTable.innerHTML += `

        <tr>

            <td>${withdraw.userEmail || "-"}</td>

            <td>${withdraw.method || "-"}</td>

            <td>${withdraw.account || "-"}</td>

            <td>$${withdraw.amount || 0}</td>

            <td>

                <span class="${statusClass}">
                    ${withdraw.status || "Pending"}
                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewWithdraw('${withdraw.id}')">

                    View

                </button>

                <button
                    class="action-btn approve-btn"
                    onclick="approveWithdraw('${withdraw.id}')">

                    Approve

                </button>

                <button
                    class="action-btn pay-btn"
                    onclick="payWithdraw('${withdraw.id}')">

                    Paid

                </button>

                <button
                    class="action-btn reject-btn"
                    onclick="rejectWithdraw('${withdraw.id}')">

                    Reject

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteWithdraw('${withdraw.id}')">

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

searchWithdraw.addEventListener("input", () => {

    const value = searchWithdraw.value.toLowerCase();

    const filtered = allWithdraws.filter(withdraw =>

        (withdraw.userEmail || "").toLowerCase().includes(value) ||

        (withdraw.method || "").toLowerCase().includes(value)

    );

    renderWithdraws(filtered);

});

// ======================================
// View Details
// ======================================

window.viewWithdraw = function(id) {

    const withdraw = allWithdraws.find(w => w.id === id);

    if (!withdraw) return;

    alert(

`Freelancer:
${withdraw.userEmail}

Amount:
$${withdraw.amount}

Method:
${withdraw.method}

Account:
${withdraw.account}

Status:
${withdraw.status || "Pending"}`

    );

};

// ======================================
// Approve
// ======================================

window.approveWithdraw = async function(id) {

    try {

        await updateDoc(doc(db, "withdraws", id), {

            status: "Approved"

        });

        alert("✅ Withdraw Approved");

        loadWithdraws();

    }

    catch (error) {

        alert(error.message);

    }

};

// ======================================
// Mark as Paid
// ======================================

window.payWithdraw = async function(id) {

    try {

        await updateDoc(doc(db, "withdraws", id), {

            status: "Paid"

        });

        alert("💸 Payment Marked as Paid");

        loadWithdraws();

    }

    catch (error) {

        alert(error.message);

    }

};

// ======================================
// Reject
// ======================================

window.rejectWithdraw = async function(id) {

    try {

        await updateDoc(doc(db, "withdraws", id), {

            status: "Rejected"

        });

        alert("❌ Withdraw Rejected");

        loadWithdraws();

    }

    catch (error) {

        alert(error.message);

    }

};

// ======================================
// Delete
// ======================================

window.deleteWithdraw = async function(id) {

    const ok = confirm("Delete this withdraw request?");

    if (!ok) return;

    try {

        await deleteDoc(doc(db, "withdraws", id));

        alert("🗑 Withdraw Request Deleted");

        loadWithdraws();

    }

    catch (error) {

        alert(error.message);

    }

};