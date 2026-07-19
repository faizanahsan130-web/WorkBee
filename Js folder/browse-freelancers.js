// ======================================
// WorkBee Browse Projects
// ======================================

import { db } from "../firebase/firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("projectsContainer");
const searchInput = document.getElementById("search");

let allProjects = [];

// ======================================
// Load Projects
// ======================================

async function loadProjects() {

    container.innerHTML = `
        <h2 style="text-align:center;">
            Loading Projects...
        </h2>
    `;

    try {

        const snapshot = await getDocs(collection(db, "projects"));

        container.innerHTML = "";
        allProjects = [];

        if (snapshot.empty) {

            container.innerHTML = `
                <h2 style="text-align:center;margin-top:40px;">
                    🚫 No Projects Available
                </h2>
            `;

            return;

        }

        snapshot.forEach((projectDoc) => {

            const project = {

                id: projectDoc.id,

                ...projectDoc.data()

            };

            allProjects.push(project);

            createCard(project);

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

// ======================================
// Create Project Card
// ======================================

function createCard(project) {

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `

        <h2>${project.title || "No Title"}</h2>

        <p>${project.description || ""}</p>

        <h4>Category: ${project.category || "-"}</h4>

        <h4>Budget: $${project.budget || 0}</h4>

        <h4>Deadline: ${project.deadline || "Not Set"}</h4>

        <button class="applyBtn">Apply Now</button>

    `;

    // Hover Effect

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-8px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

    // Apply Button

    const applyBtn = card.querySelector(".applyBtn");

    applyBtn.addEventListener("click", () => {

        window.location.href =
            "apply-project.html?projectId=" +
            encodeURIComponent(project.id) +
            "&title=" +
            encodeURIComponent(project.title);

    });

    container.appendChild(card);

}

// ======================================
// Search Projects
// ======================================

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    container.innerHTML = "";

    allProjects
        .filter(project =>

            (project.title || "").toLowerCase().includes(value) ||

            (project.category || "").toLowerCase().includes(value)

        )
        .forEach(createCard);

});

// ======================================
// Start
// ======================================

loadProjects();