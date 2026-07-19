// ======================================
// WorkBee Proposal System V2
// Part 1
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const proposalForm = document.getElementById("proposalForm");

const projectTitle =
document.getElementById("projectTitle");

const bidAmount =
document.getElementById("bidAmount");

const deliveryDays =
document.getElementById("deliveryDays");

const coverLetter =
document.getElementById("coverLetter");

const portfolioSelect =
document.getElementById("portfolioSelect");

const submitProposal =
document.getElementById("submitProposal");

// ======================================
// Variables
// ======================================

let currentUser = null;

let selectedProjectId = "";

let selectedClientId = "";

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadProject();

    loadPortfolio();

});
// ======================================
// Load Project Details
// ======================================

async function loadProject() {

    const params = new URLSearchParams(window.location.search);

    selectedProjectId = params.get("projectId");

    selectedClientId = params.get("clientId");

    if (!selectedProjectId) {

        projectTitle.value = "Demo Project";

        return;

    }

    try {

        const q = query(
            collection(db, "projects"),
            where("__name__", "==", selectedProjectId)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            projectTitle.value = "Project Not Found";

            return;

        }

        snapshot.forEach(doc => {

            const data = doc.data();

            projectTitle.value = data.title || "Untitled Project";

        });

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Load Portfolio
// ======================================

async function loadPortfolio() {

    try {

        portfolioSelect.innerHTML =

        `<option value="">Loading...</option>`;

        const q = query(

            collection(db, "portfolio"),

            where("userId", "==", currentUser.uid)

        );

        const snapshot = await getDocs(q);

        portfolioSelect.innerHTML =

        `<option value="">Select Portfolio</option>`;

        snapshot.forEach(doc => {

            const item = doc.data();

            portfolioSelect.innerHTML += `

            <option value="${doc.id}">

                ${item.title}

            </option>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}
// ======================================
// Submit Proposal
// ======================================

proposalForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) {

        alert("Please login first.");

        return;

    }

    submitProposal.disabled = true;

    submitProposal.innerText = "Submitting...";

    try {

        // Check duplicate proposal

        const duplicateQuery = query(

            collection(db, "proposals"),

            where("projectId", "==", selectedProjectId),

            where("freelancerId", "==", currentUser.uid)

        );

        const duplicateSnap = await getDocs(duplicateQuery);

        if (!duplicateSnap.empty) {

            alert("You have already submitted a proposal for this project.");

            submitProposal.disabled = false;

            submitProposal.innerText = "Submit Proposal";

            return;

        }

        // Save Proposal

        await addDoc(collection(db, "proposals"), {

            projectId: selectedProjectId,

            clientId: selectedClientId,

            freelancerId: currentUser.uid,

            projectTitle: projectTitle.value,

            bidAmount: Number(bidAmount.value),

            deliveryDays: Number(deliveryDays.value),

            coverLetter: coverLetter.value,

            portfolioId: portfolioSelect.value,

            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert("✅ Proposal submitted successfully.");

        proposalForm.reset();

        projectTitle.value = projectTitle.value;

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        submitProposal.disabled = false;

        submitProposal.innerText = "Submit Proposal";

    }

});
// ======================================
// Validation
// ======================================

bidAmount.addEventListener("input", () => {

    if (Number(bidAmount.value) < 5) {

        bidAmount.setCustomValidity(
            "Minimum bid is $5."
        );

    } else {

        bidAmount.setCustomValidity("");

    }

});

deliveryDays.addEventListener("input", () => {

    if (Number(deliveryDays.value) < 1) {

        deliveryDays.setCustomValidity(
            "Delivery must be at least 1 day."
        );

    } else {

        deliveryDays.setCustomValidity("");

    }

});

// ======================================
// Cover Letter Counter
// ======================================

const letterCounter = document.createElement("small");

letterCounter.id = "letterCounter";

letterCounter.style.display = "block";

letterCounter.style.marginTop = "8px";

letterCounter.style.color = "#666";

coverLetter.parentNode.appendChild(letterCounter);

updateCounter();

coverLetter.addEventListener("input", updateCounter);

function updateCounter() {

    const total = coverLetter.value.length;

    letterCounter.innerHTML =

        `${total} / 1000 characters`;

    if (total > 1000) {

        letterCounter.style.color = "red";

    }

    else {

        letterCounter.style.color = "#666";

    }

}

// ======================================
// Auto Save Draft
// ======================================

const draftKey = "workbee_proposal_draft";

window.addEventListener("beforeunload", () => {

    localStorage.setItem(draftKey,

        JSON.stringify({

            bid: bidAmount.value,

            days: deliveryDays.value,

            letter: coverLetter.value,

            portfolio: portfolioSelect.value

        })

    );

});

// ======================================
// Load Draft
// ======================================

(function loadDraft() {

    const draft = localStorage.getItem(draftKey);

    if (!draft) return;

    try {

        const data = JSON.parse(draft);

        bidAmount.value = data.bid || "";

        deliveryDays.value = data.days || "";

        coverLetter.value = data.letter || "";

        portfolioSelect.value = data.portfolio || "";

        updateCounter();

    }

    catch (err) {

        console.error(err);

    }

})();
// ======================================
// WorkBee Proposal System V2
// Part 5 - Final Production
// ======================================

// ======================================
// Success Message
// ======================================

function showSuccess(message) {

    alert("✅ " + message);

}

// ======================================
// Error Message
// ======================================

function showError(message) {

    console.error(message);

    alert("❌ " + message);

}

// ======================================
// Clear Draft
// ======================================

function clearDraft() {

    localStorage.removeItem(draftKey);

}

// ======================================
// Reset Form
// ======================================

function resetProposalForm() {

    proposalForm.reset();

    updateCounter();

    submitProposal.disabled = false;

    submitProposal.innerHTML = "🚀 Submit Proposal";

}

// ======================================
// Redirect
// ======================================

function goToProposalManagement() {

    setTimeout(() => {

        window.location.href =
        "proposal-management.html";

    }, 1500);

}

// ======================================
// Submit Success
// ======================================

async function proposalSubmitted() {

    clearDraft();

    resetProposalForm();

    showSuccess("Proposal submitted successfully.");

    goToProposalManagement();

}

// ======================================
// Loading Button
// ======================================

function startLoading() {

    submitProposal.disabled = true;

    submitProposal.innerHTML =

    "⏳ Sending Proposal...";

}

function stopLoading() {

    submitProposal.disabled = false;

    submitProposal.innerHTML =

    "🚀 Submit Proposal";

}

// ======================================
// Console
// ======================================

console.log("====================================");

console.log("🐝 WorkBee Proposal System V2");

console.log("Firebase Connected");

console.log("Firestore Connected");

console.log("Proposal Ready");

console.log("Production Version");

console.log("====================================");

// ======================================
// Export
// ======================================

export {

    proposalSubmitted,

    startLoading,

    stopLoading

};