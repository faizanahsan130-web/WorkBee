// ======================================
// WorkBee Admin - Manage Applications
// ======================================

import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// HTML Elements
// ======================================

const applicationsTable = document.getElementById("applicationsTable");
const searchApplication = document.getElementById("searchApplication");

let allApplications = [];

// ======================================
// Login Check
// ======================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    loadApplications();

});

// ======================================
// Load Applications
// ======================================

async function loadApplications() {

    applicationsTable.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;">
                Loading Applications...
            </td>
        </tr>
    `;

    try {

        const snapshot = await getDocs(collection(db, "applications"));

        allApplications = [];

        applicationsTable.innerHTML = "";

        if (snapshot.empty) {

            applicationsTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No Applications Found
                    </td>
                </tr>
            `;

            return;

        }

        snapshot.forEach((applicationDoc) => {

            const application = applicationDoc.data();

            application.id = applicationDoc.id;

            allApplications.push(application);

        });

        renderApplications(allApplications);

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// ======================================
// Render Applications
// ======================================

function renderApplications(applications) {

    applicationsTable.innerHTML = "";

    applications.forEach(application => {

        const status = application.status || "Pending";

        let statusClass = "status-pending";

        if (status === "Approved") {

            statusClass = "status-approved";

        }

        if (status === "Rejected") {

            statusClass = "status-rejected";

        }

        applicationsTable.innerHTML += `

        <tr>

            <td>${application.projectTitle || "-"}</td>

            <td>${application.freelancerEmail || "-"}</td>

            <td>$${application.bid || 0}</td>

            <td>${application.deliveryDays || 0} Days</td>

            <td>
                <span class="${statusClass}">
                    ${status}
                </span>
            </td>

            <td>

                <button
                    class="action-btn view-btn"
                    onclick="viewApplication('${application.id}')">

                    View

                </button>

                <button
                    class="action-btn approve-btn"
                    onclick="approveApplication('${application.id}')">

                    Approve

                </button>

                <button
                    class="action-btn reject-btn"
                    onclick="rejectApplication('${application.id}')">

                    Reject

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteApplication('${application.id}')">

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

searchApplication.addEventListener("input", () => {

    const value = searchApplication.value.toLowerCase();

    const filtered = allApplications.filter(application =>

        (application.projectTitle || "")
        .toLowerCase()
        .includes(value)

        ||

        (application.freelancerEmail || "")
        .toLowerCase()
        .includes(value)

    );

    renderApplications(filtered);

});

// ======================================
// View Application
// ======================================

window.viewApplication = function(id) {

    const application = allApplications.find(a => a.id === id);

    if (!application) return;

    alert(

`Project:
${application.projectTitle}

Freelancer:
${application.freelancerEmail}

Bid:
$${application.bid}

Delivery:
${application.deliveryDays} Days

Proposal:

${application.proposal}

Status:
${application.status || "Pending"}`

    );

};

// ======================================
// Approve
// ======================================

window.approveApplication = async function(id) {

    try {

        await updateDoc(doc(db, "applications", id), {

            status: "Approved"

        });

        alert("✅ Application Approved");

        loadApplications();

    } catch (error) {

        alert(error.message);

    }

};

// ======================================
// Reject
// ======================================

window.rejectApplication = async function(id) {

    try {

        await updateDoc(doc(db, "applications", id), {

            status: "Rejected"

        });

        alert("❌ Application Rejected");

        loadApplications();

    } catch (error) {

        alert(error.message);

    }

};

// ======================================
// Delete
// ======================================

window.deleteApplication = async function(id) {

    const ok = confirm("Delete this application?");

    if (!ok) return;

    try {

        await deleteDoc(doc(db, "applications", id));

        alert("🗑️ Application Deleted");

        loadApplications();

    } catch (error) {

        alert(error.message);

    }

};