// ======================================
// WorkBee Browse Projects V2
// Part 1 - Complete Replacement
// ======================================

// Firebase
import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// DOM
// ======================================

const featuredProjectsGrid =
document.getElementById("featuredProjectsGrid");

const projectsGrid =
document.getElementById("projectsGrid");

const totalProjects =
document.getElementById("totalProjects");

const openProjects =
document.getElementById("openProjects");

const appliedProjects =
document.getElementById("appliedProjects");

const savedProjects =
document.getElementById("savedProjects");

const loadingProjects =
document.getElementById("loadingProjects");

const emptyProjects =
document.getElementById("emptyProjects");

const refreshProjects =
document.getElementById("refreshProjects");

const searchProject =
document.getElementById("searchProject");

const categoryFilter =
document.getElementById("categoryFilter");

const budgetFilter =
document.getElementById("budgetFilter");

const experienceFilter =
document.getElementById("experienceFilter");

// ======================================
// Variables
// ======================================

let currentUser = null;

let allProjects = [];

let filteredProjects = [];

let saved = [];

let applied = [];

// ======================================
// Authentication
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    currentUser = user;

    initializeProjects();

});

// ======================================
// Initialize
// ======================================

async function initializeProjects(){

    showLoader();

    loadFeaturedProjects();

    loadProjects();

    registerFilters();

    console.log("📂 Browse Projects Ready");

}

// ======================================
// Loader
// ======================================

function showLoader(){

    loadingProjects.classList.remove("hidden");

    emptyProjects.classList.add("hidden");

}

function hideLoader(){

    loadingProjects.classList.add("hidden");

}

// ======================================
// Featured Projects
// ======================================

function loadFeaturedProjects(){

    const q = query(

        collection(db,"projects"),

        where("featured","==",true),

        limit(6)

    );

    onSnapshot(q,(snapshot)=>{

        featuredProjectsGrid.innerHTML="";

        snapshot.forEach(doc=>{

            renderFeaturedProject({

                id:doc.id,

                ...doc.data()

            });

        });

    });

}

// ======================================
// Load Projects
// ======================================

async function loadProjects(){

    const q = query(

        collection(db,"projects"),

        orderBy("createdAt","desc")

    );

    onSnapshot(q,(snapshot)=>{

        allProjects=[];

        projectsGrid.innerHTML="";

        snapshot.forEach(doc=>{

            allProjects.push({

                id:doc.id,

                ...doc.data()

            });

        });

        filteredProjects=[...allProjects];

        renderProjects();

        updateStatistics();

        hideLoader();

    });

}

// ======================================
// Statistics
// ======================================

function updateStatistics(){

    totalProjects.textContent =
    allProjects.length;

    openProjects.textContent =
    allProjects.filter(

        p=>p.status==="open"

    ).length;

    appliedProjects.textContent =
    applied.length;

    savedProjects.textContent =
    saved.length;

}
// ======================================
// WorkBee Browse Projects V2
// Part 2 - Rendering & Filters
// ======================================

// ======================================
// Render All Projects
// ======================================

function renderProjects(){

    projectsGrid.innerHTML="";

    if(filteredProjects.length===0){

        emptyProjects.classList.remove("hidden");

        return;

    }

    emptyProjects.classList.add("hidden");

    filteredProjects.forEach(project=>{

        renderProjectCard(project);

    });

}

// ======================================
// Featured Card
// ======================================

function renderFeaturedProject(project){

    featuredProjectsGrid.innerHTML += `

    <div class="project-card featured">

        <h3>${project.title}</h3>

        <p>${project.description.substring(0,120)}...</p>

        <div class="project-meta">

            <span>${project.category}</span>

            <span>$${project.budget}</span>

        </div>

        <div class="project-footer">

            <div class="project-budget">

                $${project.budget}

            </div>

            <button onclick="openProject('${project.id}')">

                View

            </button>

        </div>

    </div>

    `;

}

// ======================================
// Project Card
// ======================================

function renderProjectCard(project){

    const savedProject =

    saved.includes(project.id);

    projectsGrid.innerHTML += `

    <div class="project-card">

        <h3>${project.title}</h3>

        <p>

        ${project.description.substring(0,140)}...

        </p>

        <div class="project-meta">

            <span>${project.category}</span>

            <span>${project.level}</span>

            <span>$${project.budget}</span>

        </div>

        <div class="skills-container">

            ${(project.skills || []).map(skill=>

                `<span>${skill}</span>`

            ).join("")}

        </div>

        <div class="project-footer">

            <div class="project-budget">

                $${project.budget}

            </div>

            <div>

                <button

                onclick="saveProject('${project.id}')">

                ${savedProject ? "❤️ Saved" : "🤍 Save"}

                </button>

                <button

                onclick="openProject('${project.id}')">

                Apply

                </button>

            </div>

        </div>

    </div>

    `;

}

// ======================================
// Search
// ======================================

searchProject.addEventListener(

"input",

applyFilters

);

// ======================================
// Filters
// ======================================

categoryFilter.addEventListener(

"change",

applyFilters

);

budgetFilter.addEventListener(

"change",

applyFilters

);

experienceFilter.addEventListener(

"change",

applyFilters

);

// ======================================
// Apply Filters
// ======================================

function applyFilters(){

    const keyword=

    searchProject.value.toLowerCase();

    const category=

    categoryFilter.value;

    const budget=

    budgetFilter.value;

    const level=

    experienceFilter.value;

    filteredProjects=

    allProjects.filter(project=>{

        const matchKeyword=

        project.title.toLowerCase().includes(keyword)

        ||

        project.description.toLowerCase().includes(keyword);

        const matchCategory=

        category==="all"

        ||

        project.category===category;

        const matchLevel=

        level==="all"

        ||

        project.level===level;

        let matchBudget=true;

        if(budget!=="all"){

            const amount=

            Number(project.budget);

            if(budget==="0-100")

            matchBudget=

            amount<=100;

            if(budget==="100-500")

            matchBudget=

            amount>100 && amount<=500;

            if(budget==="500-1000")

            matchBudget=

            amount>500 && amount<=1000;

            if(budget==="1000+")

            matchBudget=

            amount>1000;

        }

        return(

            matchKeyword

            &&

            matchCategory

            &&

            matchLevel

            &&

            matchBudget

        );

    });

    renderProjects();

}

// ======================================
// Register
// ======================================

function registerFilters(){

    refreshProjects.addEventListener(

    "click",

    ()=>{

        loadProjects();

    });

}

console.log("📂 Browse Projects Part 2 Loaded");
// ======================================
// WorkBee Browse Projects V2
// Part 3 - Save, Apply & Project Modal
// ======================================

import {
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Modal Elements
// ======================================

const projectModal =
document.getElementById("projectModal");

const closeProjectModal =
document.getElementById("closeProjectModal");

const modalProjectTitle =
document.getElementById("modalProjectTitle");

const modalCategory =
document.getElementById("modalCategory");

const modalBudget =
document.getElementById("modalBudget");

const modalLevel =
document.getElementById("modalLevel");

const modalDescription =
document.getElementById("modalDescription");

const modalSkills =
document.getElementById("modalSkills");

const clientName =
document.getElementById("clientName");

const clientCountry =
document.getElementById("clientCountry");

const clientRating =
document.getElementById("clientRating");

const saveProjectBtn =
document.getElementById("saveProjectBtn");

const applyProjectBtn =
document.getElementById("applyProjectBtn");

let selectedProject = null;

// ======================================
// Open Project
// ======================================

window.openProject = async function(projectId){

    const project = allProjects.find(
        p => p.id === projectId
    );

    if(!project) return;

    selectedProject = project;

    modalProjectTitle.textContent =
    project.title;

    modalCategory.textContent =
    project.category;

    modalBudget.textContent =
    "$" + project.budget;

    modalLevel.textContent =
    project.level;

    modalDescription.textContent =
    project.description;

    modalSkills.innerHTML = "";

    (project.skills || []).forEach(skill=>{

        modalSkills.innerHTML +=
        `<span>${skill}</span>`;

    });

    await loadClient(project.clientId);

    projectModal.classList.remove("hidden");

};

// ======================================
// Close Modal
// ======================================

closeProjectModal.onclick = ()=>{

    projectModal.classList.add("hidden");

};

window.onclick = (event)=>{

    if(event.target===projectModal){

        projectModal.classList.add("hidden");

    }

};

// ======================================
// Client Profile
// ======================================

async function loadClient(clientId){

    if(!clientId) return;

    try{

        const ref = doc(
            db,
            "users",
            clientId
        );

        const snap = await getDoc(ref);

        if(!snap.exists()) return;

        const client = snap.data();

        clientName.textContent =
        client.fullName || "Unknown";

        clientCountry.textContent =
        client.country || "-";

        clientRating.textContent =
        "⭐ " + (client.rating || "0.0");

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Save Project
// ======================================

window.saveProject = async function(projectId){

    if(saved.includes(projectId)){

        alert("Project already saved.");

        return;

    }

    try{

        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "savedProjects",
                projectId
            ),

            {

                projectId,

                savedAt:
                serverTimestamp()

            }

        );

        saved.push(projectId);

        renderProjects();

        updateStatistics();

        alert("Project saved.");

    }

    catch(error){

        console.error(error);

        alert("Unable to save project.");

    }

};

// ======================================
// Apply Project
// ======================================

applyProjectBtn.onclick = async()=>{

    if(!selectedProject) return;

    try{

        await addDoc(

            collection(
                db,
                "applications"
            ),

            {

                projectId:
                selectedProject.id,

                freelancerId:
                currentUser.uid,

                clientId:
                selectedProject.clientId,

                status:"pending",

                appliedAt:
                serverTimestamp()

            }

        );

        applied.push(
            selectedProject.id
        );

        updateStatistics();

        alert(
            "Application submitted successfully."
        );

        projectModal.classList.add("hidden");

    }

    catch(error){

        console.error(error);

        alert(
            "Unable to apply."
        );

    }

};

// ======================================

console.log(
"📂 Browse Projects Part 3 Loaded"
);
// ======================================
// WorkBee Browse Projects V2
// Part 4 - Production Final
// ======================================

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Load Saved Projects
// ======================================

async function loadSavedProjects(){

    try{

        const snapshot = await getDocs(

            collection(
                db,
                "users",
                currentUser.uid,
                "savedProjects"
            )

        );

        saved = [];

        snapshot.forEach(doc=>{

            saved.push(doc.id);

        });

        renderProjects();

        updateStatistics();

    }

    catch(error){

        console.error(error);

    }

}

// ======================================
// Duplicate Apply Protection
// ======================================

function alreadyApplied(projectId){

    return applied.includes(projectId);

}

// Upgrade Apply Button

const originalApply = applyProjectBtn.onclick;

applyProjectBtn.onclick = async()=>{

    if(!selectedProject) return;

    if(alreadyApplied(selectedProject.id)){

        alert(

            "You have already applied to this project."

        );

        return;

    }

    await originalApply();

};

// ======================================
// AI Recommendation
// ======================================

function recommendProjects(){

    return allProjects

    .filter(project=>{

        return project.status==="open";

    })

    .sort((a,b)=>{

        return Number(b.budget)-Number(a.budget);

    })

    .slice(0,5);

}

// ======================================
// Refresh Recommendations
// ======================================

function showRecommendations(){

    const recommendations =

    recommendProjects();

    console.table(

        recommendations

    );

}

// ======================================
// Export Saved Projects
// ======================================

window.exportSavedProjects = function(){

    const rows = [];

    rows.push([

        "Project Title",

        "Budget",

        "Category"

    ]);

    allProjects

    .filter(project=>

        saved.includes(project.id)

    )

    .forEach(project=>{

        rows.push([

            project.title,

            project.budget,

            project.category

        ]);

    });

    const csv = rows

    .map(r=>r.join(","))

    .join("\n");

    const blob = new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );

    const url =

    URL.createObjectURL(blob);

    const link =

    document.createElement("a");

    link.href = url;

    link.download =

    "saved-projects.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

};

// ======================================
// Safe Async
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
// Visibility
// ======================================

window.addEventListener(

"visibilitychange",

()=>{

    if(document.hidden){

        console.log(

            "Projects paused."

        );

    }

    else{

        loadSavedProjects();

        showRecommendations();

    }

});

// ======================================
// Refresh
// ======================================

window.refreshBrowseProjects = ()=>{

    loadProjects();

    loadSavedProjects();

};

// ======================================
// Cleanup
// ======================================

window.addEventListener(

"beforeunload",

()=>{

    allProjects.length = 0;

    filteredProjects.length = 0;

    saved.length = 0;

    applied.length = 0;

});

// ======================================
// Initialize Extra Features
// ======================================

loadSavedProjects();

showRecommendations();

// ======================================
// Production Ready
// ======================================

console.log(

"🚀 WorkBee Browse Projects Production Ready"

);