// ===============================
// WorkBee Client Dashboard
// ===============================

console.log("Client Dashboard Loaded Successfully!");

// Sidebar Menu
const menuLinks = document.querySelectorAll(".sidebar a");

menuLinks.forEach(function(link){

    link.addEventListener("click", function(){

        menuLinks.forEach(function(item){
            item.classList.remove("active");
        });

        this.classList.add("active");

    });

});

// Dashboard Cards Animation
const cards = document.querySelectorAll(".card");

cards.forEach(function(card){

    card.addEventListener("mouseenter", function(){
        this.style.transform = "translateY(-5px)";
    });

    card.addEventListener("mouseleave", function(){
        this.style.transform = "translateY(0)";
    });

});

// Welcome Message
const heading = document.querySelector(".main-content h1");

const username = "Client";

heading.innerHTML = `Welcome, ${username} 👋`;

// Future Firebase
// Here we will load:
// - Client Name
// - Projects
// - Spending
// - Messages
// from Firebase Firestore.