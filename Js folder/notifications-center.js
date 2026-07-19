// ======================================
// WorkBee - Notifications Center
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const notificationsContainer = document.getElementById("notificationsContainer");
const searchNotification = document.getElementById("searchNotification");
const filterNotification = document.getElementById("filterNotification");
const markAllReadBtn = document.getElementById("markAllRead");

const totalNotifications = document.getElementById("totalNotifications");
const unreadNotifications = document.getElementById("unreadNotifications");
const readNotifications = document.getElementById("readNotifications");

let currentUser = null;
let allNotifications = [];

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
    listenNotifications();

});

// ======================================
// Real-time Notifications
// ======================================

function listenNotifications() {

    const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid)
    );

    onSnapshot(q, (snapshot) => {

        allNotifications = [];

        snapshot.forEach((docSnap) => {

            allNotifications.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        allNotifications.sort((a, b) => {

            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;

            return bTime - aTime;

        });

        updateCounters();
        applyFilters();

    });

}

// ======================================
// Counters
// ======================================

function updateCounters() {

    const total = allNotifications.length;

    const unread = allNotifications.filter(n => !n.read).length;

    totalNotifications.textContent = total;
    unreadNotifications.textContent = unread;
    readNotifications.textContent = total - unread;

}

// ======================================
// Render
// ======================================

function renderNotifications(list) {

    notificationsContainer.innerHTML = "";

    if (list.length === 0) {

        notificationsContainer.innerHTML = `
            <div class="empty">
                No notifications found.
            </div>
        `;

        return;

    }

    list.forEach(item => {

        const card = document.createElement("div");

        card.className = "notification-card";

        const date = item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleString()
            : "Just now";

        card.innerHTML = `

            <div class="notification-info">

                <h3>${item.title || "Notification"}</h3>

                <p>${item.message || ""}</p>

                <div class="notification-time">
                    ${date}
                </div>

                <span class="badge ${item.read ? "read" : "unread"}">
                    ${item.read ? "Read" : "Unread"}
                </span>

            </div>

            <div class="actions">

                ${
                    !item.read
                    ?
                    `<button class="read-btn"
                        onclick="markAsRead('${item.id}')">
                        Mark Read
                    </button>`
                    :
                    ""
                }

                <button class="delete-btn"
                    onclick="deleteNotification('${item.id}')">
                    Delete
                </button>

            </div>

        `;

        notificationsContainer.appendChild(card);

    });

}

// ======================================
// Search + Filter
// ======================================

function applyFilters() {

    const keyword =
        searchNotification.value.toLowerCase();

    const type =
        filterNotification.value;

    const filtered = allNotifications.filter(item => {

        const searchMatch =
            (item.title || "")
            .toLowerCase()
            .includes(keyword) ||

            (item.message || "")
            .toLowerCase()
            .includes(keyword);

        const typeMatch =
            type === "All" ||
            item.type === type;

        return searchMatch && typeMatch;

    });

    renderNotifications(filtered);

}

searchNotification.addEventListener("input", applyFilters);

filterNotification.addEventListener("change", applyFilters);

// ======================================
// Mark Read
// ======================================

window.markAsRead = async function(id) {

    try {

        await updateDoc(
            doc(db, "notifications", id),
            {
                read: true
            }
        );

    }

    catch (error) {

        console.error(error);
        alert(error.message);

    }

};

// ======================================
// Delete
// ======================================

window.deleteNotification = async function(id) {

    if (!confirm("Delete notification?"))
        return;

    try {

        await deleteDoc(
            doc(db, "notifications", id)
        );

    }

    catch (error) {

        console.error(error);
        alert(error.message);

    }

};

// ======================================
// Mark All Read
// ======================================

markAllReadBtn.addEventListener("click", async () => {

    try {

        const batch = writeBatch(db);

        allNotifications.forEach(item => {

            if (!item.read) {

                batch.update(
                    doc(db, "notifications", item.id),
                    {
                        read: true
                    }
                );

            }

        });

        await batch.commit();

        alert("All notifications marked as read.");

    }

    catch (error) {

        console.error(error);
        alert(error.message);

    }

});