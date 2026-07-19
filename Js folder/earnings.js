import { auth, db } from "../firebase/firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const totalEarnings = document.getElementById("totalEarnings");
const availableBalance = document.getElementById("availableBalance");
const pendingBalance = document.getElementById("pendingBalance");
const paymentHistory = document.getElementById("paymentHistory");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  let total = 0;
  let available = 0;
  let pending = 0;

  paymentHistory.innerHTML = "";

  const q = query(
    collection(db, "payments"),
    where("freelancerId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {

    const payment = doc.data();

    total += payment.amount;

    if (payment.status === "available") {
      available += payment.amount;
    }

    if (payment.status === "pending") {
      pending += payment.amount;
    }

    paymentHistory.innerHTML += `
      <tr>
          <td>${payment.projectTitle}</td>
          <td>$${payment.amount}</td>
          <td>${payment.status}</td>
          <td>${payment.date || "-"}</td>
      </tr>
    `;

  });

  totalEarnings.textContent = "$" + total;
  availableBalance.textContent = "$" + available;
  pendingBalance.textContent = "$" + pending;

});