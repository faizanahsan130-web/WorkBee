// ==========================
// WorkBee Dashboard (Firebase)
// ==========================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

console.log("WorkBee Dashboard Loaded Successfully!");

// --------------------------
// Check Login Status
// --------------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {

            const userData = docSnap.data();

            document.getElementById("welcomeText").innerHTML =
                `Welcome, ${userData.name} 👋`;

        } else {

            document.getElementById("welcomeText").innerHTML =
                "Welcome to WorkBee 👋";

        }

    } catch (error) {

        console.error(error);

    }

});

// --------------------------
// Sidebar Active Menu
// --------------------------

const menuLinks = document.querySelectorAll(".sidebar a");

menuLinks.forEach(link => {

    link.addEventListener("click", function () {

        menuLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});

// --------------------------
// Card Hover Animation
// --------------------------

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-8px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});

// --------------------------
// Logout
// --------------------------

const logoutLink = document.querySelector('a[href="index.html"]');

logoutLink.addEventListener("click", async (e) => {

    e.preventDefault();

    await signOut(auth);

    window.location.href = "login.html";

});
// Audit results fetch karne ka function
async function loadAuditResults() {
    try {
        const response = await fetch('http://localhost:3000/api/audit-results');
        const data = await response.json();
        
        console.log("Audit Data:", data);
        
        // Agar aap dashboard mein kahin show karna chahte hain, 
        // to yahan us element ko update karein
        // Maslan: document.getElementById('audit-status').innerText = data.message;
    } catch (error) {
        console.error("Error fetching audit results:", error);
    }
}

// Page load hone par function call karein
loadAuditResults();