import { auth, db } from "../firebase/firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const projectForm = document.getElementById("projectForm");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
    }

});

projectForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
        alert("Please login first.");
        return;
    }

    const title = document.getElementById("projectTitle").value.trim();
    const description = document.getElementById("projectDescription").value.trim();
    const category = document.getElementById("projectCategory").value;
    const budget = document.getElementById("projectBudget").value;
    const deadline = document.getElementById("projectDeadline").value;

    try {

        await addDoc(collection(db, "projects"), {

            title: title,
            description: description,
            category: category,
            budget: Number(budget),
            deadline: deadline,

            clientId: user.uid,
            clientEmail: user.email,

            createdAt: serverTimestamp()

        });

        alert("✅ Project Posted Successfully!");

        projectForm.reset();

        window.location.href = "client-dashboard.html";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});