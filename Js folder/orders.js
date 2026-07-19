// ======================================
// WorkBee - Orders
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const ordersContainer = document.getElementById("ordersContainer");

const statusFilter = document.getElementById("statusFilter");

const searchOrder = document.getElementById("searchOrder");

const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const cancelledCount = document.getElementById("cancelledCount");

let currentUser = null;
let allOrders = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    loadOrders();

});

// ======================================
// Load Orders
// ======================================

async function loadOrders() {

    try {

        ordersContainer.innerHTML = "<p>Loading Orders...</p>";

        const q = query(
            collection(db, "orders"),
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(q);

        allOrders = [];

        let active = 0;
        let completed = 0;
        let cancelled = 0;

        snapshot.forEach((orderDoc) => {

            const order = orderDoc.data();

            order.id = orderDoc.id;

            allOrders.push(order);

            if (order.status === "Active") active++;
            if (order.status === "Completed") completed++;
            if (order.status === "Cancelled") cancelled++;

        });

        activeCount.textContent = active;
        completedCount.textContent = completed;
        cancelledCount.textContent = cancelled;

        renderOrders(allOrders);

    } catch (error) {

        console.error(error);

        ordersContainer.innerHTML = `
            <div class="empty">
                ${error.message}
            </div>
        `;

    }

}

// ======================================
// Render Orders
// ======================================

function renderOrders(list) {

    ordersContainer.innerHTML = "";

    if (list.length === 0) {

        ordersContainer.innerHTML = `
            <div class="empty">
                No Orders Found
            </div>
        `;

        return;

    }

    list.forEach(order => {

        const card = document.createElement("div");

        card.className = "order-card";

        const statusClass = order.status.toLowerCase();

        card.innerHTML = `

            <h2>${order.projectTitle || "Untitled Project"}</h2>

            <p><strong>Client:</strong> ${order.clientEmail || "-"}</p>

            <p><strong>Freelancer:</strong> ${order.freelancerEmail || "-"}</p>

            <p><strong>Budget:</strong> $${order.budget || 0}</p>

            <p><strong>Deadline:</strong> ${order.deadline || "-"}</p>

            <span class="status ${statusClass}">
                ${order.status}
            </span>

            <div class="actions">

                <button
                    class="view-btn"
                    onclick="viewOrder('${order.id}')">

                    View

                </button>

                <button
                    class="complete-btn"
                    onclick="completeOrder('${order.id}')">

                    Complete

                </button>

                <button
                    class="cancel-btn"
                    onclick="cancelOrder('${order.id}')">

                    Cancel

                </button>

                <button
                    class="chat-btn"
                    onclick="openChat('${order.id}')">

                    Chat

                </button>

            </div>

        `;

        ordersContainer.appendChild(card);

    });

}

// ======================================
// Search + Filter
// ======================================

function applyFilters() {

    const keyword = searchOrder.value.toLowerCase();

    const status = statusFilter.value;

    const filtered = allOrders.filter(order => {

        const matchSearch =
            (order.projectTitle || "")
            .toLowerCase()
            .includes(keyword);

        const matchStatus =
            status === "All"
            || order.status === status;

        return matchSearch && matchStatus;

    });

    renderOrders(filtered);

}

searchOrder.addEventListener("input", applyFilters);

statusFilter.addEventListener("change", applyFilters);

// ======================================
// View Order
// ======================================

window.viewOrder = function(id){

    const order = allOrders.find(o => o.id === id);

    if(!order) return;

    alert(

`Project: ${order.projectTitle}

Client:
${order.clientEmail}

Freelancer:
${order.freelancerEmail}

Budget:
$${order.budget}

Status:
${order.status}

Deadline:
${order.deadline}`

    );

};

// ======================================
// Complete Order
// ======================================

window.completeOrder = async function(id){

    if(!confirm("Mark this order as completed?")) return;

    await updateDoc(doc(db,"orders",id),{

        status:"Completed"

    });

    loadOrders();

};

// ======================================
// Cancel Order
// ======================================

window.cancelOrder = async function(id){

    if(!confirm("Cancel this order?")) return;

    await updateDoc(doc(db,"orders",id),{

        status:"Cancelled"

    });

    loadOrders();

};

// ======================================
// Chat
// ======================================

window.openChat = function(id){

    window.location.href =
        "chat.html?orderId=" + id;

};