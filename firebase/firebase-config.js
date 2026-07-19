// ======================================
// Firebase SDK
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// ======================================
// Firebase Configuration
// ======================================

const firebaseConfig = {

    apiKey: "AIzaSyBetXK6U4dwy_cS7pUqPhRKGDOLnpCmnwo",

    authDomain: "workbee-1906b.firebaseapp.com",

    projectId: "workbee-1906b",

    storageBucket: "workbee-1906b.firebasestorage.app",

    messagingSenderId: "233147974288",

    appId: "1:233147974288:web:d18588e9befdde68c4ce15",

    measurementId: "G-JPP74GJ4ZP"

};

// ======================================
// Initialize Firebase
// ======================================

const app = initializeApp(firebaseConfig);

// ======================================
// Firebase Services
// ======================================

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

// ======================================
// Export
// ======================================

export {

    auth,

    db,

    storage

};