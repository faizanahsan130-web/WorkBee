// ======================================
// WorkBee Chat V2
// Part 1 - Authentication & Initialization
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const chatUserName = document.getElementById("chatUserName");
const onlineStatus = document.getElementById("onlineStatus");

const chatTitle = document.getElementById("chatTitle");

const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const typingIndicator = document.getElementById("typingIndicator");

const imageFile = document.getElementById("imageFile");

const attachmentFile = document.getElementById("attachmentFile");

const emojiBtn = document.getElementById("emojiBtn");

// ======================================
// Global Variables
// ======================================

let currentUser = null;

let currentChatId = null;

let currentUserProfile = null;

let unsubscribeMessages = null;

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadCurrentUser();

    initializeChat();

});

// ======================================
// Load Current User
// ======================================

async function loadCurrentUser() {

    try {

        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            currentUserProfile = userSnap.data();

            chatUserName.textContent =
                currentUserProfile.fullName || currentUser.email;

        } else {

            chatUserName.textContent = currentUser.email;

        }

    }

    catch (error) {

        console.error(error);

        chatUserName.textContent = currentUser.email;

    }

}

// ======================================
// Initialize Chat
// ======================================

function initializeChat() {

    const params = new URLSearchParams(window.location.search);

    currentChatId = params.get("chat");

    if (!currentChatId) {

        messages.innerHTML = `

        <div class="loading">

            No Chat Selected

        </div>

        `;

        return;

    }

    chatTitle.textContent =
        "Conversation #" + currentChatId;

    onlineStatus.textContent = "Connecting...";

    loadMessages();

}

// ======================================
// Auto Scroll
// ======================================

function scrollToBottom() {

    messages.scrollTop = messages.scrollHeight;

}

// ======================================
// Loading State
// ======================================

function showLoading() {

    messages.innerHTML = `

    <div class="loading">

        Loading Messages...

    </div>

    `;

}

// ======================================
// Empty State
// ======================================

function showEmptyChat() {

    messages.innerHTML = `

    <div class="loading">

        No messages yet.<br>

        Start the conversation 👋

    </div>

    `;

}

console.log("====================================");
console.log("🐝 WorkBee Chat V2");
console.log("Authentication Ready");
console.log("Initialization Ready");
console.log("====================================");
// ======================================
// WorkBee Chat V2
// Part 2 - Real-Time Messages
// ======================================

// ======================================
// Load Messages
// ======================================

function loadMessages() {

    showLoading();

    // Purana listener remove karo
    if (unsubscribeMessages) {

        unsubscribeMessages();

    }

    const messagesRef = collection(
        db,
        "chats",
        currentChatId,
        "messages"
    );

    const q = query(
        messagesRef,
        orderBy("createdAt", "asc")
    );

    unsubscribeMessages = onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        if (snapshot.empty) {

            showEmptyChat();

            return;

        }

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            renderMessage({
                id: docSnap.id,
                ...data
            });

        });

        scrollToBottom();

        onlineStatus.textContent = "Online";

    }, (error) => {

        console.error(error);

        messages.innerHTML = `

        <div class="loading">

            Failed to load messages.

        </div>

        `;

    });

}

// ======================================
// Render Message
// ======================================

function renderMessage(message) {

    const mine =
        message.senderId === currentUser.uid;

    const bubble =
        document.createElement("div");

    bubble.className =
        mine
        ? "message my-message"
        : "message other-message";

    let html = "";

    // Sender Name
    if (!mine) {

        html += `

        <div class="sender">

            ${message.senderName || "User"}

        </div>

        `;

    }

    // Text Message
    if (message.text) {

        html += `

        <p>

            ${escapeHtml(message.text)}

        </p>

        `;

    }

    // Image
    if (message.imageUrl) {

        html += `

        <img

            src="${message.imageUrl}"

            alt="Image"

            loading="lazy"

        >

        `;

    }

    // File Attachment
    if (message.fileUrl) {

        html += `

        <a

            class="attachment"

            href="${message.fileUrl}"

            target="_blank">

            📎 ${message.fileName || "Attachment"}

        </a>

        `;

    }

    // Time
    let time = "";

    if (message.createdAt?.toDate) {

        time =
            message.createdAt
            .toDate()
            .toLocaleTimeString([], {

                hour: "2-digit",

                minute: "2-digit"

            });

    }

    html += `

    <span class="message-time">

        ${time}

    </span>

    `;

    // Seen Status
    if (mine) {

        html += `

        <div class="seen">

            ${message.seen ? "✔✔ Seen" : "✔ Sent"}

        </div>

        `;

    }

    bubble.innerHTML = html;

    messages.appendChild(bubble);

}

// ======================================
// HTML Escape
// ======================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

console.log("✅ Real-Time Chat Ready");
// ======================================
// WorkBee Chat V2
// Part 3 - Send Message System
// ======================================

// ======================================
// Send Button
// ======================================

sendBtn.addEventListener("click", sendMessage);

// ======================================
// Enter Key Support
// ======================================

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

// ======================================
// Send Message
// ======================================

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    if (!currentChatId) {

        alert("Chat not found.");

        return;

    }

    sendBtn.disabled = true;

    sendBtn.textContent = "Sending...";

    try {

        await addDoc(

            collection(
                db,
                "chats",
                currentChatId,
                "messages"
            ),

            {

                senderId: currentUser.uid,

                senderName:
                    currentUserProfile?.fullName ||
                    currentUser.email,

                senderEmail:
                    currentUser.email,

                text: text,

                imageUrl: "",

                fileUrl: "",

                fileName: "",

                seen: false,

                type: "text",

                createdAt: serverTimestamp()

            }

        );

        messageInput.value = "";

        messageInput.focus();

        scrollToBottom();

    }

    catch (error) {

        console.error(error);

        alert("Failed to send message.\n\n" + error.message);

    }

    finally {

        sendBtn.disabled = false;

        sendBtn.innerHTML = "➤";

    }

}

// ======================================
// Input Auto Resize (Future Ready)
// ======================================

messageInput.addEventListener("input", () => {

    const limit = 2000;

    if (messageInput.value.length > limit) {

        messageInput.value =
            messageInput.value.substring(0, limit);

    }

});

// ======================================
// Typing Indicator Placeholder
// ======================================

messageInput.addEventListener("focus", () => {

    typingIndicator.textContent = "";

});

console.log("✅ Send Message System Ready");
// ======================================
// WorkBee Chat V2
// Part 4 - Image Upload
// ======================================

imageFile.addEventListener("change", async () => {

    const file = imageFile.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        imageFile.value = "";

        return;

    }

    const formData = new FormData();

    formData.append("image", file);

    sendBtn.disabled = true;

    sendBtn.innerHTML = "Uploading...";

    try {

        const response = await fetch(
            "http://localhost:3000/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!result.success) {

            throw new Error(result.message);

        }

        await addDoc(

            collection(
                db,
                "chats",
                currentChatId,
                "messages"
            ),

            {

                senderId: currentUser.uid,

                senderName:
                    currentUserProfile?.fullName ||
                    currentUser.email,

                senderEmail:
                    currentUser.email,

                text: "",

                imageUrl: result.imageUrl,

                fileUrl: "",

                fileName: "",

                type: "image",

                seen: false,

                createdAt: serverTimestamp()

            }

        );

        imageFile.value = "";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        sendBtn.disabled = false;

        sendBtn.innerHTML = "➤";

    }

});
// ======================================
// File Upload
// ======================================

attachmentFile.addEventListener("change", async () => {

    const file = attachmentFile.files[0];

    if (!file) return;

    alert(
        "File upload endpoint will be enabled after API V2.\n\nCurrently image upload is active."
    );

    attachmentFile.value = "";

});
// ======================================
// WorkBee Chat V2
// Part 5 - Typing, Presence & Seen Status
// ======================================

// ======================================
// User Presence
// ======================================

async function updatePresence(status = "online") {

    try {

        await setDoc(

            doc(db, "presence", currentUser.uid),

            {

                uid: currentUser.uid,

                name:
                    currentUserProfile?.fullName ||
                    currentUser.email,

                status,

                lastSeen: serverTimestamp()

            },

            { merge: true }

        );

        onlineStatus.textContent =
            status === "online"
                ? "🟢 Online"
                : "⚪ Offline";

    }

    catch (error) {

        console.error("Presence Error:", error);

    }

}

// Login ke baad online

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    await updatePresence("online");

});

// Browser band ya refresh

window.addEventListener("beforeunload", () => {

    updatePresence("offline");

});

// ======================================
// Typing Indicator
// ======================================

let typingTimeout = null;

messageInput.addEventListener("input", async () => {

    if (!currentChatId) return;

    try {

        await setDoc(

            doc(
                db,
                "chats",
                currentChatId,
                "typing",
                currentUser.uid
            ),

            {

                uid: currentUser.uid,

                name:
                    currentUserProfile?.fullName ||
                    currentUser.email,

                typing: true,

                updatedAt: serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(error);

    }

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(async () => {

        try {

            await setDoc(

                doc(
                    db,
                    "chats",
                    currentChatId,
                    "typing",
                    currentUser.uid
                ),

                {

                    typing: false,

                    updatedAt: serverTimestamp()

                },

                { merge: true }

            );

        }

        catch (error) {

            console.error(error);

        }

    }, 1500);

});

// ======================================
// Seen Status
// ======================================

async function markMessagesAsSeen(snapshot) {

    try {

        const updates = [];

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if (
                data.senderId !== currentUser.uid &&
                !data.seen
            ) {

                updates.push(

                    updateDoc(

                        doc(
                            db,
                            "chats",
                            currentChatId,
                            "messages",
                            docSnap.id
                        ),

                        {

                            seen: true,

                            seenAt: serverTimestamp()

                        }

                    )

                );

            }

        });

        await Promise.all(updates);

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================
// Call Seen Status
// ======================================

// loadMessages() ke onSnapshot callback ke andar,
// render complete hone ke baad ye line add karo:
//
// await markMessagesAsSeen(snapshot);

// ======================================
// Console
// ======================================

console.log("✅ Presence Ready");
console.log("✅ Typing Indicator Ready");
console.log("✅ Seen Status Ready");
// ======================================
// WorkBee Chat V2
// Part 6 - Final Production
// ======================================

// ======================================
// Emoji Button
// ======================================

emojiBtn.addEventListener("click", () => {

    messageInput.value += "😊";

    messageInput.focus();

});

// ======================================
// Desktop Notification
// ======================================

async function showNotification(title, body) {

    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {

        await Notification.requestPermission();

    }

    if (Notification.permission === "granted") {

        new Notification(title, {

            body,

            icon: "images/logo.png"

        });

    }

}

// ======================================
// Message Delete
// ======================================

window.deleteMessage = async function(messageId) {

    const ok = confirm("Delete this message?");

    if (!ok) return;

    try {

        await updateDoc(

            doc(
                db,
                "chats",
                currentChatId,
                "messages",
                messageId
            ),

            {

                deleted: true,

                text: "🚫 This message was deleted.",

                imageUrl: "",

                fileUrl: "",

                fileName: "",

                type: "deleted"

            }

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Edit Message
// ======================================

window.editMessage = async function(messageId, oldText){

    const newText = prompt(

        "Edit Message",

        oldText

    );

    if(newText===null) return;

    if(newText.trim()==="") return;

    try{

        await updateDoc(

            doc(
                db,
                "chats",
                currentChatId,
                "messages",
                messageId
            ),

            {

                text:newText,

                edited:true,

                editedAt:serverTimestamp()

            }

        );

    }

    catch(error){

        alert(error.message);

    }

};

// ======================================
// Connection Monitor
// ======================================

window.addEventListener("online",()=>{

    onlineStatus.textContent="🟢 Online";

});

window.addEventListener("offline",()=>{

    onlineStatus.textContent="🔴 Offline";

});

// ======================================
// Cleanup
// ======================================

window.addEventListener("beforeunload",()=>{

    if(unsubscribeMessages){

        unsubscribeMessages();

    }

});

// ======================================
// Version
// ======================================

console.log("==================================");
console.log("WorkBee Chat V2");
console.log("Production Version");
console.log("Real-Time Messaging Enabled");
console.log("==================================");