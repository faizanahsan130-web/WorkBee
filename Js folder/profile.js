import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
// ======================================
// WorkBee Profile.js V2
// Part 1 - Imports, Elements, Auth & Load
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const profileForm = document.getElementById("profileForm");

const profilePreview = document.getElementById("profilePreview");

const profileImage = document.getElementById("profileImage");

const uploadBtn = document.getElementById("uploadBtn");

const fullName = document.getElementById("fullName");

const email = document.getElementById("email");

const phone = document.getElementById("phone");

const country = document.getElementById("country");

const city = document.getElementById("city");

const skills = document.getElementById("skills");

const bio = document.getElementById("bio");

const website = document.getElementById("website");

// ===== New Fields =====

const jobTitle = document.getElementById("jobTitle");

const hourlyRate = document.getElementById("hourlyRate");

const experience = document.getElementById("experience");

const languages = document.getElementById("languages");

const availability = document.getElementById("availability");

const linkedin = document.getElementById("linkedin");

const github = document.getElementById("github");

const fiverr = document.getElementById("fiverr");

const upwork = document.getElementById("upwork");

// ======================================
// Global Variables
// ======================================

let currentUser = null;

let profileImageUrl = "";

let profileLoaded = false;

// ======================================
// Authentication Check
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    email.value = user.email;

    email.readOnly = true;

    await loadProfile();

});

// ======================================
// Load User Profile
// ======================================

async function loadProfile() {

    try {

        const docRef = doc(db, "users", currentUser.uid);

        const snap = await getDoc(docRef);

        if (!snap.exists()) {

            profileLoaded = true;

            return;

        }

        const data = snap.data();

        fullName.value = data.fullName || "";

        phone.value = data.phone || "";

        country.value = data.country || "";

        city.value = data.city || "";

        skills.value = data.skills || "";

        bio.value = data.bio || "";

        website.value = data.website || "";

        jobTitle.value = data.jobTitle || "";

        hourlyRate.value = data.hourlyRate || "";

        experience.value = data.experience || "";

        languages.value = data.languages || "";

        availability.value = data.availability || "";

        linkedin.value = data.linkedin || "";

        github.value = data.github || "";

        fiverr.value = data.fiverr || "";

        upwork.value = data.upwork || "";

        profileImageUrl = data.profileImage || "";

        if (profileImageUrl !== "") {

            profilePreview.src = profileImageUrl;

        }

        profileLoaded = true;

        console.log("✅ Profile Loaded");

    }

    catch (error) {

        console.error(error);

        alert("Profile load failed.");

    }

}

// ======================================
// Image Preview
// ======================================

profileImage.addEventListener("change", () => {

    const file = profileImage.files[0];

    if (!file) return;

    profilePreview.src = URL.createObjectURL(file);

});
// ======================================
// Cloudinary Upload
// ======================================

uploadBtn.addEventListener("click", async () => {

    const file = profileImage.files[0];

    if (!file) {

        alert("Please select a profile image.");

        return;

    }

    uploadBtn.disabled = true;

    uploadBtn.innerHTML = "Uploading...";

    const formData = new FormData();

    formData.append("image", file);

    try {

        const response = await fetch("http://localhost:3000/upload", {

            method: "POST",

            body: formData

        });

        const data = await response.json();

        if (!data.success) {

            throw new Error(data.message);

        }

        profileImageUrl = data.imageUrl;

        profilePreview.src = profileImageUrl;

        alert("✅ Profile photo uploaded successfully.");

    }

    catch (error) {

        console.error(error);

        alert("Image upload failed.");

    }

    finally {

        uploadBtn.disabled = false;

        uploadBtn.innerHTML = "📷 Upload Photo";

    }

});

// ======================================
// Validation
// ======================================

function validateProfile() {

    if (fullName.value.trim().length < 3) {

        alert("Full name must contain at least 3 characters.");

        return false;

    }

    if (phone.value.trim() !== "" && phone.value.length < 10) {

        alert("Please enter a valid phone number.");

        return false;

    }

    if (hourlyRate.value !== "" && Number(hourlyRate.value) < 0) {

        alert("Hourly rate cannot be negative.");

        return false;

    }

    return true;

}

// ======================================
// Save Profile
// ======================================

profileForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!validateProfile()) return;

    const submitButton = profileForm.querySelector("button[type='submit']");

    submitButton.disabled = true;

    submitButton.innerHTML = "Saving...";

    try {

        await setDoc(

            doc(db, "users", currentUser.uid),

            {

                uid: currentUser.uid,

                fullName: fullName.value.trim(),

                email: currentUser.email,

                phone: phone.value.trim(),

                country: country.value.trim(),

                city: city.value.trim(),

                skills: skills.value.trim(),

                bio: bio.value.trim(),

                website: website.value.trim(),

                jobTitle: jobTitle.value.trim(),

                hourlyRate: hourlyRate.value,

                experience: experience.value,

                languages: languages.value.trim(),

                availability: availability.value,

                linkedin: linkedin.value.trim(),

                github: github.value.trim(),

                fiverr: fiverr.value.trim(),

                upwork: upwork.value.trim(),

                profileImage: profileImageUrl,

                updatedAt: serverTimestamp()

            },

            {

                merge: true

            }

        );

        alert("✅ Profile saved successfully.");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        submitButton.disabled = false;

        submitButton.innerHTML = "💾 Save Profile";

    }

});
// ======================================
// Profile Completion Percentage
// ======================================

function calculateProfileCompletion() {

    const fields = [

        fullName.value,
        email.value,
        phone.value,
        country.value,
        city.value,
        skills.value,
        bio.value,
        website.value,
        jobTitle.value,
        hourlyRate.value,
        experience.value,
        languages.value,
        availability.value,
        linkedin.value,
        github.value,
        fiverr.value,
        upwork.value,
        profileImageUrl

    ];

    let completed = 0;

    fields.forEach(field => {

        if (field && field.toString().trim() !== "") {

            completed++;

        }

    });

    const percentage = Math.round((completed / fields.length) * 100);

    console.log(`Profile Completion: ${percentage}%`);
document.getElementById("profileProgress").value = percentage;

document.getElementById("progressText").innerText = percentage + "%";
    return percentage;

}

// ======================================
// Auto Calculate on Input
// ======================================

document.querySelectorAll("input, textarea, select").forEach(element => {

    element.addEventListener("input", () => {

        calculateProfileCompletion();

    });

});

// ======================================
// Warn Before Leaving Page
// ======================================

let formChanged = false;

document.querySelectorAll("input, textarea, select").forEach(element => {

    element.addEventListener("change", () => {

        formChanged = true;

    });

});

window.addEventListener("beforeunload", (e) => {

    if (!formChanged) return;

    e.preventDefault();

    e.returnValue = "";

});

// ======================================
// Clear Change Flag After Save
// ======================================

profileForm.addEventListener("submit", () => {

    formChanged = false;

});

// ======================================
// Default Avatar
// ======================================

profilePreview.onerror = () => {

    profilePreview.src =
        "https://ui-avatars.com/api/?name=WorkBee&background=f5c542&color=000";

};

// ======================================
// Console Message
// ======================================

console.log("===================================");

console.log("🐝 WorkBee Profile Module Loaded");

console.log("Firebase Connected");

console.log("Cloudinary Connected");

console.log("Profile Ready");

console.log("===================================");