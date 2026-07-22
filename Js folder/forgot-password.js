/*=====================================================
  WorkBee V3 Premium Edition
  forgot-password.js
  Part 1 (Complete Replacement)
======================================================*/

import { auth } from "../firebase/firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

/*=====================================================
  DOM Elements
======================================================*/

const form = document.getElementById("forgotPasswordForm");

const emailInput = document.getElementById("email");

const resetButton = document.getElementById("resetButton");

const loader = document.getElementById("loader");

const successModal = document.getElementById("successModal");

const errorModal = document.getElementById("errorModal");

const errorMessage = document.getElementById("errorMessage");

/*=====================================================
  Initialize
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    hideLoader();

    initializeEvents();

});

/*=====================================================
  Event Listeners
======================================================*/

function initializeEvents() {

    if (!form) return;

    form.addEventListener("submit", handlePasswordReset);

}

/*=====================================================
  Password Reset
======================================================*/

async function handlePasswordReset(e) {

    e.preventDefault();

    const email = emailInput.value.trim();

    if (!validateEmail(email)) {

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;

    }

    try {

        setLoading(true);

        await sendPasswordResetEmail(auth, email);

        successModal.classList.add("active");

        showToast(
            "Password reset email sent successfully.",
            "success"
        );

        form.reset();

    } catch (error) {

        console.error(error);

        showError(error);

    } finally {

        setLoading(false);

    }

}

/*=====================================================
  Email Validation
======================================================*/

function validateEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}

/*=====================================================
  Loading Button
======================================================*/

function setLoading(status) {

    if (!resetButton) return;

    if (status) {

        resetButton.disabled = true;

        resetButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Sending...
        `;

    } else {

        resetButton.disabled = false;

        resetButton.innerHTML = `
            <i class="fa-solid fa-paper-plane"></i>
            Send Reset Link
        `;

    }

}

/*=====================================================
  Hide Loader
======================================================*/

function hideLoader() {

    if (!loader) return;

    window.addEventListener("load", () => {

        loader.style.opacity = "0";

        setTimeout(() => {

            loader.remove();

        }, 500);

    });

}

/*=====================================================
 End Part 1
======================================================*/
/*=====================================================
  WorkBee V3 Premium Edition
  forgot-password.js
  Part 2 (Production Final)
======================================================*/

/*=====================================================
  Firebase Error Handler
======================================================*/

function showError(error) {

    let message = "Something went wrong. Please try again.";

    switch (error.code) {

        case "auth/user-not-found":
            message = "No account found with this email.";
            break;

        case "auth/invalid-email":
            message = "Invalid email address.";
            break;

        case "auth/too-many-requests":
            message =
                "Too many requests. Please try again later.";
            break;

        case "auth/network-request-failed":
            message =
                "Network error. Check your internet connection.";
            break;

        default:
            message = error.message;
    }

    errorMessage.textContent = message;

    errorModal.classList.add("active");

    showToast(message, "error");

}

/*=====================================================
  Toast Notification
======================================================*/

function showToast(message, type = "success") {

    const container =
        document.getElementById("toast-container");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(40px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/*=====================================================
  Success Modal Button
======================================================*/

document
.getElementById("goToLogin")
?.addEventListener("click", () => {

    window.location.href = "login.html";

});

/*=====================================================
  Close Error Modal
======================================================*/

document
.querySelectorAll(".closeModal")
.forEach(button => {

    button.addEventListener("click", () => {

        errorModal.classList.remove("active");

    });

});

/*=====================================================
  Close Modal by Clicking Outside
======================================================*/

window.addEventListener("click", (event) => {

    if (event.target === successModal) {

        successModal.classList.remove("active");

    }

    if (event.target === errorModal) {

        errorModal.classList.remove("active");

    }

});

/*=====================================================
  Global Error Handler
======================================================*/

window.addEventListener("error", (event) => {

    console.error(
        "WorkBee Error:",
        event.message
    );

});

/*=====================================================
  Promise Error Handler
======================================================*/

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "Unhandled Promise:",
            event.reason
        );

    }
);

/*=====================================================
  Console Message
======================================================*/

console.log(`
=========================================
🔑 WorkBee Forgot Password V3 Loaded
Status   : Production Ready
Firebase : Connected
Version  : 3.0
=========================================
`);

/*=====================================================
 End of forgot-password.js V3
======================================================*/