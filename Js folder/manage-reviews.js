// ======================================
// WorkBee Admin - Manage Reviews
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const reviewsTable = document.getElementById("reviewsTable");
const searchReview = document.getElementById("searchReview");

const totalReviews = document.getElementById("totalReviews");
const averageRating = document.getElementById("averageRating");
const fiveStarReviews = document.getElementById("fiveStarReviews");

let allReviews = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadReviews();

});

// ======================================
// Load Reviews
// ======================================

async function loadReviews() {

    reviewsTable.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Loading Reviews...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "reviews"));

        allReviews = [];

        reviewsTable.innerHTML = "";

        if (snapshot.empty) {

            reviewsTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No Reviews Found
                    </td>
                </tr>
            `;

            totalReviews.textContent = "0";
            averageRating.textContent = "0.0 ⭐";
            fiveStarReviews.textContent = "0";

            return;

        }

        let totalRating = 0;
        let fiveStars = 0;

        snapshot.forEach((reviewDoc) => {

            const review = reviewDoc.data();

            review.id = reviewDoc.id;

            allReviews.push(review);

            const rating = Number(review.rating || 0);

            totalRating += rating;

            if (rating === 5) {

                fiveStars++;

            }

        });

        totalReviews.textContent = allReviews.length;

        averageRating.textContent =
            (totalRating / allReviews.length).toFixed(1) + " ⭐";

        fiveStarReviews.textContent = fiveStars;

        renderReviews(allReviews);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Reviews
// ======================================

function renderReviews(reviews){

    reviewsTable.innerHTML = "";

    reviews.forEach(review => {

        reviewsTable.innerHTML += `

        <tr>

            <td>${review.projectTitle || "-"}</td>

            <td>${review.clientEmail || "-"}</td>

            <td>${review.freelancerEmail || "-"}</td>

            <td>

                <span class="rating">

                    ⭐ ${review.rating || 0}

                </span>

            </td>

            <td>

                ${(review.review || "").substring(0,50)}...

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewReview('${review.id}')">

                    View

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteReview('${review.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

searchReview.addEventListener("input", () => {

    const value = searchReview.value.toLowerCase();

    const filtered = allReviews.filter(review =>

        (review.projectTitle || "")
        .toLowerCase()
        .includes(value)

        ||

        (review.clientEmail || "")
        .toLowerCase()
        .includes(value)

        ||

        (review.freelancerEmail || "")
        .toLowerCase()
        .includes(value)

    );

    renderReviews(filtered);

});

// ======================================
// View Review
// ======================================

window.viewReview = function(id){

    const review = allReviews.find(r => r.id === id);

    if(!review) return;

    alert(

`Project:
${review.projectTitle}

Client:
${review.clientEmail}

Freelancer:
${review.freelancerEmail}

Rating:
⭐ ${review.rating}

Review:

${review.review}`

    );

};

// ======================================
// Delete Review
// ======================================

window.deleteReview = async function(id){

    const ok = confirm("Delete this review?");

    if(!ok) return;

    try{

        await deleteDoc(doc(db,"reviews",id));

        alert("✅ Review Deleted Successfully");

        loadReviews();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};