// ======================================
// WorkBee - AI Job Matching
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const jobsContainer = document.getElementById("jobsContainer");
const searchJob = document.getElementById("searchJob");
const categoryFilter = document.getElementById("categoryFilter");

let currentUser = null;
let allJobs = [];
let userSkills = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    // Demo skills
    // Future: Load from Firestore users collection
    userSkills = [
        "HTML",
        "CSS",
        "JavaScript",
        "Firebase"
    ];

    await loadJobs();

});

// ======================================
// Load Jobs
// ======================================

async function loadJobs() {

    jobsContainer.innerHTML =
        "<div class='empty'>Loading AI Recommendations...</div>";

    try {

        const snapshot = await getDocs(collection(db, "projects"));

        allJobs = [];

        snapshot.forEach(docSnap => {

            const data = docSnap.data();

            data.id = docSnap.id;

            data.match = calculateMatch(data.skills || []);

            allJobs.push(data);

        });

        // Highest match first
        allJobs.sort((a, b) => b.match - a.match);

        renderJobs(allJobs);

    }

    catch (error) {

        console.error(error);

        jobsContainer.innerHTML =
            `<div class="empty">${error.message}</div>`;

    }

}

// ======================================
// AI Match Calculation
// ======================================

function calculateMatch(projectSkills) {

    if (!projectSkills.length) return 50;

    let matched = 0;

    projectSkills.forEach(skill => {

        if (
            userSkills
                .map(s => s.toLowerCase())
                .includes(skill.toLowerCase())
        ) {
            matched++;
        }

    });

    return Math.round(
        (matched / projectSkills.length) * 100
    );

}

// ======================================
// Render Jobs
// ======================================

function renderJobs(list) {

    jobsContainer.innerHTML = "";

    if (!list.length) {

        jobsContainer.innerHTML =
            `<div class="empty">No matching jobs found.</div>`;

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

            <div class="match-score">

                <div class="match-header">

                    <span>AI Match</span>

                    <span>${job.match}%</span>

                </div>

                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${job.match}%">
                    </div>

                </div>

            </div>

            <div class="skills">

                ${(job.skills || []).map(skill =>
                    `<span class="skill">${skill}</span>`
                ).join("")}

            </div>

            <div class="actions">

                <button
                    class="view-btn"
                    onclick="viewJob('${job.id}')">

                    View

                </button>

                <button
                    class="apply-btn"
                    onclick="applyJob('${job.id}')">

                    Apply

                </button>

                <button
                    class="save-btn"
                    onclick="saveJob('${job.id}')">

                    Save

                </button>

                <button
                    class="share-btn"
                    onclick="shareJob('${job.id}')">

                    Share

                </button>

            </div>

        `;

        jobsContainer.appendChild(card);

    });

}

// ======================================
// Search & Filter
// ======================================

function applyFilters() {

    const keyword =
        searchJob.value.toLowerCase();

    const category =
        categoryFilter.value;

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

window.viewJob = function(id) {

    window.location.href =
        "project-details.html?id=" + id;

};

window.applyJob = async function(id) {

    try {

        await addDoc(
            collection(db, "applications"),
            {

                projectId: id,

                freelancerId: currentUser.uid,

                freelancerEmail: currentUser.email,

                status: "Pending",

                appliedAt: serverTimestamp()

            }
        );

        alert("Application submitted successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

window.saveJob = async function(id) {

    try {

        await addDoc(
            collection(db, "savedJobs"),
            {

                userId: currentUser.uid,

                projectId: id,

                savedAt: serverTimestamp()

            }
        );

        alert("Job saved successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

window.shareJob = function(id) {

    const url =
        window.location.origin +
        "/project-details.html?id=" +
        id;

    navigator.clipboard.writeText(url);

    alert("Project link copied to clipboard!");

};