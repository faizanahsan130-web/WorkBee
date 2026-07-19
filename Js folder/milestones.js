// ======================================
// WorkBee Milestone System V2
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
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

// Statistics

const totalMilestones =
document.getElementById("totalMilestones");

const pendingMilestones =
document.getElementById("pendingMilestones");

const completedMilestones =
document.getElementById("completedMilestones");

const totalValue =
document.getElementById("totalValue");

// Progress

const progressFill =
document.getElementById("progressFill");

const progressPercent =
document.getElementById("progressPercent");

// Form

const milestoneForm =
document.getElementById("milestoneForm");

const projectId =
document.getElementById("projectId");

const milestoneTitle =
document.getElementById("milestoneTitle");

const milestoneAmount =
document.getElementById("milestoneAmount");

const dueDate =
document.getElementById("dueDate");

const milestoneDescription =
document.getElementById("milestoneDescription");

const createMilestoneBtn =
document.getElementById("createMilestoneBtn");

// Container

const milestoneContainer =
document.getElementById("milestoneContainer");

const refreshMilestones =
document.getElementById("refreshMilestones");

// ======================================
// Variables
// ======================================

let currentUser = null;

let milestones = [];

let unsubscribeMilestones = null;

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    initializeMilestones();

});

// ======================================
// Initialize
// ======================================

function initializeMilestones(){

    loadMilestones();

}

// ======================================
// Load Milestones
// ======================================

function loadMilestones(){

    if(unsubscribeMilestones){

        unsubscribeMilestones();

    }

    const q = query(

        collection(db,"milestones"),

        where("ownerId","==",currentUser.uid),

        orderBy("createdAt","desc")

    );

    unsubscribeMilestones = onSnapshot(

        q,

        (snapshot)=>{

            milestones=[];

            snapshot.forEach(docSnap=>{

                milestones.push({

                    id:docSnap.id,

                    ...docSnap.data()

                });

            });

            updateDashboard();

            renderMilestones();

        }

    );

}

// ======================================
// Dashboard
// ======================================

function updateDashboard(){

    let pending = 0;

    let completed = 0;

    let value = 0;

    milestones.forEach(item=>{

        value += Number(item.amount || 0);

        if(item.status==="Completed"){

            completed++;

        }else{

            pending++;

        }

    });

    totalMilestones.textContent =
    milestones.length;

    pendingMilestones.textContent =
    pending;

    completedMilestones.textContent =
    completed;

    totalValue.textContent =
    "$"+value.toFixed(2);

    const percent =

        milestones.length===0

        ?0

        :Math.round(

        (completed/milestones.length)*100

    );

    progressFill.style.width =
    percent+"%";

    progressPercent.textContent =
    percent+"%";

}

console.log("✅ Milestone System Initialized");
// ======================================
// WorkBee Milestone System V2
// Part 2 - Create Milestone
// ======================================

// ======================================
// Create Milestone
// ======================================

milestoneForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const project = projectId.value.trim();

    const title = milestoneTitle.value.trim();

    const amount = Number(milestoneAmount.value);

    const due = dueDate.value;

    const description = milestoneDescription.value.trim();

    if (!project || !title || !description || !due) {

        alert("Please fill all required fields.");

        return;

    }

    if (amount <= 0) {

        alert("Milestone amount must be greater than zero.");

        return;

    }

    try {

        createMilestoneBtn.disabled = true;

        createMilestoneBtn.textContent =
        "Creating...";

        // ==================================
        // Save Milestone
        // ==================================

        const milestoneRef = await addDoc(

            collection(db, "milestones"),

            {

                ownerId: currentUser.uid,

                ownerEmail: currentUser.email,

                projectId: project,

                title: title,

                description: description,

                amount: amount,

                dueDate: due,

                status: "Pending",

                progress: 0,

                freelancerId: "",

                freelancerEmail: "",

                paymentReleased: false,

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            }

        );

        // ==================================
        // Notification
        // ==================================

        await addDoc(

            collection(db, "notifications"),

            {

                userId: currentUser.uid,

                title: "Milestone Created",

                message:

                `Milestone "${title}" has been created successfully.`,

                type: "milestone",

                read: false,

                referenceId: milestoneRef.id,

                createdAt: serverTimestamp()

            }

        );

        alert("Milestone created successfully.");

        milestoneForm.reset();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

    finally {

        createMilestoneBtn.disabled = false;

        createMilestoneBtn.textContent =
        "🚀 Create Milestone";

    }

});

// ======================================
// Refresh Button
// ======================================

refreshMilestones.addEventListener("click", () => {

    loadMilestones();

});

// ======================================
// Helper
// ======================================

function formatCurrency(amount) {

    return "$" + Number(amount || 0).toFixed(2);

}

console.log("✅ Milestone Creation Ready");
// ======================================
// WorkBee Milestone System V2
// Part 3 - Render Milestones
// ======================================

// ======================================
// Render Milestones
// ======================================

function renderMilestones(){

    milestoneContainer.innerHTML = "";

    if(milestones.length === 0){

        milestoneContainer.innerHTML = `

            <div class="empty-state">

                <h2>📅 No Milestones Found</h2>

                <p>

                    Create your first milestone to start managing your project.

                </p>

            </div>

        `;

        return;

    }

    milestones.forEach(item=>{

        milestoneContainer.innerHTML += `

        <div class="milestone-card">

            <div class="milestone-header">

                <div>

                    <h3 class="milestone-title">

                        ${item.title}

                    </h3>

                    <p class="project-id">

                        Project ID : ${item.projectId}

                    </p>

                </div>

                <span class="status ${statusClass(item.status)}">

                    ${item.status}

                </span>

            </div>

            <div class="milestone-body">

                <p class="description">

                    ${item.description}

                </p>

                <div class="details">

                    <div>

                        <strong>Amount</strong>

                        <p>

                            ${formatCurrency(item.amount)}

                        </p>

                    </div>

                    <div>

                        <strong>Due Date</strong>

                        <p>

                            ${formatDate(item.dueDate)}

                        </p>

                    </div>

                    <div>

                        <strong>Progress</strong>

                        <p>

                            ${item.progress || 0}%

                        </p>

                    </div>

                    <div>

                        <strong>Freelancer</strong>

                        <p>

                            ${item.freelancerEmail || "-"}

                        </p>

                    </div>

                </div>

                <div class="progress-wrapper">

                    <div class="progress-bar">

                        <div

                            class="progress-fill"

                            style="width:${item.progress || 0}%">

                        </div>

                    </div>

                </div>

                <div class="milestone-actions">

                    ${actionButtons(item)}

                </div>

            </div>

        </div>

        `;

    });

}

// ======================================
// Status Class
// ======================================

function statusClass(status){

    switch(status){

        case "Pending":

            return "pending";

        case "In Progress":

            return "progress";

        case "Submitted":

            return "submitted";

        case "Completed":

            return "completed";

        case "Released":

            return "released";

        case "Cancelled":

            return "cancelled";

        default:

            return "pending";

    }

}

// ======================================
// Date Formatter
// ======================================

function formatDate(date){

    if(!date) return "-";

    return new Date(date)

    .toLocaleDateString(

        "en-US",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}

console.log("✅ Milestone Rendering Ready");
// ======================================
// WorkBee Milestone System V2
// Part 4 - Milestone Workflow
// ======================================

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Action Buttons
// ======================================

function actionButtons(item){

    switch(item.status){

        case "Pending":

            return `

                <button
                    class="start-btn"
                    onclick="startMilestone('${item.id}')">

                    ▶ Start

                </button>

            `;

        case "In Progress":

            return `

                <button
                    class="submit-btn"
                    onclick="submitMilestone('${item.id}')">

                    📤 Submit

                </button>

            `;

        case "Submitted":

            return `

                <button
                    class="approve-btn"
                    onclick="approveMilestone('${item.id}')">

                    ✅ Approve

                </button>

            `;

        case "Completed":

            return `

                <button
                    class="release-btn"
                    onclick="releaseMilestonePayment('${item.id}')">

                    💰 Release Payment

                </button>

            `;

        default:

            return `

                <span class="status completed">

                    ✔ Finished

                </span>

            `;

    }

}

// ======================================
// Start Milestone
// ======================================

window.startMilestone = async function(id){

    try{

        await updateDoc(

            doc(db,"milestones",id),

            {

                status:"In Progress",

                progress:25,

                updatedAt:serverTimestamp()

            }

        );

        alert("Milestone started.");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Submit Milestone
// ======================================

window.submitMilestone = async function(id){

    try{

        await updateDoc(

            doc(db,"milestones",id),

            {

                status:"Submitted",

                progress:90,

                updatedAt:serverTimestamp()

            }

        );

        alert(

            "Milestone submitted for review."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Approve Milestone
// ======================================

window.approveMilestone = async function(id){

    if(

        !confirm(

            "Approve this milestone?"

        )

    ) return;

    try{

        await updateDoc(

            doc(db,"milestones",id),

            {

                status:"Completed",

                progress:100,

                updatedAt:serverTimestamp()

            }

        );

        alert(

            "Milestone approved successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Release Payment
// ======================================

window.releaseMilestonePayment = async function(id){

    const ok = confirm(

        "Release payment for this milestone?"

    );

    if(!ok) return;

    try{

        await updateDoc(

            doc(db,"milestones",id),

            {

                status:"Released",

                paymentReleased:true,

                releasedAt:serverTimestamp(),

                updatedAt:serverTimestamp()

            }

        );

        alert(

            "Milestone payment released."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

console.log("✅ Milestone Workflow Ready");
// ======================================
// WorkBee Milestone System V2
// Part 5 - Payment Integration
// ======================================

import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Payment Integration
// ======================================

async function syncMilestonePayment(milestoneId){

    try{

        const milestone =
        milestones.find(item=>item.id===milestoneId);

        if(!milestone){

            return;

        }

        // Find Escrow Payment

        const paymentQuery = query(

            collection(db,"payments"),

            where("projectId","==",milestone.projectId),

            where("status","==","Escrow")

        );

        const paymentSnapshot =
        await getDocs(paymentQuery);

        if(paymentSnapshot.empty){

            alert("No escrow payment found.");

            return;

        }

        const paymentDoc =
        paymentSnapshot.docs[0];

        // Update Payment

        await updateDoc(

            doc(db,"payments",paymentDoc.id),

            {

                status:"Completed",

                milestoneId:milestone.id,

                completedAt:serverTimestamp()

            }

        );

        // Update Milestone

        await updateDoc(

            doc(db,"milestones",milestone.id),

            {

                paymentReleased:true,

                paymentId:paymentDoc.id,

                releasedAt:serverTimestamp()

            }

        );

        // Transaction Record

        await addDoc(

            collection(db,"transactions"),

            {

                userId:currentUser.uid,

                paymentId:paymentDoc.id,

                milestoneId:milestone.id,

                projectId:milestone.projectId,

                amount:milestone.amount,

                type:"Milestone Payment",

                status:"Completed",

                createdAt:serverTimestamp()

            }

        );

        // Client Notification

        await addDoc(

            collection(db,"notifications"),

            {

                userId:currentUser.uid,

                title:"Milestone Payment Released",

                message:

                `${milestone.title} payment released successfully.`,

                type:"payment",

                read:false,

                createdAt:serverTimestamp()

            }

        );

        // Freelancer Notification

        if(milestone.freelancerId){

            await addDoc(

                collection(db,"notifications"),

                {

                    userId:milestone.freelancerId,

                    title:"Payment Received",

                    message:

                    `Payment released for "${milestone.title}".`,

                    type:"payment",

                    read:false,

                    createdAt:serverTimestamp()

                }

            );

        }

        alert("Milestone payment released successfully.");

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Override Release Function
// ======================================

window.releaseMilestonePayment = async function(id){

    if(!confirm(

        "Release payment for this milestone?"

    )) return;

    await syncMilestonePayment(id);

};

console.log("✅ Payment Integration Complete");
// ======================================
// WorkBee Milestone System V2
// Part 6 - Production Final
// ======================================

// ======================================
// Search Milestones
// ======================================

const searchInput =
document.getElementById("searchMilestone");

if(searchInput){

    searchInput.addEventListener("input",(e)=>{

        const keyword =
        e.target.value.toLowerCase().trim();

        document.querySelectorAll(".milestone-card")
        .forEach(card=>{

            const text =
            card.innerText.toLowerCase();

            card.style.display =
            text.includes(keyword)
            ? "block"
            : "none";

        });

    });

}

// ======================================
// Delete Milestone
// ======================================

import {

    deleteDoc

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.deleteMilestone = async function(id){

    const ok = confirm(

        "Delete this milestone permanently?"

    );

    if(!ok) return;

    try{

        await deleteDoc(

            doc(db,"milestones",id)

        );

        alert(

            "Milestone deleted successfully."

        );

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};

// ======================================
// Cleanup
// ======================================

function cleanupMilestones(){

    if(unsubscribeMilestones){

        unsubscribeMilestones();

        unsubscribeMilestones = null;

    }

    console.log(

        "Milestone listeners stopped."

    );

}

window.addEventListener(

    "beforeunload",

    cleanupMilestones

);

window.addEventListener(

    "pagehide",

    cleanupMilestones

);

// ======================================
// Connection Status
// ======================================

window.addEventListener("online",()=>{

    console.log(

        "Internet Connected"

    );

    loadMilestones();

});

window.addEventListener("offline",()=>{

    console.log(

        "Internet Disconnected"

    );

});

// ======================================
// Auto Refresh Dashboard
// ======================================

setInterval(()=>{

    updateDashboard();

},30000);

// ======================================
// Export Helpers
// ======================================

window.milestoneHelpers={

    renderMilestones,

    updateDashboard,

    loadMilestones,

    formatCurrency,

    formatDate

};

// ======================================
// Production Logs
// ======================================

console.log("====================================");

console.log("🐝 WorkBee Milestone System");

console.log("Production Build");

console.log("Realtime Firestore Enabled");

console.log("Payment Integration Enabled");

console.log("Notifications Enabled");

console.log("Milestone Workflow Enabled");

console.log("Performance Optimized");

console.log("Version 2.0");

console.log("====================================");