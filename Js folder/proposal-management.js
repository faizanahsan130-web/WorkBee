// ======================================
// WorkBee - Proposal Management
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const proposalContainer = document.getElementById("proposalContainer");
const searchProposal = document.getElementById("searchProposal");
const statusFilter = document.getElementById("statusFilter");

const totalProposals = document.getElementById("totalProposals");
const pendingProposals = document.getElementById("pendingProposals");
const acceptedProposals = document.getElementById("acceptedProposals");
const rejectedProposals = document.getElementById("rejectedProposals");

let currentUser = null;
let proposals = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    loadProposals();

});

// ======================================
// Load Proposals
// ======================================

function loadProposals() {

    const q = query(

        collection(db, "proposals"),

        where("freelancerId", "==", currentUser.uid)

    );

    onSnapshot(q, (snapshot) => {

        proposals = [];

        snapshot.forEach((docSnap) => {

            proposals.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        updateStats();

        renderProposals(proposals);

    });

}

// ======================================
// Statistics
// ======================================

function updateStats() {

    totalProposals.textContent = proposals.length;

    pendingProposals.textContent =
        proposals.filter(p => p.status === "Pending").length;

    acceptedProposals.textContent =
        proposals.filter(p => p.status === "Accepted").length;

    rejectedProposals.textContent =
        proposals.filter(p => p.status === "Rejected").length;

}

// ======================================
// Render
// ======================================

function renderProposals(list) {

    proposalContainer.innerHTML = "";

    if (list.length === 0) {

        proposalContainer.innerHTML = `

        <div class="empty">

            No proposals found.

        </div>

        `;

        return;

    }

    list.forEach(item => {

        const statusClass = item.status.toLowerCase();

        proposalContainer.innerHTML += `

        <div class="proposal-card">

            <h2>${item.projectTitle || "Project"}</h2>

            <p>

                <strong>Bid:</strong>

                $${item.bid}

            </p>

            <p>

                <strong>Delivery:</strong>

                ${item.delivery} Days

            </p>

            <p>

                <strong>Portfolio:</strong>

                ${item.portfolioId || "-"}

            </p>

            <span class="status ${statusClass}">

                ${item.status}

            </span>

            <div class="actions">

                <button
                    class="view-btn"
                    onclick="viewProposal('${item.projectId}')">

                    View

                </button>

                <button
                    class="edit-btn"
                    onclick="editProposal('${item.id}','${item.status}')">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProposal('${item.id}')">

                    Withdraw

                </button>

            </div>

        </div>

        `;

    });

}

// ======================================
// Search + Filter
// ======================================

function filterProposals() {

    const keyword =
        searchProposal.value.toLowerCase();

    const status =
        statusFilter.value;

    const filtered = proposals.filter(item => {

        const searchMatch =

            (item.projectTitle || "")
            .toLowerCase()
            .includes(keyword);

        const statusMatch =

            status === "All" ||

            item.status === status;

        return searchMatch && statusMatch;

    });

    renderProposals(filtered);

}

searchProposal.addEventListener("input", filterProposals);

statusFilter.addEventListener("change", filterProposals);

// ======================================
// Global Functions
// ======================================

window.viewProposal = function(projectId) {

    window.location.href =
        `project-details.html?id=${projectId}`;

};

window.editProposal = function(id, status) {

    if (status !== "Pending") {

        alert("Only pending proposals can be edited.");

        return;

    }

    window.location.href =
        `proposal-submission.html?edit=${id}`;

};

window.deleteProposal = async function(id) {

    const ok = confirm(

        "Withdraw this proposal?"

    );

    if (!ok) return;

    try {

        await deleteDoc(

            doc(db, "proposals", id)

        );

        alert("Proposal withdrawn successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};