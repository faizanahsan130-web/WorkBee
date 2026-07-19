import { auth, db } from "../firebase/firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Signup button clicked!"); // Check karne ke liye ke code chala ya nahi

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User created:", userCredential.user.uid);
        
        // Agar database mein data save karna hai
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email
        });

        alert("✅ Signup Successful!");
        window.location.href = "login.html";

    } catch (error) {
        console.error("Error details:", error); // Console mein red error yahan show hoga
        alert("❌ Error: " + error.message);
    }
});