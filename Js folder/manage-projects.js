// ======================================
// WorkBee Admin - Manage Projects
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const projectsTable = document.getElementById("projectsTable");
const searchProject = document.getElementById("searchProject");

let allProjects = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadProjects();

});

// ======================================
// Load Projects
// ======================================

async function loadProjects() {

    projectsTable.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Loading Projects...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "projects"));

        allProjects = [];

        projectsTable.innerHTML = "";

        if (snapshot.empty) {

            projectsTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No Projects Found
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((projectDoc) => {

            const project = projectDoc.data();

            project.id = projectDoc.id;

            allProjects.push(project);

        });

        renderProjects(allProjects);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Projects
// ======================================

function renderProjects(projects){

    projectsTable.innerHTML = "";

    projects.forEach(project => {

        const status = project.status || "Open";

        const statusClass =
            status === "Approved"
            ? "status-open"
            : status === "Rejected"
            ? "status-closed"
            : "status-pending";

        projectsTable.innerHTML += `

        <tr>

            <td>${project.title || "-"}</td>

            <td>${project.clientEmail || "-"}</td>

            <td>$${project.budget || 0}</td>

            <td>

                <span class="${statusClass}">
                    ${status}
                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewProject('${project.id}')">

                    View

                </button>

                <button
                    class="action-btn approve-btn"
                    onclick="approveProject('${project.id}')">

                    Approve

                </button>

                <button
                    class="action-btn reject-btn"
                    onclick="rejectProject('${project.id}')">

                    Reject

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProject('${project.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

searchProject.addEventListener("input", () => {

    const value = searchProject.value.toLowerCase();

    const filtered = allProjects.filter(project =>

        (project.title || "")
        .toLowerCase()
        .includes(value)

        ||

        (project.clientEmail || "")
        .toLowerCase()
        .includes(value)

    );

    renderProjects(filtered);

});

// ======================================
// View
// ======================================

window.viewProject = function(id){

    const project = allProjects.find(p => p.id === id);

    if(!project) return;

    alert(

`Project : ${project.title || "-"}

Description :
${project.description || "-"}

Category : ${project.category || "-"}

Budget : $${project.budget || 0}

Deadline : ${project.deadline || "-"}

Client : ${project.clientEmail || "-"}

Status : ${project.status || "Open"}`

    );

};

// ======================================
// Approve
// ======================================

window.approveProject = async function(id){

    try{

        await updateDoc(doc(db,"projects",id),{

            status:"Approved"

        });

        alert("Project Approved.");

        loadProjects();

    }

    catch(error){

        alert(error.message);

    }

};

// ======================================
// Reject
// ======================================

window.rejectProject = async function(id){

    try{

        await updateDoc(doc(db,"projects",id),{

            status:"Rejected"

        });

        alert("Project Rejected.");

        loadProjects();

    }

    catch(error){

        alert(error.message);

    }

};

// ======================================
// Delete
// ======================================

window.deleteProject = async function(id){

    const ok = confirm("Delete this project?");

    if(!ok) return;

    try{

        await deleteDoc(doc(db,"projects",id));

        alert("Project Deleted Successfully.");

        loadProjects();

    }

    catch(error){

        alert(error.message);

    }

};