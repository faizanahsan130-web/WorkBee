// ======================================
// WorkBee Admin - Analytics
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// HTML Elements
// ======================================

const totalUsers = document.getElementById("totalUsers");
const totalFreelancers = document.getElementById("totalFreelancers");
const totalClients = document.getElementById("totalClients");
const totalProjects = document.getElementById("totalProjects");
const totalApplications = document.getElementById("totalApplications");
const totalRevenue = document.getElementById("totalRevenue");
const totalWithdraws = document.getElementById("totalWithdraws");
const averageRating = document.getElementById("averageRating");

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadAnalytics();

});

// ======================================
// Load Analytics
// ======================================

async function loadAnalytics() {

    try {

        // USERS
        const usersSnapshot = await getDocs(collection(db, "users"));

        let users = 0;
        let freelancers = 0;
        let clients = 0;

        usersSnapshot.forEach((doc) => {

            users++;

            const data = doc.data();

            if (data.role === "Freelancer") freelancers++;

            if (data.role === "Client") clients++;

        });

        totalUsers.textContent = users;
        totalFreelancers.textContent = freelancers;
        totalClients.textContent = clients;

        // PROJECTS
        const projectsSnapshot = await getDocs(collection(db, "projects"));

        totalProjects.textContent = projectsSnapshot.size;

        // APPLICATIONS
        const applicationsSnapshot = await getDocs(collection(db, "applications"));

        totalApplications.textContent = applicationsSnapshot.size;

        // PAYMENTS
        const paymentsSnapshot = await getDocs(collection(db, "payments"));

        let revenue = 0;

        paymentsSnapshot.forEach((doc) => {

            revenue += Number(doc.data().amount || 0);

        });

        totalRevenue.textContent = "$" + revenue.toFixed(2);

        // WITHDRAWS
        const withdrawSnapshot = await getDocs(collection(db, "withdraws"));

        totalWithdraws.textContent = withdrawSnapshot.size;

        // REVIEWS
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));

        let ratingTotal = 0;
        let reviewCount = 0;

        reviewsSnapshot.forEach((doc) => {

            ratingTotal += Number(doc.data().rating || 0);

            reviewCount++;

        });

        averageRating.textContent =
            reviewCount > 0
            ? (ratingTotal / reviewCount).toFixed(1) + " ⭐"
            : "0 ⭐";

        createRevenueChart(revenue);

        createUserChart(freelancers, clients);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Revenue Chart
// ======================================

function createRevenueChart(totalRevenueAmount) {

    const ctx = document.getElementById("revenueChart");

    new Chart(ctx, {

        type: "bar",

        data: {

            labels: ["Revenue"],

            datasets: [{

                label: "Total Revenue",

                data: [totalRevenueAmount]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// ======================================
// User Chart
// ======================================

function createUserChart(freelancers, clients) {

    const ctx = document.getElementById("userChart");

    new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [

                "Freelancers",

                "Clients"

            ],

            datasets: [{

                data: [

                    freelancers,

                    clients

                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}