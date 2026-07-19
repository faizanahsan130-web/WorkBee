// ======================================
// WorkBee - Apply Project
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const applyForm = document.getElementById("applyForm");

// ==========================
// Check Login
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

    }

});

// ==========================
// Get URL Parameters
// ==========================

const params = new URLSearchParams(window.location.search);

const projectId = params.get("projectId") || "";

const projectTitle = params.get("title") || "Project";

const projectTitleInput = document.getElementById("projectTitle");

projectTitleInput.value = projectTitle;

// ==========================
// Submit Application
// ==========================

applyForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {

        alert("Please login first.");

        return;

    }

    const proposal = document.getElementById("proposal").value.trim();
    const bid = document.getElementById("bid").value;
    const delivery = document.getElementById("delivery").value;

    if (proposal === "" || bid === "" || delivery === "") {

        alert("Please fill in all fields.");

        return;

    }

    try {

        await addDoc(collection(db, "applications"), {

            projectId: projectId,

            projectTitle: projectTitle,

            freelancerId: user.uid,

            freelancerEmail: user.email,

            proposal: proposal,

            bid: Number(bid),

            deliveryDays: Number(delivery),

            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert("✅ Application Submitted Successfully!");

        applyForm.reset();

        window.location.href = "browse-freelancers.html";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});