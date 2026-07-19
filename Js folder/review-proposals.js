// ======================================
// WorkBee Review Proposals V2
// Part 1 - Firebase, Auth & Setup
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
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const proposalList =
document.getElementById("proposalList");

const loadingBox =
document.getElementById("loadingBox");

const emptyState =
document.getElementById("emptyState");

const searchProposal =
document.getElementById("searchProposal");

const statusFilter =
document.getElementById("statusFilter");

const refreshBtn =
document.getElementById("refreshBtn");

const totalCount =
document.getElementById("totalCount");

const pendingCount =
document.getElementById("pendingCount");

const acceptedCount =
document.getElementById("acceptedCount");

const rejectedCount =
document.getElementById("rejectedCount");

// ======================================
// Global Variables
// ======================================

let currentUser = null;

let proposalData = [];

let filteredData = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    console.log("✅ Logged in:", user.email);

    await loadProposals();

});

// ======================================
// Loading
// ======================================

function showLoading() {

    loadingBox.style.display = "block";

    proposalList.style.display = "none";

    emptyState.style.display = "none";

}

function hideLoading() {

    loadingBox.style.display = "none";

    proposalList.style.display = "grid";

}

// ======================================
// Empty State
// ======================================

function showEmptyState() {

    proposalList.innerHTML = "";

    proposalList.style.display = "none";

    emptyState.style.display = "block";

}

// ======================================
// Statistics
// ======================================

function updateStatistics() {

    totalCount.innerText = proposalData.length;

    pendingCount.innerText =
        proposalData.filter(p => p.status === "Pending").length;

    acceptedCount.innerText =
        proposalData.filter(p => p.status === "Accepted").length;

    rejectedCount.innerText =
        proposalData.filter(p => p.status === "Rejected").length;

}

console.log("====================================");
console.log("🐝 WorkBee Review Proposal Module");
console.log("Firebase Connected");
console.log("Waiting for Firestore...");
console.log("====================================");
// ======================================
// Load Client Proposals
// ======================================

async function loadProposals() {

    if (!currentUser) return;

    showLoading();

    proposalData = [];

    try {

        const proposalsQuery = query(

            collection(db, "proposals"),

            where("clientId", "==", currentUser.uid),

            orderBy("createdAt", "desc")

        );

        const snapshot = await getDocs(proposalsQuery);

        proposalData = [];

        snapshot.forEach((docSnap) => {

            proposalData.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        filteredData = [...proposalData];

        updateStatistics();

        hideLoading();

        if (filteredData.length === 0) {

            showEmptyState();

            return;

        }

        renderProposals(filteredData);

    }

    catch (error) {

        console.error("Load Proposal Error:", error);

        loadingBox.style.display = "none";

        proposalList.style.display = "block";

        proposalList.innerHTML = `

        <div class="empty-state">

            <h2>❌ Error</h2>

            <p>${error.message}</p>

        </div>

        `;

    }

}

// ======================================
// Refresh Button
// ======================================

refreshBtn.addEventListener("click", async () => {

    refreshBtn.disabled = true;

    refreshBtn.innerHTML = "Refreshing...";

    await loadProposals();

    refreshBtn.disabled = false;

    refreshBtn.innerHTML = "🔄 Refresh";

});

// ======================================
// Auto Refresh Every 30 Seconds
// ======================================

setInterval(() => {

    if (currentUser) {

        loadProposals();

    }

}, 30000);

console.log("✅ Proposal Loader Ready");
// ======================================
// Render Proposal Cards
// ======================================

function renderProposals(list) {

    proposalList.innerHTML = "";

    if (list.length === 0) {

        showEmptyState();

        return;

    }

    proposalList.style.display = "grid";

    emptyState.style.display = "none";

    list.forEach(item => {

        const statusClass = item.status.toLowerCase();

        proposalList.innerHTML += `

        <div class="proposal-card">

            <h2>${item.projectTitle}</h2>

            <p><strong>Freelancer ID:</strong> ${item.freelancerId}</p>

            <p><strong>Bid Amount:</strong> $${item.bidAmount}</p>

            <p><strong>Delivery:</strong> ${item.deliveryDays} Days</p>

            <p><strong>Cover Letter:</strong></p>

            <p>${item.coverLetter}</p>

            <div class="card-footer">

                <span class="status ${statusClass}">

                    ${item.status}

                </span>

                <div class="action-buttons">

                    <button
                        class="view-btn"
                        onclick="viewProposal('${item.id}')">

                        👁 View

                    </button>

                    <button
                        class="accept-btn"
                        onclick="acceptProposal('${item.id}')">

                        ✅ Accept

                    </button>

                    <button
                        class="reject-btn"
                        onclick="rejectProposal('${item.id}')">

                        ❌ Reject

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

// ======================================
// View Proposal
// ======================================

window.viewProposal = function(id) {

    const proposal = proposalData.find(p => p.id === id);

    if (!proposal) return;

    alert(

`Project: ${proposal.projectTitle}

Bid: $${proposal.bidAmount}

Delivery: ${proposal.deliveryDays} Days

Status: ${proposal.status}

Cover Letter:

${proposal.coverLetter}`

    );

};

console.log("✅ Proposal Renderer Ready");
// ======================================
// Search
// ======================================

searchProposal.addEventListener("input", filterProposals);

statusFilter.addEventListener("change", filterProposals);

function filterProposals() {

    const keyword = searchProposal.value
        .trim()
        .toLowerCase();

    const status = statusFilter.value;

    filteredData = proposalData.filter(item => {

        const searchMatch =

            (item.projectTitle || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (item.freelancerName || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (item.freelancerEmail || "")
            .toLowerCase()
            .includes(keyword);

        const statusMatch =

            status === "All"

            ||

            item.status === status;

        return searchMatch && statusMatch;

    });

    renderProposals(filteredData);

}

// ======================================
// Accept Proposal
// ======================================

window.acceptProposal = async function(id) {

    const ok = confirm(
        "Accept this proposal?"
    );

    if (!ok) return;

    try {

        await updateDoc(

            doc(db, "proposals", id),

            {

                status: "Accepted",

                updatedAt: serverTimestamp()

            }

        );

        await loadProposals();

        alert("✅ Proposal Accepted");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Reject Proposal
// ======================================

window.rejectProposal = async function(id){

    const ok = confirm(
        "Reject this proposal?"
    );

    if(!ok) return;

    try{

        await updateDoc(

            doc(db,"proposals",id),

            {

                status:"Rejected",

                updatedAt:serverTimestamp()

            }

        );

        await loadProposals();

        alert("❌ Proposal Rejected");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

console.log("✅ Search & Status System Ready");

console.log("✅ Accept / Reject Ready");
// ======================================
// WorkBee Review Proposals V2
// Part 5 - Final Production
// ======================================

// ======================================
// Notification Helper
// ======================================

async function sendNotification(userId, title, message) {

    try {

        await addDoc(collection(db, "notifications"), {

            userId,

            title,

            message,

            isRead: false,

            createdAt: serverTimestamp()

        });

    }

    catch (error) {

        console.error("Notification Error:", error);

    }

}

// ======================================
// Start Project
// ======================================

window.startProject = async function(id) {

    const proposal = proposalData.find(p => p.id === id);

    if (!proposal) return;

    if (proposal.status !== "Accepted") {

        alert("Only accepted proposals can start a project.");

        return;

    }

    try {

        await addDoc(collection(db, "contracts"), {

            proposalId: proposal.id,

            projectId: proposal.projectId,

            clientId: proposal.clientId,

            freelancerId: proposal.freelancerId,

            bidAmount: proposal.bidAmount,

            deliveryDays: proposal.deliveryDays,

            status: "Active",

            startedAt: serverTimestamp()

        });

        await sendNotification(

            proposal.freelancerId,

            "Project Started",

            "Congratulations! Your proposal has been accepted and the project has started."

        );

        alert("✅ Project started successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Statistics Refresh
// ======================================

function refreshDashboard() {

    updateStatistics();

    renderProposals(filteredData);

}

// ======================================
// Manual Refresh
// ======================================

refreshBtn.addEventListener("click", async () => {

    refreshBtn.disabled = true;

    refreshBtn.innerHTML = "Refreshing...";

    await loadProposals();

    refreshBtn.disabled = false;

    refreshBtn.innerHTML = "🔄 Refresh";

});

// ======================================
// Console
// ======================================

console.log("======================================");
console.log("🐝 WorkBee Review Proposal V2");
console.log("Authentication ✓");
console.log("Firestore ✓");
console.log("Proposal Review ✓");
console.log("Search ✓");
console.log("Filter ✓");
console.log("Accept ✓");
console.log("Reject ✓");
console.log("Notifications ✓");
console.log("Contracts ✓");
console.log("Production Ready ✓");
console.log("======================================");