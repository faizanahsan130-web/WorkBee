/*=====================================================
  WorkBee V3 Premium Edition
  email-verification.js
  Part 1 (Complete Replacement)
======================================================*/

import { auth } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged,
    sendEmailVerification,
    reload
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

/*=====================================================
  DOM Elements
======================================================*/

const emailText = document.getElementById("userEmail");
const statusBox = document.getElementById("verificationStatus");

const resendBtn = document.getElementById("resendEmail");
const refreshBtn = document.getElementById("refreshVerification");

const timerElement = document.getElementById("timer");

let currentUser = null;

let countdown = 60;

let timer = null;

/*=====================================================
  Initialize
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initAuth();

});

/*=====================================================
  Authentication Check
======================================================*/

function initAuth(){

    onAuthStateChanged(auth, async(user)=>{

        if(!user){

            window.location.href="login.html";

            return;

        }

        currentUser=user;

        emailText.textContent=user.email;

        if(user.emailVerified){

            showVerified();

        }else{

            showPending();

            startCountdown();

        }

    });

}

/*=====================================================
  Pending State
======================================================*/

function showPending(){

    statusBox.className="status pending";

    statusBox.innerHTML=`
        <i class="fa-solid fa-clock"></i>
        Waiting for email verification...
    `;

}

/*=====================================================
  Verified State
======================================================*/

function showVerified(){

    statusBox.className="status success";

    statusBox.innerHTML=`
        <i class="fa-solid fa-circle-check"></i>
        Email Verified Successfully
    `;

}

/*=====================================================
  Countdown Timer
======================================================*/

function startCountdown(){

    clearInterval(timer);

    countdown=60;

    resendBtn.disabled=true;

    timerElement.textContent=countdown;

    timer=setInterval(()=>{

        countdown--;

        timerElement.textContent=countdown;

        if(countdown<=0){

            clearInterval(timer);

            resendBtn.disabled=false;

            timerElement.textContent="0";

        }

    },1000);

}

/*=====================================================
 End Part 1
======================================================*/
/*=====================================================
  WorkBee V3 Premium Edition
  email-verification.js
  Part 2 (Production Final)
======================================================*/

/*=====================================================
  Resend Verification Email
======================================================*/

resendBtn?.addEventListener("click", async () => {

    if (!currentUser) return;

    try {

        await sendEmailVerification(currentUser);

        showToast(
            "Verification email has been sent successfully.",
            "success"
        );

        startCountdown();

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

});

/*=====================================================
  Refresh Verification Status
======================================================*/

refreshBtn?.addEventListener("click", async () => {

    if (!currentUser) return;

    try {

        await reload(currentUser);

        if (currentUser.emailVerified) {

            showVerified();

            document
                .getElementById("successModal")
                ?.classList.add("active");

            setTimeout(() => {

                window.location.href =
                    "client-dashboard.html";

            }, 3000);

        } else {

            showPending();

            showToast(
                "Email is not verified yet.",
                "error"
            );

        }

    } catch (error) {

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

});

/*=====================================================
  Continue Button
======================================================*/

document
.getElementById("continueDashboard")
?.addEventListener("click", () => {

    window.location.href =
        "client-dashboard.html";

});

/*=====================================================
  Close Error Modal
======================================================*/

document
.querySelectorAll(".closeModal")
.forEach(button => {

    button.addEventListener("click", () => {

        document
        .getElementById("errorModal")
        ?.classList.remove("active");

    });

});

/*=====================================================
  Toast Notification
======================================================*/

function showToast(message, type = "success") {

    const container =
        document.getElementById("toast-container");

    if (!container) return;

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

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
  Hide Loader
======================================================*/

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");

    if (!loader) return;

    loader.style.opacity = "0";

    setTimeout(() => {

        loader.remove();

    }, 500);

});

/*=====================================================
  Global Error Handler
======================================================*/

window.addEventListener("error", (event) => {

    console.error(
        "WorkBee Verification Error:",
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
🐝 WorkBee Email Verification V3 Loaded
Status : Production Ready
Firebase : Connected
=========================================
`);

/*=====================================================
 End of email-verification.js V3
======================================================*/