// ======================================
// WorkBee Admin Projects V2
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
    getDocs,
    onSnapshot
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

// Statistics

const totalProjects =
document.getElementById("totalProjects");

const openProjects =
document.getElementById("openProjects");

const completedProjects =
document.getElementById("completedProjects");

const suspendedProjects =
document.getElementById("suspendedProjects");

// Table

const projectsTableBody =
document.getElementById("projectsTableBody");

// Search & Filters

const searchProject =
document.getElementById("searchProject");

const categoryFilter =
document.getElementById("categoryFilter");

const statusFilter =
document.getElementById("statusFilter");

// Buttons

const refreshProjects =
document.getElementById("refreshProjects");

// ======================================
// Variables
// ======================================

let currentAdmin = null;

let projects = [];

let filteredProjects = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentAdmin = user;

    await verifyAdmin();

    initializeProjectsPage();

});

// ======================================
// Verify Admin
// ======================================

async function verifyAdmin(){

    const q = query(

        collection(db,"users"),

        where("email","==",currentAdmin.email),

        where("role","==","admin")

    );

    const snapshot = await getDocs(q);

    if(snapshot.empty){

        alert("Access Denied");

        window.location.href="client-dashboard.html";

        return;

    }

}

// ======================================
// Initialize
// ======================================

function initializeProjectsPage(){

    listenProjects();

    initializeSearch();

    initializeFilters();

    if(refreshProjects){

        refreshProjects.onclick=()=>{

            listenProjects();

        };

    }

}

// ======================================
// Real-time Projects
// ======================================

function listenProjects(){

    onSnapshot(

        collection(db,"projects"),

        snapshot=>{

            projects=[];

            snapshot.forEach(doc=>{

                projects.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            filteredProjects=[...projects];

            updateStatistics();

            renderProjects();

        }

    );

}

// ======================================
// Statistics
// ======================================

function updateStatistics(){

    totalProjects.textContent=

    projects.length;

    openProjects.textContent=

    projects.filter(

        p=>

        p.status==="Open"

    ).length;

    completedProjects.textContent=

    projects.filter(

        p=>

        p.status==="Completed"

    ).length;

    suspendedProjects.textContent=

    projects.filter(

        p=>

        p.status==="Suspended"

    ).length;

}

// ======================================
// Render Table
// ======================================

function renderProjects(){

    projectsTableBody.innerHTML="";

    if(filteredProjects.length===0){

        projectsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

No Projects Found

</td>

</tr>

`;

        return;

    }

    filteredProjects.forEach(project=>{

        projectsTableBody.innerHTML += `

<tr>

<td>${project.id}</td>

<td>${project.title || "-"}</td>

<td>${project.clientName || "-"}</td>

<td>${project.category || "-"}</td>

<td class="project-budget">

$${project.budget || 0}

</td>

<td>

<span class="badge badge-open">

${project.status || "Open"}

</span>

</td>

<td>

${project.createdAt || "-"}

</td>

<td>

<div class="action-group">

<button

class="btn-view"

data-id="${project.id}">

View

</button>

<button

class="btn-feature"

data-id="${project.id}">

Feature

</button>

<button

class="btn-suspend"

data-id="${project.id}">

Suspend

</button>

<button

class="btn-delete"

data-id="${project.id}">

Delete

</button>

</div>

</td>

</tr>

`;

    });

}

// ======================================
// Search
// ======================================

function initializeSearch(){

    searchProject.addEventListener(

        "input",

        applyFilters

    );

}

// ======================================
// Filters
// ======================================

function initializeFilters(){

    categoryFilter.addEventListener(

        "change",

        applyFilters

    );

    statusFilter.addEventListener(

        "change",

        applyFilters

    );

}

// ======================================
// Apply Filters
// ======================================

function applyFilters(){

    const keyword =

    searchProject.value

    .toLowerCase()

    .trim();

    const category =

    categoryFilter.value;

    const status =

    statusFilter.value;

    filteredProjects =

    projects.filter(project=>{

        const matchSearch =

        (project.title || "")

        .toLowerCase()

        .includes(keyword);

        const matchCategory =

        category==="All"

        ||

        project.category===category;

        const matchStatus =

        status==="All"

        ||

        (project.status || "Open")

        ===status;

        return(

            matchSearch &&

            matchCategory &&

            matchStatus

        );

    });

    renderProjects();

}

// ======================================
// Final
// ======================================

console.log(

"✅ Admin Projects Part 1 Loaded"

);
// ======================================
// WorkBee Admin Projects V2
// Part 2 - Pagination & Project Details
// ======================================

// ======================================
// DOM Elements
// ======================================

const projectModal =
document.getElementById("projectModal");

const projectDetails =
document.getElementById("projectDetails");

const closeProjectModal =
document.getElementById("closeProjectModal");

const prevPage =
document.getElementById("prevPage");

const nextPage =
document.getElementById("nextPage");

const pageInfo =
document.getElementById("pageInfo");

// ======================================
// Pagination
// ======================================

let currentPage = 1;

const projectsPerPage = 10;

// ======================================
// Update Render Function
// ======================================

function renderProjects(){

    projectsTableBody.innerHTML="";

    const start =

    (currentPage-1)

    * projectsPerPage;

    const end =

    start + projectsPerPage;

    const pageProjects =

    filteredProjects.slice(

        start,

        end

    );

    if(pageProjects.length===0){

        projectsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

No Projects Found

</td>

</tr>

`;

        updatePagination();

        return;

    }

    pageProjects.forEach(project=>{

        const badgeClass =

        project.status==="Completed"

        ?

        "badge-completed"

        :

        project.status==="Suspended"

        ?

        "badge-suspended"

        :

        project.status==="In Progress"

        ?

        "badge-progress"

        :

        "badge-open";

        projectsTableBody.innerHTML += `

<tr>

<td>${project.id}</td>

<td>

${project.title}

${project.featured ?

'<span class="featured">Featured</span>' : ""}

</td>

<td class="client-name">

${project.clientName || "-"}

</td>

<td>

${project.category || "-"}

</td>

<td class="project-budget">

$${project.budget || 0}

</td>

<td>

<span class="badge ${badgeClass}">

${project.status || "Open"}

</span>

</td>

<td>

${project.createdAt || "-"}

</td>

<td>

<div class="action-group">

<button

class="btn-view"

data-id="${project.id}">

View

</button>

<button

class="btn-feature"

data-id="${project.id}">

Feature

</button>

<button

class="btn-suspend"

data-id="${project.id}">

Suspend

</button>

<button

class="btn-delete"

data-id="${project.id}">

Delete

</button>

</div>

</td>

</tr>

`;

    });

    updatePagination();

    attachButtons();

}

// ======================================
// Pagination
// ======================================

function updatePagination(){

    const totalPages =

    Math.max(

        1,

        Math.ceil(

            filteredProjects.length

            /

            projectsPerPage

        )

    );

    pageInfo.textContent=

    `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled=

    currentPage===1;

    nextPage.disabled=

    currentPage===totalPages;

}

prevPage.onclick=()=>{

    if(currentPage>1){

        currentPage--;

        renderProjects();

    }

};

nextPage.onclick=()=>{

    const totalPages=

    Math.ceil(

        filteredProjects.length

        /

        projectsPerPage

    );

    if(currentPage<totalPages){

        currentPage++;

        renderProjects();

    }

};

// ======================================
// Buttons
// ======================================

function attachButtons(){

document

.querySelectorAll(

".btn-view"

)

.forEach(button=>{

button.onclick=()=>{

showProject(

button.dataset.id

);

};

});

}

// ======================================
// Project Details
// ======================================

function showProject(id){

const project=

projects.find(

p=>p.id===id

);

if(!project)return;

projectDetails.innerHTML=`

<h2>

${project.title}

</h2>

<hr>

<p>

<strong>Client:</strong>

${project.clientName || "-"}

</p>

<p>

<strong>Category:</strong>

${project.category || "-"}

</p>

<p>

<strong>Budget:</strong>

$${project.budget || 0}

</p>

<p>

<strong>Status:</strong>

${project.status || "Open"}

</p>

<p>

<strong>Description:</strong>

</p>

<p>

${project.description || "-"}

</p>

<p>

<strong>Created:</strong>

${project.createdAt || "-"}

</p>

`;

projectModal.classList.remove(

"hidden"

);

}

// ======================================
// Close Modal
// ======================================

closeProjectModal.onclick=()=>{

projectModal.classList.add(

"hidden"

);

};

window.addEventListener(

"click",

(event)=>{

if(event.target===projectModal){

projectModal.classList.add(

"hidden"

);

}

});

// ======================================
// Update Filter
// ======================================

const oldApplyProjectFilters =

applyFilters;

applyFilters=function(){

oldApplyProjectFilters();

currentPage=1;

renderProjects();

};

console.log(

"✅ Admin Projects Part 2 Loaded"

);
// ======================================
// WorkBee Admin Projects V2
// Part 3 - Feature, Suspend & Delete
// ======================================

import {
    doc,
    updateDoc,
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM Elements
// ======================================

const featureModal =
document.getElementById("featureModal");

const suspendModal =
document.getElementById("suspendModal");

const deleteModal =
document.getElementById("deleteModal");

const confirmFeature =
document.getElementById("confirmFeature");

const cancelFeature =
document.getElementById("cancelFeature");

const confirmSuspend =
document.getElementById("confirmSuspend");

const cancelSuspend =
document.getElementById("cancelSuspend");

const confirmDelete =
document.getElementById("confirmDelete");

const cancelDelete =
document.getElementById("cancelDelete");

// ======================================
// Selected Project
// ======================================

let selectedProjectId = null;

// ======================================
// Attach Buttons
// ======================================

function attachButtons(){

    document.querySelectorAll(".btn-view")
    .forEach(button=>{

        button.onclick=()=>{

            showProject(button.dataset.id);

        };

    });

    document.querySelectorAll(".btn-feature")
    .forEach(button=>{

        button.onclick=()=>{

            selectedProjectId = button.dataset.id;

            featureModal.classList.remove("hidden");

        };

    });

    document.querySelectorAll(".btn-suspend")
    .forEach(button=>{

        button.onclick=()=>{

            selectedProjectId = button.dataset.id;

            suspendModal.classList.remove("hidden");

        };

    });

    document.querySelectorAll(".btn-delete")
    .forEach(button=>{

        button.onclick=()=>{

            selectedProjectId = button.dataset.id;

            deleteModal.classList.remove("hidden");

        };

    });

}

// ======================================
// Feature Project
// ======================================

confirmFeature.onclick = async()=>{

    if(!selectedProjectId) return;

    await updateDoc(

        doc(db,"projects",selectedProjectId),

        {

            featured:true

        }

    );

    featureModal.classList.add("hidden");

    selectedProjectId = null;

};

// ======================================
// Suspend Project
// ======================================

confirmSuspend.onclick = async()=>{

    if(!selectedProjectId) return;

    const project = projects.find(

        p=>p.id===selectedProjectId

    );

    const newStatus =

    project.status==="Suspended"

    ?

    "Open"

    :

    "Suspended";

    await updateDoc(

        doc(db,"projects",selectedProjectId),

        {

            status:newStatus

        }

    );

    suspendModal.classList.add("hidden");

    selectedProjectId = null;

};

// ======================================
// Delete Project
// ======================================

confirmDelete.onclick = async()=>{

    if(!selectedProjectId) return;

    await deleteDoc(

        doc(

            db,

            "projects",

            selectedProjectId

        )

    );

    deleteModal.classList.add("hidden");

    selectedProjectId = null;

};

// ======================================
// Cancel Buttons
// ======================================

cancelFeature.onclick=()=>{

    featureModal.classList.add("hidden");

};

cancelSuspend.onclick=()=>{

    suspendModal.classList.add("hidden");

};

cancelDelete.onclick=()=>{

    deleteModal.classList.add("hidden");

};

// ======================================
// Close Modals
// ======================================

window.addEventListener("click",(event)=>{

    if(event.target===featureModal){

        featureModal.classList.add("hidden");

    }

    if(event.target===suspendModal){

        suspendModal.classList.add("hidden");

    }

    if(event.target===deleteModal){

        deleteModal.classList.add("hidden");

    }

});

// ======================================
// Refresh Button
// ======================================

refreshProjects.onclick=()=>{

    listenProjects();

};

// ======================================
// Activity Log Foundation
// ======================================

function logProjectAction(action,id){

    console.log(

        "PROJECT:",

        action,

        id

    );

    // Part 4 mein Firestore
    // activityLogs collection
    // mein save karenge.

}

console.log(

"✅ Admin Projects Part 3 Loaded"

);
// ======================================
// WorkBee Admin Projects V2
// Part 4 - Production Final
// ======================================

import {
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Export Projects CSV
// ======================================

const exportProjects =
document.getElementById("exportProjects");

if(exportProjects){

exportProjects.onclick=()=>{

let csv =

"ID,Title,Client,Category,Budget,Status\n";

projects.forEach(project=>{

csv +=

`${project.id},
${project.title || ""},
${project.clientName || ""},
${project.category || ""},
${project.budget || 0},
${project.status || "Open"}\n`;

});

const blob =

new Blob(

[csv],

{

type:"text/csv"

}

);

const url=

URL.createObjectURL(blob);

const link=

document.createElement("a");

link.href=url;

link.download=

"workbee-projects.csv";

link.click();

};

}

// ======================================
// Firestore Activity Logs
// ======================================

async function logProjectAction(

action,

projectId

){

try{

await addDoc(

collection(

db,

"activityLogs"

),

{

admin:

currentAdmin.email,

action,

projectId,

module:"Projects",

time:

serverTimestamp()

}

);

}catch(error){

console.error(

"Activity Log Error",

error

);

}

}

// ======================================
// Wrap Feature Button
// ======================================

const oldFeatureAction=

confirmFeature.onclick;

confirmFeature.onclick=

async()=>{

await oldFeatureAction();

if(selectedProjectId){

await logProjectAction(

"Feature Project",

selectedProjectId

);

}

};

// ======================================
// Wrap Suspend Button
// ======================================

const oldSuspendAction=

confirmSuspend.onclick;

confirmSuspend.onclick=

async()=>{

await oldSuspendAction();

if(selectedProjectId){

await logProjectAction(

"Suspend Project",

selectedProjectId

);

}

};

// ======================================
// Wrap Delete Button
// ======================================

const oldDeleteAction=

confirmDelete.onclick;

confirmDelete.onclick=

async()=>{

await oldDeleteAction();

if(selectedProjectId){

await logProjectAction(

"Delete Project",

selectedProjectId

);

}

};

// ======================================
// AI Risk Score (Foundation)
// ======================================

function calculateProjectRisk(

project

){

let score = 100;

if(project.reports)

score -=

project.reports * 10;

if(project.disputes)

score -=

project.disputes * 5;

if(project.budget > 10000)

score -= 5;

if(score<0)

score=0;

return score;

}

function getRiskBadge(score){

if(score>=90)

return "🟢 Safe";

if(score>=70)

return "🟡 Medium";

if(score>=40)

return "🟠 Warning";

return "🔴 High Risk";

}

// ======================================
// Loading State
// ======================================

function showLoading(){

projectsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

Loading Projects...

</td>

</tr>

`;

}

// ======================================
// Error State
// ======================================

function showError(message){

projectsTableBody.innerHTML=`

<tr>

<td colspan="8"

class="loading">

${message}

</td>

</tr>

`;

}

// ======================================
// Safe Listener
// ======================================

const oldListenProjects=

listenProjects;

listenProjects=function(){

showLoading();

try{

oldListenProjects();

}catch(error){

console.error(error);

showError(

"Unable to load projects."

);

}

};

// ======================================
// Auto Refresh
// ======================================

setInterval(()=>{

renderProjects();

},30000);

// ======================================
// Dashboard Analytics
// ======================================

function calculateAnalytics(){

const featured =

projects.filter(

p=>p.featured

).length;

const totalBudget =

projects.reduce(

(sum,p)=>

sum+

Number(

p.budget || 0

),

0

);

console.log(

"Featured:",

featured

);

console.log(

"Total Budget:",

totalBudget

);

}

// ======================================
// Run Analytics
// ======================================

const oldStatistics=

updateStatistics;

updateStatistics=function(){

oldStatistics();

calculateAnalytics();

};

// ======================================
// Final
// ======================================

console.log(

"🚀 WorkBee Admin Projects Production Ready"

);