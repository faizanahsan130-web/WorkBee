// ======================================
// WorkBee - Portfolio View
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const freelancerName = document.getElementById("freelancerName");
const freelancerTitle = document.getElementById("freelancerTitle");
const profileImage = document.getElementById("profileImage");

const rating = document.getElementById("rating");
const country = document.getElementById("country");
const about = document.getElementById("about");

const skillsContainer =
document.getElementById("skillsContainer");

const portfolioContainer =
document.getElementById("portfolioContainer");

const reviewsContainer =
document.getElementById("reviewsContainer");

const hireBtn =
document.getElementById("hireBtn");

const chatBtn =
document.getElementById("chatBtn");

const shareBtn =
document.getElementById("shareBtn");

// ======================================

const params =
new URLSearchParams(window.location.search);

const freelancerId =
params.get("id");

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    loadFreelancer();

});

// ======================================
// Load Freelancer
// ======================================

async function loadFreelancer(){

    try{

        const userRef =
        doc(db,"users",freelancerId);

        const userSnap =
        await getDoc(userRef);

        if(!userSnap.exists()){

            freelancerName.textContent=
            "Freelancer Not Found";

            return;

        }

        const userData =
        userSnap.data();

        freelancerName.textContent=
        userData.fullName || "Freelancer";

        freelancerTitle.textContent=
        userData.profession ||
        "Freelancer";

        profileImage.src=
        userData.profileImage ||
        "https://via.placeholder.com/150";

        rating.textContent=
        userData.rating || "0.0";

        country.textContent=
        userData.country || "-";

        about.textContent=
        userData.about ||
        "No description available.";

        skillsContainer.innerHTML="";

        (userData.skills || []).forEach(skill=>{

            skillsContainer.innerHTML +=

            `<span class="skill">

            ${skill}

            </span>`;

        });

        loadPortfolio();

        loadReviews();

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Portfolio
// ======================================

async function loadPortfolio(){

    portfolioContainer.innerHTML="";

    const q=query(

        collection(db,"portfolio"),

        where("userId","==",freelancerId)

    );

    const snapshot=
    await getDocs(q);

    if(snapshot.empty){

        portfolioContainer.innerHTML=

        "<p>No portfolio available.</p>";

        return;

    }

    snapshot.forEach(docSnap=>{

        const item=
        docSnap.data();

        portfolioContainer.innerHTML +=`

        <div class="portfolio-card">

            <img
            src="${
                item.image ||
                'https://via.placeholder.com/600x350'
            }">

            <div class="portfolio-content">

                <h3>

                ${item.title}

                </h3>

                <p>

                ${item.description}

                </p>

                ${
                item.link ?

                `<a href="${item.link}"

                target="_blank">

                🌐 Visit Project

                </a>`

                :""

                }

            </div>

        </div>

        `;

    });

}

// ======================================
// Reviews
// ======================================

async function loadReviews(){

    reviewsContainer.innerHTML="";

    const q=query(

        collection(db,"reviews"),

        where("freelancerId","==",freelancerId)

    );

    const snapshot=
    await getDocs(q);

    if(snapshot.empty){

        reviewsContainer.innerHTML=

        "<p>No reviews yet.</p>";

        return;

    }

    snapshot.forEach(docSnap=>{

        const review=
        docSnap.data();

        reviewsContainer.innerHTML +=`

        <div class="review-card">

            <h4>

            ${review.clientName}

            </h4>

            <p>

            ⭐ ${review.rating}/5

            </p>

            <p>

            ${review.comment}

            </p>

        </div>

        `;

    });

}

// ======================================
// Hire
// ======================================

hireBtn.addEventListener("click",()=>{

    window.location.href=

    `post-project.html?freelancer=${freelancerId}`;

});

// ======================================
// Chat
// ======================================

chatBtn.addEventListener("click",()=>{

    window.location.href=

    `chat.html?user=${freelancerId}`;

});

// ======================================
// Share
// ======================================

shareBtn.addEventListener("click",async()=>{

    const url=
    window.location.href;

    if(navigator.share){

        navigator.share({

            title:freelancerName.textContent,

            text:"Check this freelancer on WorkBee",

            url

        });

    }

    else{

        await navigator.clipboard.writeText(url);

        alert("Profile link copied.");

    }

});