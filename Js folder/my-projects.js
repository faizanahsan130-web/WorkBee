// ======================================
// WorkBee - My Projects
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
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("projectsContainer");

// ==========================
// Check Login
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadProjects(user);

});

// ==========================
// Load Client Projects
// ==========================

async function loadProjects(user) {

    container.innerHTML = "<h2>Loading...</h2>";

    try {

        const q = query(
            collection(db, "projects"),
            where("clientId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        container.innerHTML = "";

        if (snapshot.empty) {

            container.innerHTML = `
                <h2 style="text-align:center;">
                    You haven't posted any projects yet.
                </h2>
            `;

            return;

        }

        snapshot.forEach((projectDoc) => {

            const project = projectDoc.data();

            const id = projectDoc.id;

            createCard(id, project);

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <h2 style="color:red;">
                ${error.message}
            </h2>
        `;

    }

}

// ==========================
// Create Project Card
// ==========================

function createCard(id, project) {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `

        <h3>${project.title}</h3>

        <p>${project.description}</p>

        <p><strong>Category:</strong> ${project.category}</p>

        <p><strong>Budget:</strong> $${project.budget}</p>

        <p><strong>Deadline:</strong> ${project.deadline}</p>

        <span class="status">
            ${project.status || "Active"}
        </span>

        <div class="buttons">

            <button class="view">
                View Applications
            </button>

            <button class="edit">
                Edit
            </button>

            <button class="delete">
                Delete
            </button>

        </div>

    `;

    // View Applications

    card.querySelector(".view").addEventListener("click", () => {

        window.location.href =
            "view-applications.html?projectId=" + id;

    });

    // Edit Project

    card.querySelector(".edit").addEventListener("click", () => {

        window.location.href =
            "edit-project.html?id=" + id;

    });

    // Delete Project

    card.querySelector(".delete").addEventListener("click", async () => {

        const confirmDelete = confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmDelete) return;

        try {

            await deleteDoc(doc(db, "projects", id));

            alert("✅ Project Deleted");

            card.remove();

        } catch (error) {

            alert(error.message);

        }

    });

    container.appendChild(card);

}