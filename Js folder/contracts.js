// ======================================
// WorkBee - Contracts
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const contractsContainer = document.getElementById("contractsContainer");
const searchContract = document.getElementById("searchContract");
const statusFilter = document.getElementById("statusFilter");

const activeContracts = document.getElementById("activeContracts");
const completedContracts = document.getElementById("completedContracts");
const cancelledContracts = document.getElementById("cancelledContracts");

let currentUser = null;
let allContracts = [];

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

    loadContracts();

});

// ======================================
// Load Contracts
// ======================================

async function loadContracts() {

    try {

        contractsContainer.innerHTML = "<div class='empty'>Loading Contracts...</div>";

        const q = query(
            collection(db, "contracts"),
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);

        allContracts = [];

        let active = 0;
        let completed = 0;
        let cancelled = 0;

        snapshot.forEach((contractDoc) => {

            const contract = contractDoc.data();

            contract.id = contractDoc.id;

            allContracts.push(contract);

            if (
                contract.status === "Pending" ||
                contract.status === "Accepted"
            ) {
                active++;
            }

            if (contract.status === "Completed") {
                completed++;
            }

            if (contract.status === "Cancelled") {
                cancelled++;
            }

        });

        activeContracts.textContent = active;
        completedContracts.textContent = completed;
        cancelledContracts.textContent = cancelled;

        renderContracts(allContracts);

    }

    catch (error) {

        console.error(error);

        contractsContainer.innerHTML =
            `<div class="empty">${error.message}</div>`;

    }

}

// ======================================
// Render Contracts
// ======================================

function renderContracts(list) {

    contractsContainer.innerHTML = "";

    if (list.length === 0) {

        contractsContainer.innerHTML = `
            <div class="empty">
                No Contracts Found
            </div>
        `;

        return;

    }

    list.forEach(contract => {

        const statusClass = contract.status.toLowerCase();

        const card = document.createElement("div");

        card.className = "contract-card";

        card.innerHTML = `

            <h2>${contract.projectTitle || "Untitled Project"}</h2>

            <p><strong>Client:</strong> ${contract.clientEmail || "-"}</p>

            <p><strong>Freelancer:</strong> ${contract.freelancerEmail || "-"}</p>

            <p><strong>Budget:</strong> $${contract.budget || 0}</p>

            <p><strong>Deadline:</strong> ${contract.deadline || "-"}</p>

            <span class="status ${statusClass}">
                ${contract.status}
            </span>

            <div class="actions">

                <button
                    class="view-btn"
                    onclick="viewContract('${contract.id}')">

                    View

                </button>

                <button
                    class="accept-btn"
                    onclick="acceptContract('${contract.id}')">

                    Accept

                </button>

                <button
                    class="reject-btn"
                    onclick="rejectContract('${contract.id}')">

                    Reject

                </button>

                <button
                    class="download-btn"
                    onclick="downloadContract('${contract.id}')">

                    Download

                </button>

            </div>

        `;

        contractsContainer.appendChild(card);

    });

}

// ======================================
// Search + Filter
// ======================================

function applyFilters() {

    const keyword = searchContract.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = allContracts.filter(contract => {

        const matchSearch =
            (contract.projectTitle || "")
            .toLowerCase()
            .includes(keyword);

        const matchStatus =
            status === "All" ||
            contract.status === status;

        return matchSearch && matchStatus;

    });

    renderContracts(filtered);

}

searchContract.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

// ======================================
// View Contract
// ======================================

window.viewContract = function(id) {

    const contract = allContracts.find(c => c.id === id);

    if (!contract) return;

    alert(

`Project:
${contract.projectTitle}

Client:
${contract.clientEmail}

Freelancer:
${contract.freelancerEmail}

Budget:
$${contract.budget}

Deadline:
${contract.deadline}

Status:
${contract.status}

Terms:
${contract.terms || "No Terms Added"}`

    );

};

// ======================================
// Accept Contract
// ======================================

window.acceptContract = async function(id) {

    if (!confirm("Accept this contract?")) return;

    await updateDoc(doc(db, "contracts", id), {

        status: "Accepted"

    });

    alert("✅ Contract Accepted");

    loadContracts();

};

// ======================================
// Reject Contract
// ======================================

window.rejectContract = async function(id) {

    if (!confirm("Reject this contract?")) return;

    await updateDoc(doc(db, "contracts", id), {

        status: "Cancelled"

    });

    alert("❌ Contract Rejected");

    loadContracts();

};

// ======================================
// Download Contract
// ======================================

window.downloadContract = function(id) {

    const contract = allContracts.find(c => c.id === id);

    if (!contract) return;

    const content = `

WORKBEE CONTRACT

Project:
${contract.projectTitle}

Client:
${contract.clientEmail}

Freelancer:
${contract.freelancerEmail}

Budget:
$${contract.budget}

Deadline:
${contract.deadline}

Status:
${contract.status}

Terms:
${contract.terms || "No Terms"}

`;

    const blob = new Blob([content], {
        type: "text/plain"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "WorkBee_Contract.txt";

    a.click();

    URL.revokeObjectURL(url);

};