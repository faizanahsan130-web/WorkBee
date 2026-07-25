import { auth, db } from "../firebase/firebase-config.js";
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ==============================
// Elements
// ==============================

const form = document.getElementById("signupForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const terms = document.getElementById("terms");

const message = document.getElementById("message");
const button = document.querySelector(".auth-btn");

// ==============================
// Message Function
// ==============================

function showMessage(text, color = "red") {

    message.textContent = text;
    message.style.color = color;

}

// ==============================
// Loading Button
// ==============================

function loading(state) {

    button.disabled = state;

    button.textContent = state
        ? "Creating Account..."
        : "Create Account";

}

// ==============================
// Password Validation
// ==============================

function validPassword(pass) {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass);

}

// ==============================
// Show Hide Password
// ==============================

document.querySelectorAll(".toggle-password,.toggle-confirm-password")
.forEach(item=>{

    item.addEventListener("click",()=>{

        const input=item.parentElement.querySelector("input");

        const icon=item.querySelector("i");

        if(input.type==="password"){

            input.type="text";

            icon.classList.replace("fa-eye","fa-eye-slash");

        }else{

            input.type="password";

            icon.classList.replace("fa-eye-slash","fa-eye");

        }

    });

});

// ==============================
// Signup
// ==============================

form.addEventListener("submit",async(e)=>{

    e.preventDefault();

    showMessage("");

    const name=fullName.value.trim();

    const userEmail=email.value.trim();

    const pass=password.value;

    const confirm=confirmPassword.value;

    if(name===""){

        return showMessage("Please enter full name.");

    }

    if(userEmail===""){

        return showMessage("Please enter email.");

    }

    if(!validPassword(pass)){

        return showMessage(
            "Password must contain uppercase, lowercase, number and minimum 8 characters."
        );

    }

    if(pass!==confirm){

        return showMessage("Passwords do not match.");

    }

    if(!terms.checked){

        return showMessage("Accept Terms & Conditions.");

    }

    try{

        loading(true);

        const userCredential=
        await createUserWithEmailAndPassword(
            auth,
            userEmail,
            pass
        );

        const user=userCredential.user;

        await setDoc(doc(db,"users",user.uid),{

            uid:user.uid,

            fullName:name,

            email:user.email,

            role:"freelancer",

            profileImage:"",

            bio:"",

            skills:[],

            createdAt:serverTimestamp(),

            updatedAt:serverTimestamp(),

            isVerified:false,

            isActive:true

        });

        showMessage(
            "Account Created Successfully!",
            "green"
        );

        form.reset();

        setTimeout(()=>{

            window.location.href="login.html";

        },2000);

    }

    catch(error){

        switch(error.code){

            case "auth/email-already-in-use":

                showMessage("Email already exists.");

                break;

            case "auth/invalid-email":

                showMessage("Invalid email.");

                break;

            case "auth/weak-password":

                showMessage("Weak password.");

                break;

            case "auth/network-request-failed":

                showMessage("Network error.");

                break;

            default:

                showMessage(error.message);

        }

    }

    finally{

        loading(false);

    }

});