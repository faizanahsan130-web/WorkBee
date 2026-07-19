// ======================================
// WorkBee - Saved Jobs
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

const savedJobsContainer = document.getElementById("savedJobsContainer");
const searchJob = document.getElementById("searchJob");
const categoryFilter = document.getElementById("categoryFilter");

let currentUser = null;
let allJobs = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadSavedJobs();

});

// ======================================
// Load Saved Jobs
// ======================================

function loadSavedJobs() {

    const q = query(

        collection(db, "savedJobs"),

        where("userId", "==", currentUser.uid)

    );

    onSnapshot(q, (snapshot) => {

        allJobs = [];

        snapshot.forEach((docSnap) => {

            allJobs.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        renderJobs(allJobs);

    });

}

// ======================================
// Render Jobs
// ======================================

function renderJobs(list) {

    savedJobsContainer.innerHTML = "";

    if (list.length === 0) {

        savedJobsContainer.innerHTML = `
            <div class="empty">
                ❤️ No Saved Jobs Found
            </div>
        `;

        return;

    }

    list.forEach(job => {

        const card = document.createElement("div");

        card.className = "job-card";

        card.innerHTML = `

            <h2>${job.title || "Untitled Project"}</h2>

            <p>
                <strong>Category:</strong>
                ${job.category || "-"}
            </p>

            <p>
                <strong>Budget:</strong>
                $${job.budget || 0}
            </p>

            <p>
                <strong>Deadline:</strong>
                ${job.deadline || "-"}
            </p>

            <div class="skills">

                ${(job.skills || []).map(skill =>

                    `<span class="skill">${skill}</span>`

                ).join("")}

            </div>

            <div class="actions">

                <button
                    class="view-btn"
                    onclick="viewJob('${job.projectId}')">

                    View

                </button>

                <button
                    class="apply-btn"
                    onclick="applyJob('${job.projectId}')">

                    Apply

                </button>

                <button
                    class="remove-btn"
                    onclick="removeSaved('${job.id}')">

                    Remove

                </button>

            </div>

        `;

        savedJobsContainer.appendChild(card);

    });

}

// ======================================
// Search + Filter
// ======================================

function applyFilters() {

    const keyword = searchJob.value.toLowerCase();

    const category = categoryFilter.value;

    const filtered = allJobs.filter(job => {

        const matchSearch =

            (job.title || "")
            .toLowerCase()
            .includes(keyword);

        const matchCategory =

            category === "All" ||

            job.category === category;

        return matchSearch && matchCategory;

    });

    renderJobs(filtered);

}

searchJob.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

// ======================================
// Global Functions
// ======================================

window.viewJob = function(projectId) {

    window.location.href =
        "project-details.html?id=" + projectId;

};

window.applyJob = function(projectId) {

    window.location.href =
        "apply-project.html?id=" + projectId;

};

window.removeSaved = async function(id) {

    const ok = confirm(
        "Remove this job from saved list?"
    );

    if (!ok) return;

    try {

        await deleteDoc(

            doc(db, "savedJobs", id)

        );

        alert("Job removed successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};