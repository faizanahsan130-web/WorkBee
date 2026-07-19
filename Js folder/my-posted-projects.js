// ======================================
// WorkBee - My Posted Projects
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

const projectContainer = document.getElementById("projectContainer");
const searchProject = document.getElementById("searchProject");
const statusFilter = document.getElementById("statusFilter");
const newProjectBtn = document.getElementById("newProjectBtn");

const totalProjects = document.getElementById("totalProjects");
const openProjects = document.getElementById("openProjects");
const completedProjects = document.getElementById("completedProjects");
const proposalCount = document.getElementById("proposalCount");

let currentUser = null;
let projects = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    loadProjects();

});

// ======================================
// Load Projects
// ======================================

function loadProjects() {

    const q = query(

        collection(db, "projects"),

        where("clientId", "==", currentUser.uid)

    );

    onSnapshot(q, (snapshot) => {

        projects = [];

        snapshot.forEach((docSnap) => {

            projects.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        updateStats();

        renderProjects(projects);

    });

}

// ======================================
// Statistics
// ======================================

function updateStats() {

    totalProjects.textContent = projects.length;

    openProjects.textContent =

        projects.filter(

            p => p.status === "Open"

        ).length;

    completedProjects.textContent =

        projects.filter(

            p => p.status === "Completed"

        ).length;

    let totalProposal = 0;

    projects.forEach(item => {

        totalProposal += item.proposals || 0;

    });

    proposalCount.textContent = totalProposal;

}

// ======================================
// Render Projects
// ======================================

function renderProjects(data) {

    projectContainer.innerHTML = "";

    if (data.length === 0) {

        projectContainer.innerHTML = `

        <div class="empty">

            No posted projects found.

        </div>

        `;

        return;

    }

    data.forEach(item => {

        let statusClass = "open";

        if (item.status === "In Progress")
            statusClass = "progress";

        if (item.status === "Completed")
            statusClass = "completed";

        if (item.status === "Closed")
            statusClass = "closed";

        projectContainer.innerHTML += `

        <div class="project-card">

            <h2>${item.title}</h2>

            <p>

                ${item.description}

            </p>

            <p>

                <strong>Budget:</strong>

                $${item.budget}

            </p>

            <p>

                <strong>Deadline:</strong>

                ${item.deadline}

            </p>

            <p>

                <strong>Category:</strong>

                ${item.category}

            </p>

            <span class="status ${statusClass}">

                ${item.status}

            </span>

            <div class="actions">

                <button
                class="view-btn"
                onclick="viewProject('${item.id}')">

                View

                </button>

                <button
                class="edit-btn"
                onclick="editProject('${item.id}')">

                Edit

                </button>

                <button
                class="proposal-btn"
                onclick="reviewProposals('${item.id}')">

                Proposals

                </button>

                <button
                class="delete-btn"
                onclick="deleteProject('${item.id}')">

                Delete

                </button>

            </div>

        </div>

        `;

    });

}

// ======================================
// Search & Filter
// ======================================

function filterProjects() {

    const keyword =

        searchProject.value.toLowerCase();

    const status =

        statusFilter.value;

    const filtered = projects.filter(item => {

        const searchMatch =

            item.title.toLowerCase()

            .includes(keyword);

        const statusMatch =

            status === "All" ||

            item.status === status;

        return searchMatch && statusMatch;

    });

    renderProjects(filtered);

}

searchProject.addEventListener(

    "input",

    filterProjects

);

statusFilter.addEventListener(

    "change",

    filterProjects

);

// ======================================
// Buttons
// ======================================

newProjectBtn.addEventListener("click", () => {

    window.location.href =

    "post-project.html";

});

// ======================================
// Global Functions
// ======================================

window.viewProject = function(id) {

    window.location.href =

    `project-details.html?id=${id}`;

};

window.editProject = function(id) {

    window.location.href =

    `post-project.html?edit=${id}`;

};

window.reviewProposals = function(id) {

    window.location.href =

    `review-proposals.html?project=${id}`;

};

window.deleteProject = async function(id) {

    const ok = confirm(

        "Delete this project?"

    );

    if (!ok) return;

    try {

        await deleteDoc(

            doc(db, "projects", id)

        );

        alert("Project deleted successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};