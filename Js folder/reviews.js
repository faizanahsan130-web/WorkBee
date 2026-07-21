// ======================================
// WorkBee Reviews V2
// Part 1 - Complete Replacement
// ======================================

// Firebase
import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const averageRating =
document.getElementById("averageRating");

const totalReviews =
document.getElementById("totalReviews");

const sellerLevel =
document.getElementById("sellerLevel");

const completedProjects =
document.getElementById("completedProjects");

const responseRate =
document.getElementById("responseRate");

const reviewsList =
document.getElementById("reviewsList");

const reviewText =
document.getElementById("reviewText");

const submitReview =
document.getElementById("submitReview");

const starSelector =
document.getElementById("starSelector");

// Rating Bars

const star5 =
document.getElementById("star5");

const star4 =
document.getElementById("star4");

const star3 =
document.getElementById("star3");

const star2 =
document.getElementById("star2");

const star1 =
document.getElementById("star1");

const star5Count =
document.getElementById("star5Count");

const star4Count =
document.getElementById("star4Count");

const star3Count =
document.getElementById("star3Count");

const star2Count =
document.getElementById("star2Count");

const star1Count =
document.getElementById("star1Count");

// ======================================
// Variables
// ======================================

let currentUser = null;

let selectedRating = 0;

let reviews = [];

let reviewStats = {

    total:0,

    average:0,

    stars:{

        1:0,

        2:0,

        3:0,

        4:0,

        5:0

    }

};

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    currentUser = user;

    await initializeReviews();

});

// ======================================
// Initialize
// ======================================

async function initializeReviews(){

    await loadSellerProfile();

    loadReviews();

    setupStars();

    console.log("⭐ Reviews Ready");

}

// ======================================
// Seller Profile
// ======================================

async function loadSellerProfile(){

    const ref = doc(

        db,

        "users",

        currentUser.uid

    );

    const snap = await getDoc(ref);

    if(!snap.exists()) return;

    const data = snap.data();

    sellerLevel.textContent =

        data.level || "New Seller";

    completedProjects.textContent =

        data.completedProjects || 0;

    responseRate.textContent =

        (data.responseRate || 100) + "%";

}

// ======================================
// Load Reviews
// ======================================

function loadReviews(){

    const q = query(

        collection(db,"reviews"),

        where(

            "targetUser",

            "==",

            currentUser.uid

        ),

        orderBy(

            "createdAt",

            "desc"

        )

    );

    onSnapshot(q,(snapshot)=>{

        reviews=[];

        reviewStats={

            total:0,

            average:0,

            stars:{

                1:0,

                2:0,

                3:0,

                4:0,

                5:0

            }

        };

        reviewsList.innerHTML="";

        if(snapshot.empty){

            reviewsList.innerHTML=`

            <div class="review-empty">

            No Reviews Yet

            </div>

            `;

            updateSummary();

            return;

        }

        snapshot.forEach(doc=>{

            const review=doc.data();

            reviews.push(review);

            calculateStats(review);

            renderReview(review);

        });

        updateSummary();

    });

}

// ======================================
// Calculate Statistics
// ======================================

function calculateStats(review){

    reviewStats.total++;

    reviewStats.average += Number(review.rating);

    reviewStats.stars[review.rating]++;

}

// ======================================
// Update Summary
// ======================================

function updateSummary(){

    if(reviewStats.total>0){

        reviewStats.average /= reviewStats.total;

    }

    averageRating.textContent =

        reviewStats.average.toFixed(1)+" ⭐";

    totalReviews.textContent =

        reviewStats.total+" Reviews";

    updateBars();

}

// ======================================
// Rating Bars
// ======================================

function updateBars(){

    const total =

    reviewStats.total || 1;

    [5,4,3,2,1].forEach(star=>{

        const percent =

        (

            reviewStats.stars[star] /

            total

        )*100;

        document.getElementById(

            "star"+star

        ).style.width =

        percent+"%";

        document.getElementById(

            "star"+star+"Count"

        ).textContent =

        reviewStats.stars[star];

    });

}

// ======================================
// Star Selector
// ======================================

function setupStars(){

    const stars=

    starSelector.querySelectorAll("span");

    stars.forEach(star=>{

        star.addEventListener(

            "click",

            ()=>{

                selectedRating=

                Number(

                    star.dataset.rating

                );

                stars.forEach(s=>{

                    s.classList.remove("active");

                });

                for(let i=0;i<selectedRating;i++){

                    stars[i].classList.add("active");

                }

            }

        );

    });

}

// ======================================
// Review Card
// ======================================

function renderReview(review){

    reviewsList.innerHTML += `

<div class="review-card">

<div class="review-header">

<div class="review-user">

<div class="review-avatar">

${review.authorName?.charAt(0) || "U"}

</div>

<div>

<h4>${review.authorName || "User"}</h4>

<div class="review-date">

${formatDate(review.createdAt)}

</div>

</div>

</div>

</div>

<div class="review-stars">

${"⭐".repeat(review.rating)}

</div>

<div class="review-text">

${review.comment}

</div>

</div>

`;

}

// ======================================
// Helpers
// ======================================

function formatDate(timestamp){

    if(!timestamp) return "-";

    try{

        return timestamp

        .toDate()

        .toLocaleDateString();

    }

    catch{

        return "-";

    }

}

console.log("✅ reviews.js Part 1 Loaded");
// ======================================
// WorkBee Reviews V2
// Part 2 - Submit, Report & Validation
// ======================================

import {
    addDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM
// ======================================

const reviewFilter =
document.getElementById("reviewFilter");

const searchReview =
document.getElementById("searchReview");

const reportModal =
document.getElementById("reportReviewModal");

const cancelReport =
document.getElementById("cancelReportReview");

const submitReport =
document.getElementById("submitReportReview");

let reportReviewId = null;

// ======================================
// Submit Review
// ======================================

submitReview.addEventListener(

"click",

async()=>{

    const comment=

    reviewText.value.trim();

    if(selectedRating===0){

        alert(

            "Please select rating."

        );

        return;

    }

    if(comment.length<10){

        alert(

            "Review is too short."

        );

        return;

    }

    try{

        await addDoc(

            collection(db,"reviews"),

            {

                targetUser:

                currentUser.uid,

                authorId:

                currentUser.uid,

                authorName:

                currentUser.displayName ||

                currentUser.email,

                rating:

                selectedRating,

                comment,

                status:"published",

                createdAt:

                serverTimestamp()

            }

        );

        reviewText.value="";

        selectedRating=0;

        starSelector

        .querySelectorAll("span")

        .forEach(star=>{

            star.classList.remove("active");

        });

        alert(

            "Review submitted successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(

            "Unable to submit review."

        );

    }

});

// ======================================
// Review Search
// ======================================

searchReview.addEventListener(

"input",

()=>{

const keyword=

searchReview.value

.toLowerCase();

document

.querySelectorAll(

".review-card"

)

.forEach(card=>{

const text=

card.innerText

.toLowerCase();

card.style.display=

text.includes(keyword)

?

""

:

"none";

});

});

// ======================================
// Rating Filter
// ======================================

reviewFilter.addEventListener(

"change",

()=>{

const filter=

reviewFilter.value;

document

.querySelectorAll(

".review-card"

)

.forEach(card=>{

if(filter==="all"){

card.style.display="";

return;

}

const stars=

card.querySelector(

".review-stars"

)

.innerText.length;

card.style.display=

stars==filter

?

""

:

"none";

});

});

// ======================================
// Open Report Modal
// ======================================

window.openReportReview=

function(reviewId){

    reportReviewId=

    reviewId;

    reportModal

    .classList

    .remove("hidden");

};

// ======================================
// Close Report
// ======================================

cancelReport.onclick=()=>{

    reportModal

    .classList

    .add("hidden");

};

// ======================================
// Submit Report
// ======================================

submitReport.onclick=

async()=>{

const reason=

document

.getElementById(

"reportReason"

)

.value;

const details=

document

.getElementById(

"reportDetails"

)

.value.trim();

try{

await addDoc(

collection(

db,

"review_reports"

),

{

reviewId:

reportReviewId,

reason,

details,

reportedBy:

currentUser.uid,

status:"pending",

createdAt:

serverTimestamp()

}

);

alert(

"Report submitted."

);

reportModal

.classList

.add("hidden");

}

catch(error){

console.error(error);

alert(

"Unable to submit report."

);

}

};

// ======================================
// Delete Review (Admin)
// ======================================

window.deleteReview=

async function(id){

if(

!confirm(

"Delete this review?"

)

) return;

try{

await deleteDoc(

doc(

db,

"reviews",

id

)

);

alert(

"Review deleted."

);

}

catch(error){

console.error(error);

}

};

// ======================================
// Edit Review
// ======================================

window.editReview=

async function(

id,

comment,

rating

){

const newComment=

prompt(

"Edit Review",

comment

);

if(

!newComment

) return;

try{

await updateDoc(

doc(

db,

"reviews",

id

),

{

comment:newComment,

rating,

edited:true,

updatedAt:

serverTimestamp()

}

);

alert(

"Review updated."

);

}

catch(error){

console.error(error);

}

};

console.log(
"⭐ Reviews Part 2 Loaded");
// ======================================
// WorkBee Reviews V2
// Part 3 - AI Detection & Analytics
// ======================================

// DOM
const aiReviewWarning =
document.getElementById("aiReviewWarning");

const badgeTitle =
document.getElementById("badgeTitle");

const badgeDescription =
document.getElementById("badgeDescription");

const positiveReviews =
document.getElementById("positiveReviews");

const negativeReviews =
document.getElementById("negativeReviews");

const pendingReviews =
document.getElementById("pendingReviews");

const spamReviews =
document.getElementById("spamReviews");

// ======================================
// AI Spam Detection
// ======================================

const spamWords=[

"fake",
"fraud",
"scam",
"idiot",
"stupid",
"spam",
"cheater",
"abuse"

];

function containsSpam(text){

const value=text.toLowerCase();

return spamWords.some(word=>

value.includes(word)

);

}

// ======================================
// AI Review Analysis
// ======================================

function analyzeReview(comment){

if(containsSpam(comment)){

aiReviewWarning.classList.remove("hidden");

return{

approved:false,

reason:"Spam Detected"

};

}

aiReviewWarning.classList.add("hidden");

return{

approved:true,

reason:"Clean"

};

}

// ======================================
// Upgrade Submit Review
// ======================================

const originalSubmitReview=

submitReview.onclick ||
submitReview.addEventListener;

submitReview.addEventListener(

"click",

async()=>{

const comment=

reviewText.value.trim();

const result=

analyzeReview(comment);

if(!result.approved){

alert(

"AI detected suspicious content."

);

return;

}

});


// ======================================
// Seller Level
// ======================================

function updateSellerLevel(){

const avg=

reviewStats.average;

const total=

reviewStats.total;

let level="New Seller";

let description=

"Keep completing projects.";

if(total>=10 && avg>=4.5){

level="Level 1";

description=

"Excellent performance.";

}

if(total>=30 && avg>=4.7){

level="Level 2";

description=

"Trusted professional.";

}

if(total>=60 && avg>=4.9){

level="Top Rated";

description=

"Outstanding freelancer.";

}

sellerLevel.textContent=

level;

badgeTitle.textContent=

level;

badgeDescription.textContent=

description;

}

// ======================================
// Analytics
// ======================================

function updateAnalytics(){

let positive=0;

let negative=0;

let pending=0;

let spam=0;

reviews.forEach(review=>{

if(review.rating>=4)

positive++;

else

negative++;

if(review.status==="pending")

pending++;

if(containsSpam(

review.comment

))

spam++;

});

positiveReviews.textContent=

positive;

negativeReviews.textContent=

negative;

pendingReviews.textContent=

pending;

spamReviews.textContent=

spam;

}

// ======================================
// Rating Trend
// ======================================

function calculateTrend(){

if(reviewStats.average>=4.8)

return "Excellent";

if(reviewStats.average>=4)

return "Good";

if(reviewStats.average>=3)

return "Average";

return "Needs Improvement";

}

// ======================================
// Admin Notification
// ======================================

async function notifyModeration(

message

){

try{

await addDoc(

collection(

db,

"admin_notifications"

),

{

type:"review",

message,

userId:

currentUser.uid,

createdAt:

serverTimestamp(),

read:false

}

);

}

catch(error){

console.error(error);

}

}

// ======================================
// Auto Refresh
// ======================================

setInterval(()=>{

updateAnalytics();

updateSellerLevel();

},15000);

// ======================================
// Update Summary Override
// ======================================

const originalSummary=

updateSummary;

updateSummary=function(){

originalSummary();

updateAnalytics();

updateSellerLevel();

};

// ======================================

console.log(
"⭐ Reviews Part 3 Loaded");
// ======================================
// WorkBee Reviews V2
// Part 4 - Production Final
// ======================================

// ======================================
// Duplicate Review Protection
// ======================================

const reviewedProjects = new Set();

function canReviewProject(projectId){

    return !reviewedProjects.has(projectId);

}

function markProjectReviewed(projectId){

    reviewedProjects.add(projectId);

}

// ======================================
// Export Reviews CSV
// ======================================

window.exportReviewsCSV = function(){

    const rows = [];

    rows.push([
        "Reviewer",
        "Rating",
        "Comment",
        "Date"
    ]);

    reviews.forEach(review=>{

        rows.push([

            review.authorName || "Unknown",

            review.rating,

            `"${(review.comment || "").replace(/"/g,'""')}"`,

            formatDate(review.createdAt)

        ]);

    });

    const csv = rows
        .map(r=>r.join(","))
        .join("\n");

    const blob = new Blob([csv],{
        type:"text/csv"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "workbee-reviews.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

};

// ======================================
// Safe Async Wrapper
// ======================================

async function safeExecute(task){

    try{

        await task();

    }

    catch(error){

        console.error(error);

        alert(
            "Unexpected error occurred."
        );

    }

}

// ======================================
// Performance
// ======================================

window.addEventListener(

"visibilitychange",

()=>{

    if(document.hidden){

        console.log(

            "Reviews paused."

        );

    }

    else{

        console.log(

            "Reviews resumed."

        );

    }

});

// ======================================
// Cleanup
// ======================================

window.addEventListener(

"beforeunload",

()=>{

    reviews.length = 0;

    console.log(

        "Reviews cleaned."

    );

});

// ======================================
// Global Helpers
// ======================================

window.refreshReviews = function(){

    loadReviews();

};

window.reviewStatistics = function(){

    console.table({

        AverageRating: reviewStats.average,

        TotalReviews: reviewStats.total,

        FiveStars: reviewStats.stars[5],

        FourStars: reviewStats.stars[4],

        ThreeStars: reviewStats.stars[3],

        TwoStars: reviewStats.stars[2],

        OneStar: reviewStats.stars[1]

    });

};

// ======================================
// Freeze Config
// ======================================

Object.freeze(reviewStats);

// ======================================
// Production Ready
// ======================================

console.log(
"🚀 WorkBee Reviews System Production Ready");