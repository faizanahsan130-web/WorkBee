// ======================================
// WorkBee - Settings & Preferences
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const settingsForm = document.getElementById("settingsForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");

const theme = document.getElementById("theme");
const language = document.getElementById("language");

const emailNotifications =
    document.getElementById("emailNotifications");

const pushNotifications =
    document.getElementById("pushNotifications");

const profilePublic =
    document.getElementById("profilePublic");

const showOnlineStatus =
    document.getElementById("showOnlineStatus");

let currentUser = null;

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    email.value = user.email;

    fullName.value = user.displayName || "";

    await loadSettings();

});

// ======================================
// Load Settings
// ======================================

async function loadSettings() {

    try {

        const ref = doc(db, "userSettings", currentUser.uid);

        const snap = await getDoc(ref);

        if (!snap.exists()) {

            applyTheme(localStorage.getItem("theme") || "light");

            return;

        }

        const data = snap.data();

        theme.value = data.theme || "light";
        language.value = data.language || "en";

        emailNotifications.checked =
            data.emailNotifications || false;

        pushNotifications.checked =
            data.pushNotifications || false;

        profilePublic.checked =
            data.profilePublic || false;

        showOnlineStatus.checked =
            data.showOnlineStatus || false;

        applyTheme(theme.value);

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================
// Save Settings
// ======================================

settingsForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        await updateProfile(currentUser, {

            displayName: fullName.value

        });

        await setDoc(

            doc(db, "userSettings", currentUser.uid),

            {

                fullName: fullName.value,

                email: currentUser.email,

                theme: theme.value,

                language: language.value,

                emailNotifications:
                    emailNotifications.checked,

                pushNotifications:
                    pushNotifications.checked,

                profilePublic:
                    profilePublic.checked,

                showOnlineStatus:
                    showOnlineStatus.checked,

                updatedAt: serverTimestamp()

            }

        );

        localStorage.setItem("theme", theme.value);

        applyTheme(theme.value);

        alert("Settings saved successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// ======================================
// Theme
// ======================================

theme.addEventListener("change", () => {

    applyTheme(theme.value);

});

function applyTheme(mode) {

    if (mode === "dark") {

        document.body.classList.add("dark");

    }

    else {

        document.body.classList.remove("dark");

    }

}

// ======================================
// Reset
// ======================================

settingsForm.addEventListener("reset", () => {

    setTimeout(() => {

        applyTheme("light");

    }, 50);

});

// ======================================
// Auto Apply Theme
// ======================================

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {

    applyTheme(savedTheme);

}