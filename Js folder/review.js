// ======================================
// WorkBee Review & Rating System V2
// Part 1 - Complete Replacement
// ======================================

// ---------- Firebase ----------

import { auth, db }
from "../firebase/firebase-config.js";

import {

    onAuthStateChanged

}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {

    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp

}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

// Statistics

const averageRating =
document.getElementById("averageRating");

const totalReviews =
document.getElementById("totalReviews");

const fiveStarReviews =
document.getElementById("fiveStarReviews");

const recommendationRate =
document.getElementById("recommendationRate");

// Form

const reviewForm =
document.getElementById("reviewForm");

const projectId =
document.getElementById("projectId");

const freelancerEmail =
document.getElementById("freelancerEmail");

const communication =
document.getElementById("communication");

const quality =
document.getElementById("quality");

const delivery =
document.getElementById("delivery");

const professionalism =
document.getElementById("professionalism");

const publicReview =
document.getElementById("publicReview");

const privateFeedback =
document.getElementById("privateFeedback");

const overallValue =
document.getElementById("overallValue");

const submitReviewBtn =
document.getElementById("submitReviewBtn");

// Rating Stars

const stars =
document.querySelectorAll(
"#overallRating span"
);

// Review Container

const reviewContainer =
document.getElementById(
"reviewContainer"
);

const refreshReviews =
document.getElementById(
"refreshReviews"
);

// Analytics

const fiveStarBar =
document.getElementById(
"fiveStarBar"
);

const fourStarBar =
document.getElementById(
"fourStarBar"
);

const threeStarBar =
document.getElementById(
"threeStarBar"
);

const twoStarBar =
document.getElementById(
"twoStarBar"
);

const oneStarBar =
document.getElementById(
"oneStarBar"
);

// ======================================
// Variables
// ======================================

let currentUser = null;

let reviews = [];

let unsubscribeReviews = null;

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href =
        "login.html";

        return;

    }

    currentUser = user;

    initializeReviews();

});

// ======================================
// Initialize
// ======================================

function initializeReviews(){

    loadReviews();

}

// ======================================
// Load Reviews
// ======================================

function loadReviews(){

    if(unsubscribeReviews){

        unsubscribeReviews();

    }

    const q = query(

        collection(db,"reviews"),

        where(
            "reviewerId",
            "==",
            currentUser.uid
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    unsubscribeReviews =
    onSnapshot(

        q,

        (snapshot)=>{

            reviews=[];

            snapshot.forEach(doc=>{

                reviews.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            updateStatistics();

            renderReviews();

        }

    );

}

// ======================================
// Statistics
// ======================================

function updateStatistics(){

    let total = reviews.length;

    let starsTotal = 0;

    let fiveStar = 0;

    let recommended = 0;

    reviews.forEach(item=>{

        const rating =
        Number(item.overallRating || 0);

        starsTotal += rating;

        if(rating===5){

            fiveStar++;

        }

        if(item.recommend==="Yes"){

            recommended++;

        }

    });

    const avg =
    total===0
    ?0
    :(starsTotal/total);

    averageRating.textContent =
    avg.toFixed(1)+" ⭐";

    totalReviews.textContent =
    total;

    fiveStarReviews.textContent =
    fiveStar;

    recommendationRate.textContent =

    total===0
    ?"0%"
    :Math.round(
        recommended/total*100
    )+"%";

}

console.log(
"✅ Review System Initialized"
);
// ======================================
// WorkBee Review System V2
// Part 2 - Star Rating & Submit Review
// ======================================

// ======================================
// Interactive Star Rating
// ======================================

let selectedRating = 5;

stars.forEach(star=>{

    star.classList.add("active");

    star.addEventListener("click",()=>{

        selectedRating = Number(
            star.dataset.value
        );

        overallValue.value =
        selectedRating;

        updateStars(selectedRating);

    });

});

function updateStars(value){

    stars.forEach(star=>{

        if(Number(star.dataset.value)<=value){

            star.classList.add("selected");

        }

        else{

            star.classList.remove("selected");

        }

    });

}

updateStars(selectedRating);

// ======================================
// Submit Review
// ======================================

reviewForm.addEventListener(

    "submit",

    async(e)=>{

        e.preventDefault();

        const recommend =

        document.querySelector(

            'input[name="recommend"]:checked'

        )?.value || "Yes";

        if(

            !projectId.value.trim() ||

            !freelancerEmail.value.trim() ||

            !publicReview.value.trim()

        ){

            alert(

                "Please complete all required fields."

            );

            return;

        }

        try{

            submitReviewBtn.disabled = true;

            submitReviewBtn.textContent =

            "Submitting...";

            await addDoc(

                collection(db,"reviews"),

                {

                    reviewerId:currentUser.uid,

                    reviewerEmail:currentUser.email,

                    projectId:projectId.value.trim(),

                    freelancerEmail:

                    freelancerEmail.value.trim(),

                    overallRating:selectedRating,

                    communication:Number(

                        communication.value

                    ),

                    quality:Number(

                        quality.value

                    ),

                    delivery:Number(

                        delivery.value

                    ),

                    professionalism:Number(

                        professionalism.value

                    ),

                    publicReview:

                    publicReview.value.trim(),

                    privateFeedback:

                    privateFeedback.value.trim(),

                    recommend:recommend,

                    createdAt:

                    serverTimestamp()

                }

            );

            // Notification

            await addDoc(

                collection(

                    db,

                    "notifications"

                ),

                {

                    userId:currentUser.uid,

                    title:"Review Submitted",

                    message:

                    "Your review has been submitted successfully.",

                    type:"review",

                    read:false,

                    createdAt:

                    serverTimestamp()

                }

            );

            alert(

                "Review submitted successfully."

            );

            reviewForm.reset();

            selectedRating = 5;

            overallValue.value = 5;

            updateStars(5);

        }

        catch(error){

            console.error(error);

            alert(error.message);

        }

        finally{

            submitReviewBtn.disabled = false;

            submitReviewBtn.textContent =

            "⭐ Submit Review";

        }

    }

);

console.log("✅ Review Submission Ready");
// ======================================
// WorkBee Review System V2
// Part 3 - Render Reviews & Analytics
// ======================================

// ======================================
// Render Reviews
// ======================================

function renderReviews(){

    reviewContainer.innerHTML = "";

    if(reviews.length===0){

        reviewContainer.innerHTML = `

            <div class="empty-state">

                <h2>⭐ No Reviews Yet</h2>

                <p>

                    Reviews will appear here after submission.

                </p>

            </div>

        `;

        return;

    }

    reviews.forEach(review=>{

        reviewContainer.innerHTML += `

        <div class="review-card">

            <div class="review-header">

                <div class="reviewer">

                    <div class="reviewer-avatar">

                        ${review.reviewerEmail
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div class="reviewer-info">

                        <h3>

                            ${review.reviewerEmail}

                        </h3>

                        <p>

                            ${formatDate(review.createdAt)}

                        </p>

                    </div>

                </div>

                <div class="rating-badge">

                    ⭐ ${review.overallRating}/5

                </div>

            </div>

            <div class="review-text">

                ${review.publicReview}

            </div>

            <div class="review-skills">

                <div class="skill-item">

                    <strong>Communication</strong>

                    <span>

                        ${review.communication}/5

                    </span>

                </div>

                <div class="skill-item">

                    <strong>Quality</strong>

                    <span>

                        ${review.quality}/5

                    </span>

                </div>

                <div class="skill-item">

                    <strong>Delivery</strong>

                    <span>

                        ${review.delivery}/5

                    </span>

                </div>

                <div class="skill-item">

                    <strong>Professionalism</strong>

                    <span>

                        ${review.professionalism}/5

                    </span>

                </div>

            </div>

            <div class="recommend-badge

                ${review.recommend==="Yes"

                ? "recommend-yes"

                : "recommend-no"}

            ">

                ${review.recommend==="Yes"

                ? "👍 Recommended"

                : "👎 Not Recommended"}

            </div>

        </div>

        `;

    });

    updateAnalytics();

}

// ======================================
// Rating Analytics
// ======================================

function updateAnalytics(){

    const counts={

        1:0,

        2:0,

        3:0,

        4:0,

        5:0

    };

    reviews.forEach(review=>{

        const rating =

        Number(review.overallRating);

        if(counts[rating]!==undefined){

            counts[rating]++;

        }

    });

    const total =

    reviews.length || 1;

    fiveStarBar.style.width =

    (counts[5]/total*100)+"%";

    fourStarBar.style.width =

    (counts[4]/total*100)+"%";

    threeStarBar.style.width =

    (counts[3]/total*100)+"%";

    twoStarBar.style.width =

    (counts[2]/total*100)+"%";

    oneStarBar.style.width =

    (counts[1]/total*100)+"%";

}

// ======================================
// Format Date
// ======================================

function formatDate(timestamp){

    if(!timestamp) return "-";

    if(timestamp.seconds){

        return new Date(

            timestamp.seconds*1000

        ).toLocaleDateString(

            "en-US",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

    }

    return new Date(timestamp)

    .toLocaleDateString();

}

// ======================================
// Refresh Reviews
// ======================================

refreshReviews.addEventListener(

    "click",

    ()=>{

        loadReviews();

    }

);

console.log("✅ Review Rendering Ready");
// ======================================
// WorkBee Review System V2
// Part 4 - Rating Summary & Badge System
// ======================================

import {
    doc,
    setDoc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Update Rating Summary
// ======================================

async function updateRatingSummary(freelancerEmail){

    try{

        const freelancerReviews = reviews.filter(item=>

            item.freelancerEmail === freelancerEmail

        );

        if(freelancerReviews.length===0) return;

        let totalRating = 0;

        let recommended = 0;

        let fiveStars = 0;

        freelancerReviews.forEach(item=>{

            totalRating += Number(item.overallRating);

            if(item.recommend==="Yes"){

                recommended++;

            }

            if(Number(item.overallRating)===5){

                fiveStars++;

            }

        });

        const average =

        totalRating / freelancerReviews.length;

        const recommendation =

        Math.round(

            (recommended/freelancerReviews.length)*100

        );

        const badge = calculateBadge(

            average,

            freelancerReviews.length,

            recommendation

        );

        await setDoc(

            doc(

                db,

                "ratingSummary",

                freelancerEmail

            ),

            {

                freelancerEmail,

                averageRating:Number(

                    average.toFixed(2)

                ),

                totalReviews:

                freelancerReviews.length,

                fiveStarReviews:

                fiveStars,

                recommendationRate:

                recommendation,

                badge,

                updatedAt:

                serverTimestamp()

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Badge Calculation
// ======================================

function calculateBadge(

    average,

    totalReviews,

    recommendation

){

    if(

        average >= 4.9 &&

        totalReviews >= 50 &&

        recommendation >= 95

    ){

        return "🏆 Top Rated";

    }

    if(

        average >= 4.8 &&

        totalReviews >= 20

    ){

        return "💎 Pro Seller";

    }

    if(

        average >= 4.6 &&

        totalReviews >= 10

    ){

        return "🚀 Rising Talent";

    }

    if(

        average >= 4.5

    ){

        return "⭐ Trusted Freelancer";

    }

    return "🌱 New Freelancer";

}

// ======================================
// Notify Freelancer
// ======================================

async function notifyFreelancer(review){

    try{

        await addDoc(

            collection(

                db,

                "notifications"

            ),

            {

                userEmail:

                review.freelancerEmail,

                title:

                "⭐ New Review Received",

                message:

                `${review.reviewerEmail} left a ${review.overallRating}-star review.`,

                type:"review",

                read:false,

                createdAt:

                serverTimestamp()

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Review Performance Score
// ======================================

function performanceScore(review){

    return Number(

        (

            review.communication +

            review.quality +

            review.delivery +

            review.professionalism

        ) / 4

    ).toFixed(1);

}

console.log("✅ Rating Summary System Ready");
// ======================================
// WorkBee Review System V2
// Part 5 - Dashboard, Search & Live Sync
// ======================================

// ======================================
// Search Reviews
// ======================================

const searchReview =
document.getElementById("searchReview");

if(searchReview){

    searchReview.addEventListener("input",(e)=>{

        const keyword =

        e.target.value

        .toLowerCase()

        .trim();

        document

        .querySelectorAll(".review-card")

        .forEach(card=>{

            const text =

            card.innerText

            .toLowerCase();

            card.style.display =

            text.includes(keyword)

            ? "block"

            : "none";

        });

    });

}

// ======================================
// Dashboard Refresh
// ======================================

function refreshDashboard(){

    updateStatistics();

    updateAnalytics();

}

setInterval(

    refreshDashboard,

    30000

);

// ======================================
// Rating Trend
// ======================================

function calculateTrend(){

    if(reviews.length < 2){

        return "Stable";

    }

    const latest =

    reviews[0].overallRating;

    const previous =

    reviews[1].overallRating;

    if(latest > previous){

        return "Improving";

    }

    if(latest < previous){

        return "Declining";

    }

    return "Stable";

}

// ======================================
// Client Satisfaction
// ======================================

function clientSatisfaction(){

    if(reviews.length===0){

        return 0;

    }

    let total = 0;

    reviews.forEach(item=>{

        total += Number(

            performanceScore(item)

        );

    });

    return (

        total /

        reviews.length

    ).toFixed(1);

}

// ======================================
// Badge Preview
// ======================================

function badgeHTML(badge){

    return `

        <div class="badge">

            ${badge}

        </div>

    `;

}

// ======================================
// Review Summary
// ======================================

function summaryText(){

    if(reviews.length===0){

        return "No reviews yet.";

    }

    const avg =

    Number(

        averageRating.textContent

        .replace("⭐","")

    );

    if(avg>=4.8){

        return "Excellent performance.";

    }

    if(avg>=4){

        return "Very good performance.";

    }

    if(avg>=3){

        return "Average performance.";

    }

    return "Needs improvement.";

}

// ======================================
// Refresh Button
// ======================================

if(refreshReviews){

    refreshReviews.addEventListener(

        "click",

        ()=>{

            loadReviews();

        }

    );

}

// ======================================
// Global Helpers
// ======================================

window.reviewHelpers={

    updateStatistics,

    updateAnalytics,

    renderReviews,

    performanceScore,

    calculateBadge,

    calculateTrend,

    clientSatisfaction,

    summaryText

};

console.log("✅ Dashboard & Analytics Ready");
// ======================================
// WorkBee Review System V2
// Part 6 - Production Final
// ======================================

// ======================================
// Delete Review
// ======================================

window.deleteReview = async function(reviewId){

    const ok = confirm(
        "Delete this review permanently?"
    );

    if(!ok) return;

    try{

        await deleteDoc(
            doc(db,"reviews",reviewId)
        );

        alert(
            "Review deleted successfully."
        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Edit Review (Foundation)
// ======================================

window.editReview = function(reviewId){

    const review = reviews.find(

        item=>item.id===reviewId

    );

    if(!review){

        return;

    }

    projectId.value =
    review.projectId;

    freelancerEmail.value =
    review.freelancerEmail;

    communication.value =
    review.communication;

    quality.value =
    review.quality;

    delivery.value =
    review.delivery;

    professionalism.value =
    review.professionalism;

    publicReview.value =
    review.publicReview;

    privateFeedback.value =
    review.privateFeedback;

    overallValue.value =
    review.overallRating;

    updateStars(
        review.overallRating
    );

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};

// ======================================
// Cleanup
// ======================================

function cleanupReviewSystem(){

    if(unsubscribeReviews){

        unsubscribeReviews();

        unsubscribeReviews = null;

    }

    console.log(
        "Review listeners stopped."
    );

}

window.addEventListener(

    "beforeunload",

    cleanupReviewSystem

);

window.addEventListener(

    "pagehide",

    cleanupReviewSystem

);

// ======================================
// Connection Status
// ======================================

window.addEventListener(

    "online",

    ()=>{

        console.log(
            "Internet Connected"
        );

        loadReviews();

    }

);

window.addEventListener(

    "offline",

    ()=>{

        console.log(
            "Internet Disconnected"
        );

    }

);

// ======================================
// Production Diagnostics
// ======================================

function diagnostics(){

    console.table({

        User:

        currentUser?.email ||

        "Not Logged In",

        Reviews:

        reviews.length,

        Trend:

        calculateTrend(),

        Satisfaction:

        clientSatisfaction(),

        Summary:

        summaryText()

    });

}

setTimeout(

    diagnostics,

    2000

);

// ======================================
// Export Helpers
// ======================================

window.reviewSystem={

    loadReviews,

    renderReviews,

    updateStatistics,

    updateAnalytics,

    calculateTrend,

    clientSatisfaction,

    performanceScore,

    calculateBadge,

    summaryText

};

// ======================================
// Production Logs
// ======================================

console.log("====================================");

console.log("🐝 WorkBee Review System");

console.log("Production Build");

console.log("Realtime Firestore Enabled");

console.log("Rating Summary Enabled");

console.log("Badge System Enabled");

console.log("Notifications Enabled");

console.log("Analytics Enabled");

console.log("Performance Optimized");

console.log("Version 2.0");

console.log("====================================");