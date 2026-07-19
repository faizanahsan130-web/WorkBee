// ======================================
// WorkBee Notifications V2
// Part 1 - Complete Replacement
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const notificationsContainer =
document.getElementById("notificationsContainer");

const totalNotifications =
document.getElementById("totalNotifications");

const unreadNotifications =
document.getElementById("unreadNotifications");

const searchNotification =
document.getElementById("searchNotification");

const notificationFilter =
document.getElementById("notificationFilter");

const markAllRead =
document.getElementById("markAllRead");

const notificationTemplate =
document.getElementById("notificationTemplate");

const emptyTemplate =
document.getElementById("emptyTemplate");

// ======================================
// Variables
// ======================================

let currentUser = null;

let notifications = [];

let filteredNotifications = [];

let unsubscribeNotifications = null;

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    initializeNotifications();

});

// ======================================
// Initialize
// ======================================

function initializeNotifications() {

    loadNotifications();

}

// ======================================
// Real-Time Firestore Listener
// ======================================

function loadNotifications() {

    if (unsubscribeNotifications) {

        unsubscribeNotifications();

    }

    const q = query(

        collection(db, "notifications"),

        where("userId", "==", currentUser.uid),

        orderBy("createdAt", "desc")

    );

    unsubscribeNotifications = onSnapshot(

        q,

        (snapshot) => {

            notifications = [];

            snapshot.forEach((docSnap) => {

                notifications.push({

                    id: docSnap.id,

                    ...docSnap.data()

                });

            });

            filteredNotifications = [...notifications];

            renderNotifications();

        },

        (error) => {

            console.error(error);

            notificationsContainer.innerHTML = `

                <div class="empty-state">

                    <h2>

                        Failed to load notifications

                    </h2>

                    <p>

                        ${error.message}

                    </p>

                </div>

            `;

        }

    );

}

console.log("✅ Notifications V2 Initialized");
// ======================================
// WorkBee Notifications V2
// Part 2 - Render Notifications
// ======================================

// ======================================
// Render Notifications
// ======================================

function renderNotifications() {

    notificationsContainer.innerHTML = "";

    updateCounters();

    if (filteredNotifications.length === 0) {

        const empty =
            emptyTemplate.content.cloneNode(true);

        notificationsContainer.appendChild(empty);

        return;

    }

    filteredNotifications.forEach((item) => {

        const clone =
            notificationTemplate.content.cloneNode(true);

        const card =
            clone.querySelector(".notification-card");

        const icon =
            clone.querySelector(".notification-icon");

        const title =
            clone.querySelector(".notification-title");

        const message =
            clone.querySelector(".notification-message");

        const time =
            clone.querySelector(".notification-time");

        const type =
            clone.querySelector(".notification-type");

        const readBtn =
            clone.querySelector(".mark-read-btn");

        const deleteBtn =
            clone.querySelector(".delete-btn");

        // ==========================
        // Type Class
        // ==========================

        card.classList.add(

            (item.type || "System").toLowerCase()

        );

        // ==========================
        // Read / Unread
        // ==========================

        if (item.read) {

            card.classList.remove("unread");

            card.classList.add("read");

            readBtn.style.display = "none";

        }

        // ==========================
        // Icon
        // ==========================

        icon.textContent = getNotificationIcon(item.type);

        // ==========================
        // Content
        // ==========================

        title.textContent =
            item.title || "Notification";

        message.textContent =
            item.message || "";

        type.textContent =
            item.type || "System";

        time.textContent =
            formatTime(item.createdAt);

        // ==========================
        // Buttons
        // ==========================

        readBtn.addEventListener("click", () => {

            markAsRead(item.id);

        });

        deleteBtn.addEventListener("click", () => {

            deleteNotification(item.id);

        });

        notificationsContainer.appendChild(clone);

    });

}

// ======================================
// Notification Icons
// ======================================

function getNotificationIcon(type) {

    switch(type){

        case "Message":

            return "💬";

        case "Proposal":

            return "📑";

        case "Project":

            return "📁";

        case "Payment":

            return "💳";

        case "Review":

            return "⭐";

        default:

            return "🔔";

    }

}

// ======================================
// Time Formatter
// ======================================

function formatTime(timestamp){

    if(!timestamp) return "";

    const date = timestamp.toDate();

    const seconds =
        Math.floor(
            (Date.now()-date.getTime())/1000
        );

    if(seconds<60)
        return "Just now";

    if(seconds<3600)
        return Math.floor(seconds/60)+" min ago";

    if(seconds<86400)
        return Math.floor(seconds/3600)+" hr ago";

    if(seconds<604800)
        return Math.floor(seconds/86400)+" day ago";

    return date.toLocaleDateString();

}

// ======================================
// Counters
// ======================================

function updateCounters(){

    totalNotifications.textContent =
        notifications.length;

    unreadNotifications.textContent =
        notifications.filter(n=>!n.read).length;

}
// ======================================
// WorkBee Notifications V2
// Part 3 - Search & Filters
// ======================================

// ======================================
// Search Notifications
// ======================================

searchNotification.addEventListener("input", () => {

    applyFilters();

});

// ======================================
// Category Filter
// ======================================

notificationFilter.addEventListener("change", () => {

    applyFilters();

});

// ======================================
// Apply Filters
// ======================================

function applyFilters() {

    const keyword =
        searchNotification.value
        .trim()
        .toLowerCase();

    const category =
        notificationFilter.value;

    filteredNotifications = notifications.filter((item) => {

        // ==========================
        // Search
        // ==========================

        const matchSearch =

            (item.title || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (item.message || "")
            .toLowerCase()
            .includes(keyword);

        // ==========================
        // Category
        // ==========================

        const matchCategory =

            category === "All"

            ||

            (item.type || "System") === category;

        return matchSearch && matchCategory;

    });

    renderNotifications();

}

// ======================================
// Refresh Filters
// ======================================

function refreshNotifications(){

    applyFilters();

}

// ======================================
// Clear Filters
// ======================================

function clearFilters(){

    searchNotification.value="";

    notificationFilter.value="All";

    filteredNotifications=[...notifications];

    renderNotifications();

}

// ======================================
// Keyboard Shortcut
// Ctrl + K = Focus Search
// ======================================

document.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key.toLowerCase()==="k"){

        e.preventDefault();

        searchNotification.focus();

    }

});

// ======================================
// ESC = Clear Search
// ======================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        clearFilters();

    }

});

console.log("✅ Search & Filter Ready");
// ======================================
// WorkBee Notifications V2
// Part 4 - Mark Read Functions
// ======================================

// ======================================
// Mark Single Notification as Read
// ======================================

async function markAsRead(notificationId){

    try{

        await updateDoc(

            doc(
                db,
                "notifications",
                notificationId
            ),

            {

                read:true,

                readAt:new Date()

            }

        );

    }

    catch(error){

        console.error(error);

        alert("Unable to mark notification as read.");

    }

}

// ======================================
// Mark All Notifications as Read
// ======================================

markAllRead.addEventListener("click",async()=>{

    const unreadList =

        notifications.filter(item=>!item.read);

    if(unreadList.length===0){

        alert("All notifications are already read.");

        return;

    }

    try{

        markAllRead.disabled=true;

        markAllRead.textContent="Updating...";

        for(const item of unreadList){

            await updateDoc(

                doc(
                    db,
                    "notifications",
                    item.id
                ),

                {

                    read:true,

                    readAt:new Date()

                }

            );

        }

        alert("All notifications marked as read.");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

    finally{

        markAllRead.disabled=false;

        markAllRead.textContent="✔ Mark All Read";

    }

});

// ======================================
// Auto Update Counter
// ======================================

function getUnreadCount(){

    return notifications.filter(

        item=>!item.read

    ).length;

}

// ======================================
// Refresh Summary
// ======================================

function refreshSummary(){

    totalNotifications.textContent=

        notifications.length;

    unreadNotifications.textContent=

        getUnreadCount();

}

// ======================================
// Auto Refresh
// ======================================

setInterval(()=>{

    refreshSummary();

},5000);

console.log("✅ Mark Read Module Ready");
// ======================================
// WorkBee Notifications V2
// Part 5 - Delete & Batch Operations
// ======================================

// ======================================
// Delete Notification
// ======================================

async function deleteNotification(notificationId){

    const confirmDelete = confirm(
        "Delete this notification?"
    );

    if(!confirmDelete) return;

    try{

        await deleteDoc(

            doc(
                db,
                "notifications",
                notificationId
            )

        );

    }

    catch(error){

        console.error(error);

        alert(
            "Unable to delete notification."
        );

    }

}

// ======================================
// Batch Mark All Read
// Production Optimized
// ======================================

async function batchMarkAllRead(){

    const unreadList =

        notifications.filter(
            item => !item.read
        );

    if(unreadList.length===0){

        alert("All notifications are already read.");

        return;

    }

    try{

        const batch = writeBatch(db);

        unreadList.forEach(item=>{

            batch.update(

                doc(
                    db,
                    "notifications",
                    item.id
                ),

                {

                    read:true,

                    readAt:new Date()

                }

            );

        });

        await batch.commit();

        alert("All notifications updated.");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Replace Old Listener
// ======================================

markAllRead.removeEventListener("click",()=>{});

markAllRead.addEventListener("click",()=>{

    batchMarkAllRead();

});

// ======================================
// Auto Refresh Summary
// ======================================

function refreshUI(){

    updateCounters();

    renderNotifications();

}

// ======================================
// Firestore Listener Refresh
// ======================================

if(unsubscribeNotifications){

    console.log(
        "Realtime notifications active."
    );

}

console.log(
    "✅ Notification Delete Ready"
);
// ======================================
// WorkBee Notifications V2
// Part 6 - Production Final
// ======================================

// ======================================
// Window Cleanup
// ======================================

window.addEventListener("beforeunload", () => {

    if (unsubscribeNotifications) {

        unsubscribeNotifications();

        console.log("Notifications listener stopped.");

    }

});

// ======================================
// Logout Cleanup
// ======================================

function cleanupNotifications() {

    if (unsubscribeNotifications) {

        unsubscribeNotifications();

        unsubscribeNotifications = null;

    }

}

window.addEventListener("pagehide", cleanupNotifications);

// ======================================
// Sort Notifications (Newest First)
// ======================================

function sortNotifications() {

    notifications.sort((a, b) => {

        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;

        return timeB - timeA;

    });

}

// ======================================
// Refresh Screen
// ======================================

function refreshNotificationScreen() {

    sortNotifications();

    applyFilters();

    updateCounters();

}

// ======================================
// Online / Offline Status
// ======================================

window.addEventListener("online", () => {

    console.log("Internet Connected");

    refreshNotificationScreen();

});

window.addEventListener("offline", () => {

    console.log("Internet Disconnected");

});

// ======================================
// Optional Browser Notification
// ======================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {

        await Notification.requestPermission();

    }

}

requestNotificationPermission();

// ======================================
// Browser Notification
// ======================================

function showBrowserNotification(item) {

    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    new Notification(item.title || "WorkBee", {

        body: item.message || "",

        icon: "images/logo.png"

    });

}

// ======================================
// Show notification for new unread items
// ======================================

let previousNotificationCount = 0;

function checkForNewNotifications() {

    if (notifications.length > previousNotificationCount) {

        const newest = notifications[0];

        if (newest && !newest.read) {

            showBrowserNotification(newest);

        }

    }

    previousNotificationCount = notifications.length;

}

// ======================================
// Production Refresh
// ======================================

setInterval(() => {

    refreshNotificationScreen();

    checkForNewNotifications();

}, 30000);

// ======================================
// Version Info
// ======================================

console.log("====================================");

console.log("WorkBee Notifications V2");

console.log("Production Build");

console.log("Realtime Firestore Enabled");

console.log("Search Enabled");

console.log("Category Filter Enabled");

console.log("Mark Read Enabled");

console.log("Delete Enabled");

console.log("Browser Notifications Enabled");

console.log("Version: 2.0");

console.log("====================================");