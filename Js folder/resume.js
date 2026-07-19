// ======================================
// WorkBee Resume.js V2
// Part 1 - Imports, Elements & Auth
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const resumeFile = document.getElementById("resumeFile");

const uploadResumeBtn = document.getElementById("uploadResumeBtn");

const viewResume = document.getElementById("viewResume");

const previewResume = document.getElementById("previewResume");

const downloadResume = document.getElementById("downloadResume");

const replaceResume = document.getElementById("replaceResume");

const deleteResume = document.getElementById("deleteResume");

const resumeName = document.getElementById("resumeName");

const resumeType = document.getElementById("resumeType");

const resumeSize = document.getElementById("resumeSize");

const resumeDate = document.getElementById("resumeDate");

const resumeStatus = document.getElementById("resumeStatus");

const uploadProgress = document.getElementById("uploadProgress");

const progressText = document.getElementById("progressText");

// ======================================
// Global Variables
// ======================================

let currentUser = null;

let resumeUrl = "";

let resumePublicId = "";

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadResume();

});

// ======================================
// Load Resume
// ======================================

async function loadResume() {

    try {

        const snap = await getDoc(doc(db, "users", currentUser.uid));

        if (!snap.exists()) return;

        const data = snap.data();

        if (!data.resumeUrl) return;

        resumeUrl = data.resumeUrl;

        resumePublicId = data.resumePublicId || "";

        resumeName.textContent = data.resumeName || "-";

        resumeType.textContent = data.resumeType || "-";

        resumeSize.textContent = data.resumeSize || "-";

        resumeDate.textContent = data.resumeDate || "-";

        resumeStatus.textContent = "Uploaded";

        console.log("✅ Resume Loaded");

    }

    catch (error) {

        console.error(error);

        alert("Resume load failed.");

    }

}

// ======================================
// File Validation
// ======================================

function validateResume(file) {

    if (!file) {

        alert("Please select a resume.");

        return false;

    }

    const allowed = [

        "application/pdf",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];

    if (!allowed.includes(file.type)) {

        alert("Only PDF, DOC and DOCX files are allowed.");

        return false;

    }

    if (file.size > 10 * 1024 * 1024) {

        alert("Maximum file size is 10MB.");

        return false;

    }

    return true;

}

console.log("📄 Resume Module Loaded");
// ======================================
// Upload Resume
// ======================================

uploadResumeBtn.addEventListener("click", async () => {

    const file = resumeFile.files[0];

    if (!validateResume(file)) return;

    uploadResumeBtn.disabled = true;
    uploadResumeBtn.innerHTML = "Uploading...";

    if (uploadProgress) uploadProgress.value = 0;
    if (progressText) progressText.innerText = "0%";

    const formData = new FormData();
    formData.append("image", file); // API currently uses "image"

    try {

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Upload failed.");
        }

        resumeUrl = data.imageUrl;
        resumePublicId = data.publicId || "";

        if (uploadProgress) uploadProgress.value = 100;
        if (progressText) progressText.innerText = "100%";

        const today = new Date().toLocaleDateString();

        await setDoc(
            doc(db, "users", currentUser.uid),
            {
                resumeUrl: resumeUrl,
                resumePublicId: resumePublicId,
                resumeName: file.name,
                resumeType: file.type,
                resumeSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
                resumeDate: today,
                updatedAt: serverTimestamp()
            },
            { merge: true }
        );

        resumeName.innerText = file.name;
        resumeType.innerText = file.type;
        resumeSize.innerText = (file.size / 1024 / 1024).toFixed(2) + " MB";
        resumeDate.innerText = today;
        resumeStatus.innerText = "Uploaded";

        alert("✅ Resume uploaded successfully.");

    } catch (error) {

        console.error(error);

        alert(error.message);

    } finally {

        uploadResumeBtn.disabled = false;
        uploadResumeBtn.innerHTML = "⬆ Upload Resume";

    }

});

// ======================================
// View Resume
// ======================================

viewResume.addEventListener("click", () => {

    if (!resumeUrl) {

        alert("No resume uploaded.");

        return;

    }

    window.open(resumeUrl, "_blank");

});

// ======================================
// Preview Resume
// ======================================

if (previewResume) {

    previewResume.addEventListener("click", () => {

        if (!resumeUrl) {

            alert("No resume uploaded.");

            return;

        }

        window.open(resumeUrl, "_blank");

    });

}

// ======================================
// Download Resume
// ======================================

downloadResume.addEventListener("click", () => {

    if (!resumeUrl) {

        alert("No resume uploaded.");

        return;

    }

    const link = document.createElement("a");

    link.href = resumeUrl;

    link.download = resumeName.innerText;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

});

// ======================================
// Replace Resume
// ======================================

replaceResume.addEventListener("click", () => {

    resumeFile.click();

});
// ======================================
// Delete Resume
// ======================================

deleteResume.addEventListener("click", async () => {

    if (!resumeUrl) {

        alert("No resume uploaded.");

        return;

    }

    const confirmDelete = confirm("Are you sure you want to delete your resume?");

    if (!confirmDelete) return;

    try {

        await setDoc(
            doc(db, "users", currentUser.uid),
            {
                resumeUrl: "",
                resumePublicId: "",
                resumeName: "",
                resumeType: "",
                resumeSize: "",
                resumeDate: "",
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

        resumeUrl = "";
        resumePublicId = "";

        resumeName.innerText = "No Resume Uploaded";
        resumeType.innerText = "-";
        resumeSize.innerText = "-";
        resumeDate.innerText = "-";
        resumeStatus.innerText = "Not Uploaded";

        if (uploadProgress) uploadProgress.value = 0;
        if (progressText) progressText.innerText = "0%";

        resumeFile.value = "";

        alert("✅ Resume deleted successfully.");

    }

    catch (error) {

        console.error(error);

        alert("Delete failed: " + error.message);

    }

});

// ======================================
// Auto Refresh Resume Information
// ======================================

async function refreshResume() {

    if (!currentUser) return;

    await loadResume();

}

// ======================================
// Reset Upload Progress
// ======================================

function resetProgress() {

    if (uploadProgress) {

        uploadProgress.value = 0;

    }

    if (progressText) {

        progressText.innerText = "0%";

    }

}

// ======================================
// Resume File Selection
// ======================================

resumeFile.addEventListener("change", () => {

    const file = resumeFile.files[0];

    if (!file) return;

    resumeName.innerText = file.name;

    resumeType.innerText = file.type;

    resumeSize.innerText = (file.size / 1024 / 1024).toFixed(2) + " MB";

});

// ======================================
// Helper Function
// ======================================

function formatDate(date = new Date()) {

    return date.toLocaleDateString() + " " +

           date.toLocaleTimeString();

}

// ======================================
// Console Logs
// ======================================

console.log("====================================");

console.log("📄 WorkBee Resume Module Loaded");

console.log("Firebase Connected");

console.log("Cloudinary Connected");

console.log("Resume Ready");

console.log("====================================");