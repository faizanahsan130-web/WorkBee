import { auth } from "../firebase/firebase-config.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("⚠ Please fill in all fields.");
        return;
    }

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("✅ Login Successful!");

        window.location.href = "client-dashboard.html";

    } catch (error) {

        if (error.code === "auth/invalid-credential") {
            alert("❌ Invalid email or password.");
        } else if (error.code === "auth/user-not-found") {
            alert("❌ User not found.");
        } else if (error.code === "auth/wrong-password") {
            alert("❌ Wrong password.");
        } else {
            alert(error.message);
        }

    }

});