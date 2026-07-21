// ======================================
// WorkBee Admin Users V2
// Part 1 - Foundation
// ======================================

// ======================================
// Firebase Imports
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

const usersTableBody =
document.getElementById("usersTableBody");

const totalUsers =
document.getElementById("totalUsers");

const totalFreelancers =
document.getElementById("totalFreelancers");

const totalClients =
document.getElementById("totalClients");

const totalBanned =
document.getElementById("totalBanned");

const searchUser =
document.getElementById("searchUser");

const roleFilter =
document.getElementById("roleFilter");

const statusFilter =
document.getElementById("statusFilter");

// ======================================
// Variables
// ======================================

let currentAdmin = null;

let users = [];

let filteredUsers = [];

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

    initializeUsersPage();

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

function initializeUsersPage(){

    listenUsers();

    initializeSearch();

    initializeFilters();

}

// ======================================
// Listen Users
// ======================================

function listenUsers(){

    onSnapshot(

        collection(db,"users"),

        snapshot=>{

            users=[];

            snapshot.forEach(doc=>{

                users.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            filteredUsers=[...users];

            updateStatistics();

            renderUsers();

        }

    );

}

// ======================================
// Statistics
// ======================================

function updateStatistics(){

    totalUsers.textContent =
    users.length;

    totalFreelancers.textContent =

    users.filter(

        user=>user.role==="freelancer"

    ).length;

    totalClients.textContent =

    users.filter(

        user=>user.role==="client"

    ).length;

    totalBanned.textContent =

    users.filter(

        user=>user.status==="Banned"

    ).length;

}

// ======================================
// Render Users
// ======================================

function renderUsers(){

    usersTableBody.innerHTML="";

    if(filteredUsers.length===0){

        usersTableBody.innerHTML=`

        <tr>

            <td colspan="7"

            class="loading">

            No Users Found

            </td>

        </tr>

        `;

        return;

    }

    filteredUsers.forEach(user=>{

        usersTableBody.innerHTML += `

        <tr>

            <td>

                <img

                class="user-avatar"

                src="${
                    user.photoURL ||

                    "assets/default-avatar.png"

                }">

            </td>

            <td>

                ${

                    user.fullName ||

                    "Unknown"

                }

            </td>

            <td>

                ${

                    user.email

                }

            </td>

            <td>

                ${

                    user.role ||

                    "User"

                }

            </td>

            <td>

                ${

                    user.status ||

                    "Active"

                }

            </td>

            <td>

                ${

                    user.createdAt ||

                    "-"

                }

            </td>

            <td>

                <button

                class="btn btn-view"

                data-id="${user.id}">

                View

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

function initializeSearch(){

    searchUser.addEventListener(

        "input",

        ()=>{

            applyFilters();

        }

    );

}

// ======================================
// Filters
// ======================================

function initializeFilters(){

    roleFilter.addEventListener(

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

    searchUser.value

    .toLowerCase()

    .trim();

    const role =

    roleFilter.value;

    const status =

    statusFilter.value;

    filteredUsers = users.filter(user=>{

        const matchSearch =

        (user.fullName || "")

        .toLowerCase()

        .includes(keyword)

        ||

        (user.email || "")

        .toLowerCase()

        .includes(keyword);

        const matchRole =

        role==="All"

        ||

        user.role===role;

        const matchStatus =

        status==="All"

        ||

        (user.status || "Active")

        ===status;

        return(

            matchSearch &&

            matchRole &&

            matchStatus

        );

    });

    renderUsers();

}

console.log(
"✅ Admin Users Part 1 Loaded"
);
// ======================================
// WorkBee Admin Users V2
// Part 2 - User Details & Pagination
// ======================================

// ======================================
// DOM Elements
// ======================================

const userModal =
document.getElementById("userModal");

const userDetails =
document.getElementById("userDetails");

const closeUserModal =
document.getElementById("closeUserModal");

const prevPage =
document.getElementById("prevPage");

const nextPage =
document.getElementById("nextPage");

const pageInfo =
document.getElementById("pageInfo");

const refreshUsers =
document.getElementById("refreshUsers");

// ======================================
// Pagination Variables
// ======================================

let currentPage = 1;

const usersPerPage = 10;

// ======================================
// Update Render Function
// ======================================

function renderUsers(){

    usersTableBody.innerHTML="";

    const start =

    (currentPage-1)

    * usersPerPage;

    const end =

    start + usersPerPage;

    const pageUsers =

    filteredUsers.slice(

        start,

        end

    );

    if(pageUsers.length===0){

        usersTableBody.innerHTML=`

        <tr>

            <td colspan="7"

            class="loading">

            No Users Found

            </td>

        </tr>

        `;

        updatePagination();

        return;

    }

    pageUsers.forEach(user=>{

        usersTableBody.innerHTML += `

<tr>

<td>

<img
class="user-avatar"
src="${user.photoURL || "assets/default-avatar.png"}">

</td>

<td>

${user.fullName || "Unknown"}

</td>

<td>

${user.email}

</td>

<td>

${user.role || "User"}

</td>

<td>

${user.status || "Active"}

</td>

<td>

${user.createdAt || "-"}

</td>

<td>

<div class="action-group">

<button
class="btn btn-view"
data-id="${user.id}">

View

</button>

</div>

</td>

</tr>

`;

    });

    updatePagination();

    attachViewButtons();

}

// ======================================
// Pagination
// ======================================

function updatePagination(){

    const totalPages =

    Math.max(

        1,

        Math.ceil(

            filteredUsers.length

            /

            usersPerPage

        )

    );

    pageInfo.textContent =

    `Page ${currentPage} of ${totalPages}`;

    prevPage.disabled =

    currentPage===1;

    nextPage.disabled =

    currentPage===totalPages;

}

prevPage.addEventListener(

"click",

()=>{

if(currentPage>1){

currentPage--;

renderUsers();

}

}

);

nextPage.addEventListener(

"click",

()=>{

const totalPages=

Math.ceil(

filteredUsers.length

/

usersPerPage

);

if(currentPage<totalPages){

currentPage++;

renderUsers();

}

}

);

// ======================================
// View User
// ======================================

function attachViewButtons(){

document

.querySelectorAll(

".btn-view"

)

.forEach(button=>{

button.onclick=()=>{

const id=

button.dataset.id;

showUser(id);

};

});

}

// ======================================
// Show User
// ======================================

function showUser(id){

const user=

users.find(

u=>u.id===id

);

if(!user)return;

userDetails.innerHTML=`

<h3>

${user.fullName || "Unknown"}

</h3>

<hr>

<p>

<strong>Email:</strong>

${user.email}

</p>

<p>

<strong>Role:</strong>

${user.role}

</p>

<p>

<strong>Status:</strong>

${user.status || "Active"}

</p>

<p>

<strong>Phone:</strong>

${user.phone || "-"}

</p>

<p>

<strong>Country:</strong>

${user.country || "-"}

</p>

<p>

<strong>City:</strong>

${user.city || "-"}

</p>

<p>

<strong>Joined:</strong>

${user.createdAt || "-"}

</p>

`;

userModal.classList.remove(

"hidden"

);

}

// ======================================
// Close Modal
// ======================================

closeUserModal.onclick=()=>{

userModal.classList.add(

"hidden"

);

};

window.onclick=(event)=>{

if(event.target===userModal){

userModal.classList.add(

"hidden"

);

}

};

// ======================================
// Refresh
// ======================================

refreshUsers.onclick=()=>{

listenUsers();

};

// ======================================
// Update Filter
// ======================================

const oldApplyFilters = applyFilters;

applyFilters = function(){

oldApplyFilters();

currentPage=1;

renderUsers();

};

console.log(

"✅ Admin Users Part 2 Loaded"

);
// ======================================
// WorkBee Admin Users V2
// Part 3 - Edit, Ban & Delete
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

const deleteModal =
document.getElementById("deleteModal");

const banModal =
document.getElementById("banModal");

const confirmDelete =
document.getElementById("confirmDelete");

const cancelDelete =
document.getElementById("cancelDelete");

const confirmBan =
document.getElementById("confirmBan");

const cancelBan =
document.getElementById("cancelBan");

// ======================================
// Selected User
// ======================================

let selectedUserId = null;

// ======================================
// Update Render Buttons
// ======================================

// renderUsers() ke andar Action Group ko
// is code se replace kar dein:

/*
<div class="action-group">

<button
class="btn btn-view"
data-id="${user.id}">
View
</button>

<button
class="btn btn-ban"
data-id="${user.id}">
${user.status==="Banned" ? "Unban" : "Ban"}
</button>

<button
class="btn btn-delete"
data-id="${user.id}">
Delete
</button>

</div>
*/

// ======================================
// Attach Buttons
// ======================================

function attachViewButtons(){

    document.querySelectorAll(".btn-view")
    .forEach(button=>{

        button.onclick=()=>{

            showUser(button.dataset.id);

        };

    });

    document.querySelectorAll(".btn-ban")
    .forEach(button=>{

        button.onclick=()=>{

            selectedUserId = button.dataset.id;

            banModal.classList.remove("hidden");

        };

    });

    document.querySelectorAll(".btn-delete")
    .forEach(button=>{

        button.onclick=()=>{

            selectedUserId = button.dataset.id;

            deleteModal.classList.remove("hidden");

        };

    });

}

// ======================================
// Ban / Unban
// ======================================

confirmBan.onclick = async()=>{

    if(!selectedUserId) return;

    const user = users.find(

        u=>u.id===selectedUserId

    );

    const newStatus =

    user.status==="Banned"

    ?

    "Active"

    :

    "Banned";

    await updateDoc(

        doc(db,"users",selectedUserId),

        {

            status:newStatus

        }

    );

    banModal.classList.add(

        "hidden"

    );

    selectedUserId = null;

};

cancelBan.onclick=()=>{

    banModal.classList.add(

        "hidden"

    );

};

// ======================================
// Delete User
// ======================================

confirmDelete.onclick = async()=>{

    if(!selectedUserId) return;

    await deleteDoc(

        doc(

            db,

            "users",

            selectedUserId

        )

    );

    deleteModal.classList.add(

        "hidden"

    );

    selectedUserId=null;

};

cancelDelete.onclick=()=>{

    deleteModal.classList.add(

        "hidden"

    );

};

// ======================================
// Close Modals
// ======================================

window.addEventListener(

"click",

(event)=>{

if(event.target===deleteModal){

deleteModal.classList.add(

"hidden"

);

}

if(event.target===banModal){

banModal.classList.add(

"hidden"

);

}

});

// ======================================
// Activity Log
// ======================================

function logAdminAction(action,userId){

    console.log(

        "ADMIN:",

        action,

        userId

    );

    // Part 4 mein Firestore
    // activityLogs collection mein
    // save karenge.

}

console.log(
"✅ Admin Users Part 3 Loaded"
);
// ======================================
// WorkBee Admin Users V2
// Part 4 - Production Final
// ======================================

import {
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Export CSV
// ======================================

const exportUsers =
document.getElementById("exportUsers");

if(exportUsers){

exportUsers.onclick=()=>{

    let csv =

    "Name,Email,Role,Status\n";

    users.forEach(user=>{

        csv +=

`${user.fullName || ""},
${user.email || ""},
${user.role || ""},
${user.status || "Active"}\n`;

    });

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

    "workbee-users.csv";

    link.click();

};

}

// ======================================
// Activity Logs
// ======================================

async function logAdminAction(

action,

targetUser

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

targetUser,

time:

serverTimestamp()

}

);

}catch(error){

console.error(error);

}

}

// ======================================
// Update Ban
// ======================================

const oldBan=

confirmBan.onclick;

confirmBan.onclick=

async()=>{

await oldBan();

if(selectedUserId){

await logAdminAction(

"Ban/Unban",

selectedUserId

);

}

};

// ======================================
// Update Delete
// ======================================

const oldDelete=

confirmDelete.onclick;

confirmDelete.onclick=

async()=>{

await oldDelete();

if(selectedUserId){

await logAdminAction(

"Delete",

selectedUserId

);

}

};

// ======================================
// AI Trust Score
// ======================================

function calculateTrust(user){

let score = 100;

if(user.status==="Banned")

score -= 50;

if(user.role==="client")

score -= 0;

if(user.disputes)

score -= user.disputes * 5;

if(user.reports)

score -= user.reports * 10;

if(score<0)

score=0;

return score;

}

// ======================================
// Badge
// ======================================

function getTrustBadge(score){

if(score>=90)

return "🟢 Trusted";

if(score>=70)

return "🟡 Good";

if(score>=40)

return "🟠 Risk";

return "🔴 High Risk";

}

// ======================================
// Loading
// ======================================

function showLoading(){

usersTableBody.innerHTML=`

<tr>

<td colspan="7"

class="loading">

Loading Users...

</td>

</tr>

`;

}

// ======================================
// Error
// ======================================

function showError(message){

usersTableBody.innerHTML=`

<tr>

<td colspan="7"

class="loading">

${message}

</td>

</tr>

`;

}

// ======================================
// Safe Listener
// ======================================

const oldListenUsers=

listenUsers;

listenUsers=function(){

showLoading();

try{

oldListenUsers();

}catch(error){

console.error(error);

showError(

"Unable to load users."

);

}

};

// ======================================
// Dashboard Refresh
// ======================================

setInterval(()=>{

renderUsers();

},30000);

// ======================================
// Final
// ======================================

console.log(

"🚀 WorkBee Admin Users Production Ready"

);