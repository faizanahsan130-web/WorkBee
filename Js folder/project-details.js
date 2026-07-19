// ======================================
// WorkBee - Project Details
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const projectTitle = document.getElementById("projectTitle");
const projectCategory = document.getElementById("projectCategory");
const projectBudget = document.getElementById("projectBudget");
const projectDescription = document.getElementById("projectDescription");
const skillsContainer = document.getElementById("skillsContainer");
const attachments = document.getElementById("attachments");

const clientName = document.getElementById("clientName");
const clientCountry = document.getElementById("clientCountry");
const clientRating = document.getElementById("clientRating");

const projectDeadline = document.getElementById("projectDeadline");
const projectExperience = document.getElementById("projectExperience");
const projectStatus = document.getElementById("projectStatus");

const applyBtn = document.getElementById("applyBtn");
const chatBtn = document.getElementById("chatBtn");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");

// ======================================

let currentUser = null;

const params = new URLSearchParams(window.location.search);

const projectId = params.get("id");

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadProject();

});

// ======================================
// Load Project
// ======================================

async function loadProject() {

    try {

        const projectRef = doc(db, "projects", projectId);

        const snap = await getDoc(projectRef);

        if (!snap.exists()) {

            projectTitle.textContent = "Project Not Found";

            return;

        }

        const project = snap.data();

        projectTitle.textContent = project.title || "-";
        projectCategory.textContent = project.category || "-";
        projectBudget.textContent = "$" + (project.budget || 0);
        projectDescription.textContent = project.description || "-";

        projectDeadline.textContent = project.deadline || "-";
        projectExperience.textContent = project.experience || "-";
        projectStatus.textContent = project.status || "Open";

        clientName.textContent = project.clientName || "Client";
        clientCountry.textContent = project.clientCountry || "-";
        clientRating.textContent = project.clientRating || "0.0";

        // Skills

        skillsContainer.innerHTML = "";

        (project.skills || []).forEach(skill => {

            skillsContainer.innerHTML +=

            `<span class="skill">${skill}</span>`;

        });

        // Attachments

        attachments.innerHTML = "";

        if (project.attachments && project.attachments.length > 0) {

            project.attachments.forEach(file => {

                attachments.innerHTML +=

                `<a href="${file}" target="_blank">📎 Attachment</a>`;

            });

        }

        else {

            attachments.innerHTML =

            "No attachments.";

        }

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================
// Apply
// ======================================

applyBtn.addEventListener("click", () => {

    window.location.href =

    `apply-project.html?id=${projectId}`;

});

// ======================================
// Chat
// ======================================

chatBtn.addEventListener("click", () => {

    window.location.href =

    `chat.html?project=${projectId}`;

});

// ======================================
// Save Project
// ======================================

saveBtn.addEventListener("click", async () => {

    try {

        const ref = doc(

            db,

            "savedProjects",

            currentUser.uid + "_" + projectId

        );

        await setDoc(ref, {

            userId: currentUser.uid,

            projectId: projectId,

            savedAt: new Date()

        });

        alert("Project Saved.");

    }

    catch (error) {

        alert(error.message);

    }

});

// ======================================
// Share
// ======================================

shareBtn.addEventListener("click", async () => {

    const url = window.location.href;

    if (navigator.share) {

        navigator.share({

            title: "WorkBee Project",

            text: projectTitle.textContent,

            url

        });

    }

    else {

        await navigator.clipboard.writeText(url);

        alert("Project link copied.");

    }

});