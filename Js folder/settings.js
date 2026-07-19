// ======================================
// WorkBee Admin - Settings
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const settingsForm = document.getElementById("settingsForm");

const siteName = document.getElementById("siteName");
const adminEmail = document.getElementById("adminEmail");
const supportEmail = document.getElementById("supportEmail");

const commission = document.getElementById("commission");

const paypal = document.getElementById("paypal");
const stripe = document.getElementById("stripe");

const allowSignup = document.getElementById("allowSignup");

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadSettings();

});

// ======================================
// Load Settings
// ======================================

async function loadSettings() {

    try {

        const settingsRef = doc(db, "settings", "website");

        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {

            const data = snapshot.data();

            siteName.value = data.siteName || "WorkBee";
            adminEmail.value = data.adminEmail || "";
            supportEmail.value = data.supportEmail || "";

            commission.value = data.commission || 10;

            paypal.checked = data.paypal ?? true;
            stripe.checked = data.stripe ?? true;

            allowSignup.checked = data.allowSignup ?? true;

        }

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Save Settings
// ======================================

settingsForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        await setDoc(doc(db, "settings", "website"), {

            siteName: siteName.value.trim(),

            adminEmail: adminEmail.value.trim(),

            supportEmail: supportEmail.value.trim(),

            commission: Number(commission.value),

            paypal: paypal.checked,

            stripe: stripe.checked,

            allowSignup: allowSignup.checked,

            updatedAt: new Date()

        });

        alert("✅ Settings Saved Successfully!");

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});