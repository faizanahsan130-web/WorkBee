// ======================================
// WorkBee - Saved Freelancers
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const savedContainer = document.getElementById("savedContainer");
const searchFreelancer = document.getElementById("searchFreelancer");
const categoryFilter = document.getElementById("categoryFilter");

let currentUser = null;
let allFreelancers = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadSavedFreelancers();

});

// ======================================
// Load Saved Freelancers
// ======================================

async function loadSavedFreelancers() {

    try {

        savedContainer.innerHTML =
            "<div class='empty'>Loading...</div>";

        const q = query(
            collection(db, "savedFreelancers"),
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);

        allFreelancers = [];

        savedContainer.innerHTML = "";

        if (snapshot.empty) {

            savedContainer.innerHTML = `
                <div class="empty">
                    ❤️ No Saved Freelancers Found
                </div>
            `;

            return;

        }

        snapshot.forEach((docSnap) => {

            const freelancer = docSnap.data();

            freelancer.id = docSnap.id;

            allFreelancers.push(freelancer);

        });

        renderFreelancers(allFreelancers);

    }

    catch (error) {

        console.error(error);

        savedContainer.innerHTML = `
            <div class="empty">
                ${error.message}
            </div>
        `;

    }

}

// ======================================
// Render Freelancers
// ======================================

function renderFreelancers(list) {

    savedContainer.innerHTML = "";

    if (list.length === 0) {

        savedContainer.innerHTML = `
            <div class="empty">
                No Freelancers Found
            </div>
        `;

        return;

    }

    list.forEach((freelancer) => {

        const card = document.createElement("div");

        card.className = "freelancer-card";

        card.innerHTML = `

            <div class="profile">

                <img
                    src="${freelancer.photoURL || "https://via.placeholder.com/100"}"
                    alt="Profile">

                <div class="profile-info">

                    <h2>${freelancer.name || "Freelancer"}</h2>

                    <p>${freelancer.category || "-"}</p>

                </div>

            </div>

            <div class="details">

                <p><strong>Email:</strong> ${freelancer.email || "-"}</p>

                <p><strong>Country:</strong> ${freelancer.country || "-"}</p>

                <p><strong>Hourly Rate:</strong> $${freelancer.rate || 0}</p>

                <p class="rating">
                    ⭐ ${freelancer.rating || 0}/5
                </p>

            </div>

            <div class="skills">

                ${(freelancer.skills || []).map(skill =>
                    `<span class="skill">${skill}</span>`
                ).join("")}

            </div>

            <div class="actions">

                <button
                    class="profile-btn"
                    onclick="viewProfile('${freelancer.freelancerId}')">

                    View Profile

                </button>

                <button
                    class="chat-btn"
                    onclick="openChat('${freelancer.freelancerId}')">

                    Chat

                </button>

                <button
                    class="hire-btn"
                    onclick="hireFreelancer('${freelancer.freelancerId}')">

                    Hire

                </button>

                <button
                    class="remove-btn"
                    onclick="removeSaved('${freelancer.id}')">

                    Remove

                </button>

            </div>

        `;

        savedContainer.appendChild(card);

    });

}

// ======================================
// Search + Filter
// ======================================

function applyFilters() {

    const keyword = searchFreelancer.value.toLowerCase();

    const category = categoryFilter.value;

    const filtered = allFreelancers.filter((item) => {

        const matchSearch =
            (item.name || "")
            .toLowerCase()
            .includes(keyword);

        const matchCategory =
            category === "All" ||
            item.category === category;

        return matchSearch && matchCategory;

    });

    renderFreelancers(filtered);

}

searchFreelancer.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

// ======================================
// Global Functions
// ======================================

window.viewProfile = function(id){

    window.location.href =
        "freelancer-profile.html?id=" + id;

};

window.openChat = function(id){

    window.location.href =
        "chat.html?user=" + id;

};

window.hireFreelancer = function(id){

    window.location.href =
        "post-project.html?hire=" + id;

};

window.removeSaved = async function(id){

    const ok = confirm(
        "Remove this freelancer from saved list?"
    );

    if(!ok) return;

    try{

        await deleteDoc(
            doc(db,"savedFreelancers",id)
        );

        loadSavedFreelancers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};