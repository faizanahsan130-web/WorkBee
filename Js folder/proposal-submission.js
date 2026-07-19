// ======================================
// WorkBee - Proposal Submission
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const proposalForm = document.getElementById("proposalForm");

const coverLetter =
document.getElementById("coverLetter");

const bidAmount =
document.getElementById("bidAmount");

const deliveryTime =
document.getElementById("deliveryTime");

const portfolioSelect =
document.getElementById("portfolioSelect");

const proposalFile =
document.getElementById("proposalFile");

const aiProposalBtn =
document.getElementById("aiProposalBtn");

// ======================================

let currentUser = null;

const params =
new URLSearchParams(window.location.search);

const projectId =
params.get("id");

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser=user;

    loadPortfolio();

});

// ======================================
// Load Portfolio
// ======================================

async function loadPortfolio(){

    portfolioSelect.innerHTML=
    `<option value="">Select Portfolio</option>`;

    const q=query(

        collection(db,"portfolio"),

        where("userId","==",currentUser.uid)

    );

    const snapshot=
    await getDocs(q);

    snapshot.forEach(doc=>{

        const data=doc.data();

        portfolioSelect.innerHTML +=`

        <option value="${doc.id}">

            ${data.title}

        </option>

        `;

    });

}

// ======================================
// AI Proposal Generator
// ======================================

aiProposalBtn.addEventListener("click",()=>{

    coverLetter.value=`

Hello,

I am interested in your project and I believe I have the required skills and experience to complete it successfully.

✔ High Quality Work
✔ On-Time Delivery
✔ Clean & Professional Code
✔ Unlimited Revisions

I look forward to working with you.

Thank you.

`.trim();

});

// ======================================
// Submit Proposal
// ======================================

proposalForm.addEventListener("submit",async(e)=>{

    e.preventDefault();

    try{

        await addDoc(

            collection(db,"proposals"),

            {

                projectId,

                freelancerId:currentUser.uid,

                freelancerName:
                currentUser.displayName || "",

                coverLetter:
                coverLetter.value,

                bid:Number(
                    bidAmount.value
                ),

                delivery:Number(
                    deliveryTime.value
                ),

                portfolioId:
                portfolioSelect.value,

                fileName:
                proposalFile.files.length
                ? proposalFile.files[0].name
                : "",

                status:"Pending",

                createdAt:
                serverTimestamp()

            }

        );

        alert(
            "Proposal submitted successfully."
        );

        proposalForm.reset();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

});