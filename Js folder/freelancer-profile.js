// =======================================
// WorkBee Freelancer Profile
// =======================================

console.log("Freelancer Profile Loaded Successfully!");

// Hire Button
const hireBtn = document.getElementById("hireBtn");

if (hireBtn) {

    hireBtn.addEventListener("click", function () {

        alert("🎉 Hire Request Sent Successfully!");

    });

}

// Portfolio Items
const portfolioItems = document.querySelectorAll(".item");

portfolioItems.forEach(function(item){

    item.addEventListener("click", function(){

        alert("📂 Opening " + this.innerText);

    });

});

// Profile Card Animation
const profileCard = document.querySelector(".profile-card");

if (profileCard) {

    profileCard.addEventListener("mouseenter", function(){

        this.style.transform = "translateY(-8px)";
        this.style.transition = "0.3s";

    });

    profileCard.addEventListener("mouseleave", function(){

        this.style.transform = "translateY(0)";

    });

}

console.log("WorkBee Freelancer Profile Ready!");