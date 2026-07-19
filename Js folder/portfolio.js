// ======================================
// WorkBee Portfolio.js V2
// Part 1 - Firebase, Elements & Auth
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const portfolioForm = document.getElementById("portfolioForm");

const projectTitle = document.getElementById("projectTitle");

const projectCategory = document.getElementById("projectCategory");

const projectDescription = document.getElementById("projectDescription");

const projectSkills = document.getElementById("projectSkills");

const projectLink = document.getElementById("projectLink");

const githubLink = document.getElementById("githubLink");

const projectImage = document.getElementById("projectImage");

const savePortfolio = document.getElementById("savePortfolio");

const searchPortfolio = document.getElementById("searchPortfolio");

const uploadProgress = document.getElementById("uploadProgress");

const progressText = document.getElementById("progressText");

const portfolioContainer = document.getElementById("portfolioContainer");

const totalProjects = document.getElementById("totalProjects");

const portfolioViews = document.getElementById("portfolioViews");

const portfolioLikes = document.getElementById("portfolioLikes");

// ======================================
// Global Variables
// ======================================

let currentUser = null;

let portfolioData = [];

let uploadedImage = "";

let uploadedPublicId = "";

let editMode = false;

let editDocumentId = "";

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    console.log("✅ Logged in:", user.email);

    await loadPortfolio();

});

// ======================================
// Image Preview
// ======================================

projectImage.addEventListener("change", () => {

    const file = projectImage.files[0];

    if (!file) return;

    console.log("Selected Image:", file.name);

});

// ======================================
// Validation
// ======================================

function validatePortfolio() {

    if (projectTitle.value.trim() === "") {

        alert("Please enter project title.");

        return false;

    }

    if (projectCategory.value.trim() === "") {

        alert("Please select category.");

        return false;

    }

    if (projectDescription.value.trim() === "") {

        alert("Please enter description.");

        return false;

    }

    return true;

}

// ======================================
// Reset Form
// ======================================

function resetForm() {

    portfolioForm.reset();

    uploadedImage = "";

    uploadedPublicId = "";

    editMode = false;

    editDocumentId = "";

    savePortfolio.innerHTML = "💾 Save Portfolio";

    if (uploadProgress) {

        uploadProgress.value = 0;

    }

    if (progressText) {

        progressText.innerHTML = "0%";

    }

}

// ======================================
// Loading
// ======================================

function showLoading() {

    portfolioContainer.innerHTML = `

        <div class="loading">

            Loading Portfolio...

        </div>

    `;

}

console.log("==================================");

console.log("🚀 WorkBee Portfolio Module Loaded");

console.log("Firebase Connected");

console.log("Waiting for Upload Module...");

console.log("==================================");
// ======================================
// Part 2 - Image Upload & Save Portfolio
// ======================================

// Upload Image to Cloudinary
async function uploadPortfolioImage(file) {

    if (!file) return "";

    const formData = new FormData();
    formData.append("image", file);

    try {

        savePortfolio.disabled = true;
        savePortfolio.innerHTML = "Uploading...";

        if (uploadProgress) uploadProgress.value = 10;
        if (progressText) progressText.innerHTML = "10%";

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        if (uploadProgress) uploadProgress.value = 80;
        if (progressText) progressText.innerHTML = "80%";

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(data.message || "Image upload failed.");

        }

        uploadedImage = data.imageUrl;
        uploadedPublicId = data.publicId || "";

        if (uploadProgress) uploadProgress.value = 100;
        if (progressText) progressText.innerHTML = "100%";

        return uploadedImage;

    }

    catch (error) {

        console.error(error);

        alert(error.message);

        return "";

    }

    finally {

        savePortfolio.disabled = false;

        savePortfolio.innerHTML = editMode
            ? "💾 Update Portfolio"
            : "💾 Save Portfolio";

    }

}

// ======================================
// Save / Update Portfolio
// ======================================

portfolioForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validatePortfolio()) return;

    try {

        const imageFile = projectImage.files[0];

        if (imageFile) {

            await uploadPortfolioImage(imageFile);

        }

        const portfolioObject = {

            userId: currentUser.uid,

            title: projectTitle.value.trim(),

            category: projectCategory.value,

            description: projectDescription.value.trim(),

            skills: projectSkills.value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== ""),

            projectLink: projectLink.value.trim(),

            githubLink: githubLink.value.trim(),

            image: uploadedImage,

            publicId: uploadedPublicId,

            views: 0,

            likes: 0,

            updatedAt: serverTimestamp()

        };

        if (editMode) {

            await updateDoc(

                doc(db, "portfolio", editDocumentId),

                portfolioObject

            );

            alert("✅ Portfolio updated successfully.");

        }

        else {

            portfolioObject.createdAt = serverTimestamp();

            await addDoc(

                collection(db, "portfolio"),

                portfolioObject

            );

            alert("✅ Portfolio added successfully.");

        }

        resetForm();

        await loadPortfolio();

    }

    catch (error) {

        console.error(error);

        alert("Error: " + error.message);

    }

});
// ======================================
// Part 3 - Load Portfolio & Render Cards
// ======================================

async function loadPortfolio() {

    if (!currentUser) return;

    showLoading();

    try {

        const q = query(
            collection(db, "portfolio"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        portfolioData = [];

        let totalViewsCount = 0;
        let totalLikesCount = 0;

        portfolioContainer.innerHTML = "";

        if (snapshot.empty) {

            portfolioContainer.innerHTML = `
                <div class="empty-state">

                    <h2>📂 No Portfolio Projects</h2>

                    <p>
                        Add your first project to start impressing clients.
                    </p>

                </div>
            `;

            totalProjects.innerText = "0";
            portfolioViews.innerText = "0";
            portfolioLikes.innerText = "0";

            return;
        }

        snapshot.forEach((docSnap) => {

            const item = {
                id: docSnap.id,
                ...docSnap.data()
            };

            portfolioData.push(item);

            totalViewsCount += item.views || 0;
            totalLikesCount += item.likes || 0;

        });

        totalProjects.innerText = portfolioData.length;
        portfolioViews.innerText = totalViewsCount;
        portfolioLikes.innerText = totalLikesCount;

        renderPortfolio(portfolioData);

    }

    catch (error) {

        console.error(error);

        portfolioContainer.innerHTML = `
            <div class="empty-state">

                <h2>❌ Error Loading Portfolio</h2>

                <p>${error.message}</p>

            </div>
        `;

    }

}

// ======================================
// Render Portfolio Cards
// ======================================

function renderPortfolio(data) {

    portfolioContainer.innerHTML = "";

    data.forEach(item => {

        portfolioContainer.innerHTML += `

<div class="portfolio-card">

<img
src="${item.image || "https://via.placeholder.com/600x350?text=WorkBee"}"
alt="${item.title}">

<div class="portfolio-content">

<h2>

${item.title}

</h2>

<p>

${item.description}

</p>

<div class="portfolio-category">

📁 ${item.category || "General"}

</div>

<div class="portfolio-skills">

${(item.skills || [])

.map(skill =>

`<span class="skill">${skill}</span>`)

.join("")}

</div>

<div class="portfolio-links">

${item.projectLink ?

`<a href="${item.projectLink}"

target="_blank">

🌐 Live Demo

</a>`

: ""}

${item.githubLink ?

`<a href="${item.githubLink}"

target="_blank">

💻 GitHub

</a>`

: ""}

</div>

<div class="portfolio-footer">

<div>

👁 ${item.views || 0}

&nbsp;&nbsp;

❤️ ${item.likes || 0}

</div>

<div>

<button
class="edit-btn"
onclick="editPortfolio('${item.id}')">

✏ Edit

</button>

<button
class="delete-btn"
onclick="deletePortfolio('${item.id}')">

🗑 Delete

</button>

</div>

</div>

</div>

</div>

        `;

    });

}

console.log("✅ Portfolio Renderer Ready");
// ======================================
// Part 4 - Search, Edit & Delete
// ======================================

// ---------- Search Portfolio ----------

if (searchPortfolio) {

    searchPortfolio.addEventListener("input", () => {

        const keyword = searchPortfolio.value
            .toLowerCase()
            .trim();

        if (keyword === "") {

            renderPortfolio(portfolioData);

            return;

        }

        const filtered = portfolioData.filter(item => {

            return (

                (item.title || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.category || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.description || "")
                    .toLowerCase()
                    .includes(keyword)

                ||

                (item.skills || [])
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)

            );

        });

        renderPortfolio(filtered);

    });

}

// ======================================
// Delete Portfolio
// ======================================

window.deletePortfolio = async function(id) {

    const ok = confirm(
        "Are you sure you want to delete this project?"
    );

    if (!ok) return;

    try {

        await deleteDoc(doc(db, "portfolio", id));

        portfolioData =
            portfolioData.filter(item => item.id !== id);

        renderPortfolio(portfolioData);

        totalProjects.innerText = portfolioData.length;

        alert("✅ Portfolio deleted successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Edit Portfolio
// ======================================

window.editPortfolio = function(id) {

    const item = portfolioData.find(p => p.id === id);

    if (!item) return;

    editMode = true;

    editDocumentId = id;

    projectTitle.value = item.title || "";

    projectCategory.value = item.category || "";

    projectDescription.value =
        item.description || "";

    projectSkills.value =
        (item.skills || []).join(", ");

    projectLink.value =
        item.projectLink || "";

    githubLink.value =
        item.githubLink || "";

    uploadedImage =
        item.image || "";

    uploadedPublicId =
        item.publicId || "";

    savePortfolio.innerHTML =
        "💾 Update Portfolio";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

// ======================================
// Preview Selected Image
// ======================================

projectImage.addEventListener("change", () => {

    const file = projectImage.files[0];

    if (!file) return;

    console.log(
        "📷 Selected:",
        file.name
    );

});

// ======================================
// Refresh Portfolio
// ======================================

async function refreshPortfolio() {

    await loadPortfolio();

}

console.log("✅ Search Ready");
console.log("✅ Edit Ready");
console.log("✅ Delete Ready");
// ======================================
// WorkBee Portfolio.js V2
// Part 5 - Final Cleanup & Production
// ======================================

// ===============================
// Better Validation
// ===============================

function validateImage(file) {

    if (!file) return true;

    const allowedTypes = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"

    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Only JPG, PNG and WEBP images are allowed.");

        return false;

    }

    if (file.size > 5 * 1024 * 1024) {

        alert("Maximum image size is 5 MB.");

        return false;

    }

    return true;

}

// ===============================
// Reset Statistics
// ===============================

function resetStatistics() {

    totalProjects.textContent = "0";

    portfolioViews.textContent = "0";

    portfolioLikes.textContent = "0";

}

// ===============================
// Empty State
// ===============================

function showEmptyPortfolio() {

    resetStatistics();

    portfolioContainer.innerHTML = `

        <div class="empty-state">

            <h2>📂 No Portfolio Projects</h2>

            <p>

                Start by adding your first portfolio project.

            </p>

        </div>

    `;

}

// ===============================
// Escape HTML
// ===============================

function escapeHTML(text) {

    if (!text) return "";

    const div = document.createElement("div");

    div.innerText = text;

    return div.innerHTML;

}

// ===============================
// Project Counter
// ===============================

function updateProjectCounter() {

    totalProjects.textContent = portfolioData.length;

}

// ===============================
// Success Message
// ===============================

function showSuccess(message) {

    console.log("✅ " + message);

}

// ===============================
// Error Message
// ===============================

function showError(message) {

    console.error(message);

    alert(message);

}

// ===============================
// Image Error Placeholder
// ===============================

document.addEventListener("error", function (e) {

    if (e.target.tagName === "IMG") {

        e.target.src =
        "https://via.placeholder.com/600x350?text=WorkBee";

    }

}, true);

// ===============================
// Page Ready
// ===============================

window.addEventListener("load", () => {

    console.log("====================================");

    console.log("🐝 WorkBee Portfolio V2 Loaded");

    console.log("Firebase Connected");

    console.log("Portfolio Ready");

    console.log("Production Build");

    console.log("====================================");

});

// ===============================
// Export
// ===============================

export {

    loadPortfolio

};