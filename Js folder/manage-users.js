// ======================================
// WorkBee Admin - Manage Users
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const usersTable = document.getElementById("usersTable");
const searchUser = document.getElementById("searchUser");

let allUsers = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadUsers();

});

// ======================================
// Load Users
// ======================================

async function loadUsers() {

    usersTable.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Loading Users...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "users"));

        allUsers = [];

        usersTable.innerHTML = "";

        if (snapshot.empty) {

            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No Users Found
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((userDoc) => {

            const user = userDoc.data();

            user.id = userDoc.id;

            allUsers.push(user);

        });

        renderUsers(allUsers);

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Users
// ======================================

function renderUsers(users){

    usersTable.innerHTML = "";

    users.forEach(user => {

        usersTable.innerHTML += `

        <tr>

            <td>${user.fullName || "-"}</td>

            <td>${user.email || "-"}</td>

            <td>${user.role || "User"}</td>

            <td>

                <span class="status-active">

                    ${user.status || "Active"}

                </span>

            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewUser('${user.id}')">

                    View

                </button>

                <button
                    class="action-btn block-btn"
                    onclick="blockUser('${user.id}')">

                    Block

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteUser('${user.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================
// Search
// ======================================

searchUser.addEventListener("input", () => {

    const value = searchUser.value.toLowerCase();

    const filtered = allUsers.filter(user =>

        (user.fullName || "")
        .toLowerCase()
        .includes(value)

        ||

        (user.email || "")
        .toLowerCase()
        .includes(value)

    );

    renderUsers(filtered);

});

// ======================================
// View User
// ======================================

window.viewUser = function(id){

    const user = allUsers.find(u => u.id === id);

    if(!user) return;

    alert(

`Name : ${user.fullName || "-"}

Email : ${user.email || "-"}

Role : ${user.role || "User"}

Status : ${user.status || "Active"}`

    );

};

// ======================================
// Block User
// ======================================

window.blockUser = function(id){

    alert("Block/Unblock feature will be connected with Firestore in the next update.");

};

// ======================================
// Delete User
// ======================================

window.deleteUser = async function(id){

    const ok = confirm("Delete this user?");

    if(!ok) return;

    try{

        await deleteDoc(doc(db,"users",id));

        alert("User Deleted Successfully.");

        loadUsers();

    }

    catch(error){

        console.error(error);

        alert(error.message);

    }

};