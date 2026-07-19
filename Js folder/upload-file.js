// ======================================
// WorkBee - Upload Files
// ======================================

import { auth, db, storage } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ======================================
// Elements
// ======================================

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("file");
const typeInput = document.getElementById("type");

const progressBox = document.getElementById("progressBox");
const progressText = document.getElementById("progressText");

const filesContainer = document.getElementById("filesContainer");

// Create Progress Bar
progressBox.innerHTML = `
    <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
    </div>
    <p id="progressText">0%</p>
`;

const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressText");

let currentUser = null;

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

    loadFiles();

});

// ======================================
// Upload File
// ======================================

uploadForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file = fileInput.files[0];

    if (!file) {

        alert("Please choose a file.");

        return;

    }

    progressBox.style.display = "block";

    const storageRef = ref(
        storage,
        `uploads/${currentUser.uid}/${Date.now()}_${file.name}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(

        "state_changed",

        (snapshot) => {

            const percent = Math.round(

                (snapshot.bytesTransferred / snapshot.totalBytes) * 100

            );

            progressFill.style.width = percent + "%";

            progressLabel.textContent = percent + "% Uploaded";

        },

        (error) => {

            console.error(error);

            alert(error.message);

        },

        async () => {

            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await addDoc(collection(db, "files"), {

                userId: currentUser.uid,

                userEmail: currentUser.email,

                type: typeInput.value,

                fileName: file.name,

                fileSize: file.size,

                fileType: file.type,

                storagePath: uploadTask.snapshot.ref.fullPath,

                downloadURL: downloadURL,

                createdAt: serverTimestamp()

            });

            alert("✅ File Uploaded Successfully");

            uploadForm.reset();

            progressFill.style.width = "0%";

            progressLabel.textContent = "0%";

            loadFiles();

        }

    );

});

// ======================================
// Load Files
// ======================================

async function loadFiles() {

    filesContainer.innerHTML = "Loading...";

    const q = query(
        collection(db, "files"),
        where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    filesContainer.innerHTML = "";

    if (snapshot.empty) {

        filesContainer.innerHTML = "<p>No files uploaded.</p>";

        return;

    }

    snapshot.forEach((fileDoc) => {

        const file = fileDoc.data();

        const card = document.createElement("div");

        card.className = "file-card";

        card.innerHTML = `

            <h3>${file.fileName}</h3>

            <p><strong>Type:</strong> ${file.type}</p>

            <p><strong>Size:</strong> ${(file.fileSize/1024).toFixed(1)} KB</p>

            <div class="file-actions">

                <a
                    href="${file.downloadURL}"
                    target="_blank"
                    class="download-btn">

                    Download

                </a>

                <button
                    class="delete-btn"
                    data-id="${fileDoc.id}"
                    data-path="${file.storagePath}">

                    Delete

                </button>

            </div>

        `;

        filesContainer.appendChild(card);

    });

    // Delete Events

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", async () => {

            const ok = confirm("Delete this file?");

            if (!ok) return;

            try {

                const storageRef = ref(storage, btn.dataset.path);

                await deleteObject(storageRef);

                await deleteDoc(doc(db, "files", btn.dataset.id));

                loadFiles();

            }

            catch (error) {

                console.error(error);

                alert(error.message);

            }

        });

    });

}