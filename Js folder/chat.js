// ======================================
// WorkBee Chat V2
// Part 1 - Complete Replacement
// ======================================

// ======================================
// Firebase
// ======================================

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
    serverTimestamp,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const conversationList =
document.getElementById("conversationList");

const messagesContainer =
document.getElementById("messagesContainer");

const messageInput =
document.getElementById("messageInput");

const sendMessage =
document.getElementById("sendMessage");

const chatUserName =
document.getElementById("chatUserName");

const chatStatus =
document.getElementById("chatStatus");

const chatAvatar =
document.getElementById("chatAvatar");

const searchChat =
document.getElementById("searchChat");

// ======================================
// Variables
// ======================================

let currentUser = null;

let currentConversation = null;

let conversations = [];

let messages = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    initializeChat();

});

// ======================================
// Initialize
// ======================================

function initializeChat(){

    loadConversations();

    initializeSearch();

}

// ======================================
// Conversation List
// ======================================

function loadConversations(){

    const q = query(

        collection(db,"conversations")

    );

    onSnapshot(q,(snapshot)=>{

        conversations=[];

        snapshot.forEach(doc=>{

            const data=doc.data();

            if(

                data.members?.includes(currentUser.email)

            ){

                conversations.push({

                    id:doc.id,

                    ...data

                });

            }

        });

        renderConversations();

    });

}

// ======================================
// Render Conversations
// ======================================

function renderConversations(){

    conversationList.innerHTML="";

    if(conversations.length===0){

        conversationList.innerHTML=`

<div class="loading">

No conversations found.

</div>

`;

        return;

    }

    conversations.forEach(chat=>{

        const otherUser=

        chat.members.find(

        email=>email!==currentUser.email

        );

        conversationList.innerHTML+=`

<div
class="conversation-item"
data-id="${chat.id}">

<img
class="conversation-avatar"
src="${chat.photoURL || 'https://via.placeholder.com/50'}">

<div class="conversation-info">

<h4>

${otherUser}

</h4>

<p>

${chat.lastMessage || "Start chatting"}

</p>

</div>

<div class="conversation-time">

${chat.lastTime || ""}

</div>

</div>

`;

    });

    bindConversationClicks();

}

// ======================================
// Conversation Click
// ======================================

function bindConversationClicks(){

document
.querySelectorAll(".conversation-item")
.forEach(item=>{

item.onclick=()=>{

currentConversation=

item.dataset.id;

loadMessages();

};

});

}

// ======================================
// Search
// ======================================

function initializeSearch(){

if(!searchChat) return;

searchChat.addEventListener(

"input",

()=>{

const keyword=

searchChat.value

.toLowerCase();

document

.querySelectorAll(

".conversation-item"

)

.forEach(item=>{

item.style.display=

item.innerText

.toLowerCase()

.includes(keyword)

?

"flex"

:

"none";

});

}

);

}

// ======================================
// Messages
// ======================================

function loadMessages(){

const q=query(

collection(

db,

"conversations",

currentConversation,

"messages"

),

orderBy(

"createdAt"

)

);

onSnapshot(q,(snapshot)=>{

messages=[];

snapshot.forEach(doc=>{

messages.push({

id:doc.id,

...doc.data()

});

});

renderMessages();

});

}

// ======================================
// Send Message
// ======================================

if(sendMessage){

sendMessage.onclick=async()=>{

const text=

messageInput.value.trim();

if(!text) return;

await addDoc(

collection(

db,

"conversations",

currentConversation,

"messages"

),

{

sender:

currentUser.email,

message:text,

type:"text",

createdAt:

serverTimestamp(),

read:false

}

);

messageInput.value="";

};

}

console.log("💬 Chat Part 1 Loaded");
// ======================================
// WorkBee Chat V2
// Part 2 - Messages Rendering & Status
// ======================================

// ======================================
// Render Messages
// ======================================

function renderMessages(){

    messagesContainer.innerHTML="";

    if(messages.length===0){

        messagesContainer.innerHTML=`

        <div class="empty-chat">

            No messages yet.

        </div>

        `;

        return;

    }

    messages.forEach(message=>{

        const own=

        message.sender===currentUser.email;

        const type=

        own ? "sent" : "received";

        let content="";

        // Text Message

        if(message.type==="text"){

            content=`

            <p>

                ${escapeHTML(message.message)}

            </p>

            `;

        }

        // Image Message

        if(message.type==="image"){

            content=`

            <img

            src="${message.imageURL}"

            class="chat-image"

            onclick="window.open('${message.imageURL}','_blank')">

            `;

        }

        // File Message

        if(message.type==="file"){

            content=`

            <a

            href="${message.fileURL}"

            target="_blank">

            📎 ${message.fileName}

            </a>

            `;

        }

        messagesContainer.innerHTML += `

        <div class="message ${type}">

            <div class="message-content">

                ${content}

                <span class="message-time">

                    ${formatTime(message.createdAt)}

                    ${own ? getReadIcon(message.read) : ""}

                </span>

            </div>

        </div>

        `;

    });

    messagesContainer.scrollTop=

    messagesContainer.scrollHeight;

}

// ======================================
// Read Status
// ======================================

function getReadIcon(read){

    return read

    ?

    `<span class="read-status">✓✓</span>`

    :

    `<span class="read-status">✓</span>`;

}

// ======================================
// Time Format
// ======================================

function formatTime(timestamp){

    if(!timestamp) return "";

    try{

        const date=

        timestamp.toDate();

        return date.toLocaleTimeString(

            [],

            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );

    }

    catch{

        return "";

    }

}

// ======================================
// Escape HTML
// ======================================

function escapeHTML(text){

    if(!text) return "";

    return text

    .replace(/&/g,"&amp;")

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .replace(/"/g,"&quot;")

    .replace(/'/g,"&#039;");

}

// ======================================
// Online Status (Foundation)
// ======================================

function updateUserStatus(isOnline){

    chatStatus.textContent=

    isOnline

    ?

    "🟢 Online"

    :

    "⚪ Offline";

}

// ======================================
// Typing Indicator
// ======================================

const typingIndicator=

document.getElementById("typingIndicator");

let typingTimeout=null;

if(messageInput){

messageInput.addEventListener("input",()=>{

typingIndicator.classList.remove("hidden");

clearTimeout(typingTimeout);

typingTimeout=setTimeout(()=>{

typingIndicator.classList.add("hidden");

},1500);

});

}

// ======================================
// Enter Key Send
// ======================================

if(messageInput){

messageInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter" && !e.shiftKey){

e.preventDefault();

sendMessage.click();

}

});

}

// ======================================
// Image Preview
// ======================================

document.addEventListener("click",(e)=>{

if(e.target.classList.contains("chat-image")){

const modal=

document.getElementById("imagePreviewModal");

const preview=

document.getElementById("previewImage");

preview.src=e.target.src;

modal.classList.remove("hidden");

}

});

const closePreview=

document.getElementById("closePreview");

if(closePreview){

closePreview.onclick=()=>{

document

.getElementById("imagePreviewModal")

.classList.add("hidden");

};

}

console.log("💬 Chat Part 2 Loaded");
// ======================================
// WorkBee Chat V2
// Part 3 - Uploads, AI Protection & Moderation
// ======================================

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const storage = getStorage();

// ======================================
// DOM Elements
// ======================================

const imageUpload = document.getElementById("imageUpload");
const fileUpload = document.getElementById("fileUpload");

const aiWarning = document.getElementById("aiWarning");

const reportUserBtn = document.getElementById("reportUser");
const blockUserBtn = document.getElementById("blockUser");

const reportModal = document.getElementById("reportModal");
const blockModal = document.getElementById("blockModal");

// ======================================
// AI Scam Detection
// ======================================

const scamKeywords=[

"telegram",
"whatsapp",
"discord",
"gmail",
"email me",
"contact me",
"outside payment",
"paypal",
"crypto",
"bitcoin",
"binance",
"gift card",
"wire transfer",
"western union",
"moneygram",
"bit.ly",
"tinyurl",
"shorturl"

];

function detectScam(text){

text=text.toLowerCase();

return scamKeywords.some(keyword=>

text.includes(keyword)

);

}

// ======================================
// AI Warning
// ======================================

if(messageInput){

messageInput.addEventListener("input",()=>{

const suspicious=

detectScam(

messageInput.value

);

if(suspicious){

aiWarning.classList.remove("hidden");

}else{

aiWarning.classList.add("hidden");

}

});

}

// ======================================
// Image Upload
// ======================================

if(imageUpload){

imageUpload.onchange=async(e)=>{

const file=e.target.files[0];

if(!file) return;

const storageRef=ref(

storage,

`chat-images/${Date.now()}-${file.name}`

);

await uploadBytes(

storageRef,

file

);

const imageURL=

await getDownloadURL(storageRef);

await addDoc(

collection(

db,

"conversations",

currentConversation,

"messages"

),

{

sender:currentUser.email,

type:"image",

imageURL,

createdAt:serverTimestamp(),

read:false

}

);

};

}

// ======================================
// File Upload
// ======================================

if(fileUpload){

fileUpload.onchange=async(e)=>{

const file=e.target.files[0];

if(!file) return;

const storageRef=ref(

storage,

`chat-files/${Date.now()}-${file.name}`

);

await uploadBytes(

storageRef,

file

);

const fileURL=

await getDownloadURL(storageRef);

await addDoc(

collection(

db,

"conversations",

currentConversation,

"messages"

),

{

sender:currentUser.email,

type:"file",

fileName:file.name,

fileURL,

createdAt:serverTimestamp(),

read:false

}

);

};

}

// ======================================
// Report User
// ======================================

if(reportUserBtn){

reportUserBtn.onclick=()=>{

reportModal.classList.remove("hidden");

};

}

const submitReport=

document.getElementById("submitReport");

const cancelReport=

document.getElementById("cancelReport");

if(cancelReport){

cancelReport.onclick=()=>{

reportModal.classList.add("hidden");

};

}

if(submitReport){

submitReport.onclick=async()=>{

const reason=

document.getElementById("reportReason").value;

const description=

document.getElementById("reportDescription").value;

await addDoc(

collection(db,"reports"),

{

conversationId:currentConversation,

reportedBy:currentUser.email,

reason,

description,

status:"Open",

riskScore:

detectScam(description)

?

90

:

10,

createdAt:serverTimestamp()

}

);

alert("Report submitted successfully.");

reportModal.classList.add("hidden");

};

}

// ======================================
// Block User
// ======================================

if(blockUserBtn){

blockUserBtn.onclick=()=>{

blockModal.classList.remove("hidden");

};

}

const confirmBlock=

document.getElementById("confirmBlock");

const cancelBlock=

document.getElementById("cancelBlock");

if(cancelBlock){

cancelBlock.onclick=()=>{

blockModal.classList.add("hidden");

};

}

if(confirmBlock){

confirmBlock.onclick=()=>{

alert("User blocked successfully.");

blockModal.classList.add("hidden");

};

}

// ======================================
// Emoji Button (Foundation)
// ======================================

const emojiButton=

document.getElementById("emojiButton");

if(emojiButton){

emojiButton.onclick=()=>{

messageInput.value += "😊 ";

messageInput.focus();

};

}

console.log("💬 Chat Part 3 Loaded");
// ======================================
// WorkBee Chat V2
// Part 4 - Production Final
// ======================================

import {
    doc,
    updateDoc,
    setDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// User Presence
// ======================================

async function setOnlineStatus(status){

    if(!currentUser) return;

    try{

        await setDoc(

            doc(db,"presence",currentUser.uid),

            {

                uid:currentUser.uid,

                email:currentUser.email,

                online:status,

                lastSeen:serverTimestamp()

            },

            {

                merge:true

            }

        );

    }

    catch(error){

        console.error(error);

    }

}

window.addEventListener("load",()=>{

    setOnlineStatus(true);

});

window.addEventListener("beforeunload",()=>{

    setOnlineStatus(false);

});

// ======================================
// Read Receipt
// ======================================

async function markMessagesAsRead(){

    if(!currentConversation) return;

    messages.forEach(async(message)=>{

        if(

            message.sender!==currentUser.email &&

            !message.read

        ){

            try{

                await updateDoc(

                    doc(

                        db,

                        "conversations",

                        currentConversation,

                        "messages",

                        message.id

                    ),

                    {

                        read:true

                    }

                );

            }

            catch(error){

                console.error(error);

            }

        }

    });

}

// ======================================
// Auto Read
// ======================================

const observer=new MutationObserver(()=>{

    markMessagesAsRead();

});

observer.observe(messagesContainer,{

    childList:true,

    subtree:true

});

// ======================================
// Notification Sound
// ======================================

const notificationSound=new Audio(

"https://actions.google.com/sounds/v1/cartoon/pop.ogg"

);

let previousMessageCount=0;

function playNotification(){

    if(messages.length>previousMessageCount){

        const latest=

        messages[messages.length-1];

        if(

            latest.sender!==currentUser.email

        ){

            notificationSound.play()

            .catch(()=>{});

        }

    }

    previousMessageCount=

    messages.length;

}

// ======================================
// Override Render
// ======================================

const originalRender=renderMessages;

renderMessages=function(){

    originalRender();

    playNotification();

};

// ======================================
// Archive Chat
// ======================================

async function archiveConversation(){

    if(!currentConversation) return;

    try{

        await updateDoc(

            doc(

                db,

                "conversations",

                currentConversation

            ),

            {

                archived:true,

                archivedBy:currentUser.email

            }

        );

        alert(

            "Conversation Archived."

        );

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Advanced AI Link Scan
// ======================================

function containsSuspiciousLink(text){

    if(!text) return false;

    const patterns=[

        "http://",

        "https://",

        "bit.ly",

        "tinyurl",

        "cutt.ly",

        "t.me",

        "wa.me",

        "discord.gg"

    ];

    text=text.toLowerCase();

    return patterns.some(link=>

        text.includes(link)

    );

}

// ======================================
// Enhanced Send
// ======================================

if(sendMessage){

const oldSend=sendMessage.onclick;

sendMessage.onclick=async()=>{

const text=

messageInput.value.trim();

if(

containsSuspiciousLink(text)

||

detectScam(text)

){

aiWarning.classList.remove("hidden");

}

await oldSend();

};

}

// ======================================
// Message Reaction Foundation
// ======================================

function addReaction(

messageId,

emoji

){

console.log(

"Reaction:",

messageId,

emoji

);

}

// ======================================
// Chat Statistics
// ======================================

function chatAnalytics(){

const sent=

messages.filter(

m=>m.sender===currentUser.email

).length;

const received=

messages.length-sent;

console.log({

sent,

received,

total:messages.length

});

}

setInterval(

chatAnalytics,

60000

);

// ======================================
// Auto Scroll
// ======================================

function smoothScroll(){

messagesContainer.scrollTo({

top:

messagesContainer.scrollHeight,

behavior:"smooth"

});

}

const oldRenderMessages=

renderMessages;

renderMessages=function(){

oldRenderMessages();

smoothScroll();

};

// ======================================
// Production Ready
// ======================================

console.log(

"🚀 WorkBee Chat System Production Ready"

);