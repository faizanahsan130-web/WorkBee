// ======================================
// WorkBee - View Applications
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("applicationsContainer");

// Get Project ID
const params = new URLSearchParams(window.location.search);
const projectId = params.get("projectId");

// Check Login
onAuthStateChanged(auth, (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    loadApplications();

});

// Load Applications
async function loadApplications() {

    container.innerHTML = "<h2>Loading Applications...</h2>";

    try {

        const q = query(
            collection(db, "applications"),
            where("projectId", "==", projectId)
        );

        const snapshot = await getDocs(q);

        container.innerHTML = "";

        if (snapshot.empty) {

            container.innerHTML = `
                <h2 style="text-align:center;">
                    No Applications Found
                </h2>
            `;

            return;
        }

        snapshot.forEach((applicationDoc) => {

            createCard(applicationDoc.id, applicationDoc.data());

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <h2 style="color:red;text-align:center;">
                ${error.message}
            </h2>
        `;

    }

}

// Create Card
function createCard(id, application) {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>${application.freelancerEmail}</h3>

        <p><strong>Proposal:</strong><br>${application.proposal}</p>

        <p><strong>Bid:</strong> $${application.bid}</p>

        <p><strong>Delivery:</strong> ${application.deliveryDays} Days</p>

        <p><strong>Status:</strong> ${application.status}</p>

        <div class="buttons">

            <button class="accept">Accept</button>

            <button class="reject">Reject</button>

            <button class="message">Message</button>

        </div>
    `;

    // Accept
    card.querySelector(".accept").addEventListener("click", async () => {

        try {

            // Update Application
            await updateDoc(doc(db, "applications", id), {
                status: "Accepted"
            });

            // Update Project
            await updateDoc(doc(db, "projects", projectId), {
                status: "In Progress"
            });

            alert("✅ Freelancer Accepted Successfully!");

            loadApplications();

        } catch (error) {

            alert(error.message);

        }

    });

    // Reject
    card.querySelector(".reject").addEventListener("click", async () => {

        try {

            await updateDoc(doc(db, "applications", id), {
                status: "Rejected"
            });

            alert("❌ Application Rejected");

            loadApplications();

        } catch (error) {

            alert(error.message);

        }

    });

    // Message
    card.querySelector(".message").addEventListener("click", () => {

        alert("💬 Chat feature coming soon!");

    });

    container.appendChild(card);

}