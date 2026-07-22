/*=====================================================
  WorkBee V3 Premium Edition
  script.js
  Part 1 (Complete Replacement)
======================================================*/

"use strict";

/*=====================================================
  DOM Ready
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initLoader();
    initMobileMenu();
    initDarkMode();
    initSmoothScroll();

});

/*=====================================================
  Loader
======================================================*/

function initLoader() {

    const loader = document.getElementById("loader");

    if (!loader) return;

    window.addEventListener("load", () => {

        setTimeout(() => {

            loader.classList.add("loader-hide");

            setTimeout(() => {

                loader.remove();

            }, 500);

        }, 800);

    });

}

/*=====================================================
  Mobile Menu
======================================================*/

function initMobileMenu() {

    const menuBtn = document.getElementById("mobileMenu");

    const navbar = document.querySelector(".navbar");

    if (!menuBtn || !navbar) return;

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("active");

        const icon = menuBtn.querySelector("i");

        if (icon) {

            icon.classList.toggle("fa-bars");
            icon.classList.toggle("fa-xmark");

        }

    });

    document.querySelectorAll(".navbar a").forEach(link => {

        link.addEventListener("click", () => {

            navbar.classList.remove("active");

            const icon = menuBtn.querySelector("i");

            if (icon) {

                icon.classList.add("fa-bars");
                icon.classList.remove("fa-xmark");

            }

        });

    });

}

/*=====================================================
  Dark Mode
======================================================*/

function initDarkMode() {

    const btn = document.getElementById("themeToggle");

    if (!btn) return;

    const savedTheme = localStorage.getItem("workbee-theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        btn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    }

    btn.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const dark = document.body.classList.contains("dark");

        btn.innerHTML = dark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        localStorage.setItem(
            "workbee-theme",
            dark ? "dark" : "light"
        );

    });

}

/*=====================================================
  Smooth Scroll
======================================================*/

function initSmoothScroll() {

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", e => {

            const target = document.querySelector(
                link.getAttribute("href")
            );

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

    });

}

/*=====================================================
  End Part 1
======================================================*/
/*=====================================================
  WorkBee V3 Premium Edition
  script.js
  Part 2
======================================================*/

/*=====================================================
  Initialize Advanced Features
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initScrollReveal();

    initCounterAnimation();

    initHeaderEffect();

    initBackToTop();

    initActiveNavigation();

    initParallaxEffect();

});

/*=====================================================
  Scroll Reveal
======================================================*/

function initScrollReveal() {

    const elements = document.querySelectorAll(".reveal");

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

            }

        });

    }, {

        threshold: 0.15

    });

    elements.forEach(el => observer.observe(el));

}

/*=====================================================
  Counter Animation
======================================================*/

function initCounterAnimation() {

    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    const runCounter = (counter) => {

        const target = Number(counter.dataset.target);

        let current = 0;

        const step = Math.max(1, Math.ceil(target / 100));

        const timer = setInterval(() => {

            current += step;

            if (current >= target) {

                current = target;

                clearInterval(timer);

            }

            counter.textContent = current.toLocaleString();

        }, 20);

    };

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                runCounter(entry.target);

                observer.unobserve(entry.target);

            }

        });

    });

    counters.forEach(counter => observer.observe(counter));

}

/*=====================================================
  Sticky Header Effect
======================================================*/

function initHeaderEffect() {

    const header = document.querySelector(".header");

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 60) {

            header.style.boxShadow = "0 10px 30px rgba(0,0,0,.12)";

            header.style.background = "rgba(255,255,255,.96)";

        } else {

            header.style.boxShadow = "";

            header.style.background = "";

        }

    });

}

/*=====================================================
  Back To Top Button
======================================================*/

function initBackToTop() {

    let button = document.getElementById("backToTop");

    if (!button) {

        button = document.createElement("button");

        button.id = "backToTop";

        button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

        document.body.appendChild(button);

    }

    Object.assign(button.style, {

        position: "fixed",

        right: "25px",

        bottom: "25px",

        width: "55px",

        height: "55px",

        borderRadius: "50%",

        border: "none",

        background: "#facc15",

        cursor: "pointer",

        fontSize: "20px",

        display: "none",

        zIndex: "999",

        boxShadow: "0 10px 25px rgba(0,0,0,.15)"

    });

    window.addEventListener("scroll", () => {

        button.style.display = window.scrollY > 500 ? "block" : "none";

    });

    button.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/*=====================================================
  Active Navigation
======================================================*/

function initActiveNavigation() {

    const sections = document.querySelectorAll("section[id]");

    const navLinks = document.querySelectorAll(".navbar a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 120;

            const height = section.offsetHeight;

            if (window.scrollY >= top &&
                window.scrollY < top + height) {

                current = section.id;

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {

                link.classList.add("active");

            }

        });

    });

}

/*=====================================================
  Mouse Parallax
======================================================*/

function initParallaxEffect() {

    const heroImage = document.querySelector(".hero-right img");

    if (!heroImage) return;

    document.addEventListener("mousemove", (e) => {

        const x = (e.clientX / window.innerWidth - 0.5) * 12;

        const y = (e.clientY / window.innerHeight - 0.5) * 12;

        heroImage.style.transform =
            `translate(${x}px, ${y}px)`;

    });

}

/*=====================================================
  End Part 2
======================================================*/
/*=====================================================
  WorkBee V3 Premium Edition
  script.js
  Part 3
======================================================*/

/*=====================================================
  Initialize Premium Features
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initNewsletter();

    initTypingEffect();

    initRippleEffect();

    initLiveSearch();

    initToastSystem();

});

/*=====================================================
  Newsletter Validation
======================================================*/

function initNewsletter() {

    const form = document.querySelector(".newsletter-form");

    if (!form) return;

    const input = form.querySelector("input");

    const button = form.querySelector("button");

    button.addEventListener("click", (e) => {

        e.preventDefault();

        const email = input.value.trim();

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!pattern.test(email)) {

            showToast("Please enter a valid email.", "error");

            input.focus();

            return;

        }

        showToast("Successfully subscribed!", "success");

        input.value = "";

    });

}

/*=====================================================
  Typing Effect
======================================================*/

function initTypingEffect() {

    const title = document.querySelector(".typing-text");

    if (!title) return;

    const text = title.dataset.text || title.textContent;

    title.textContent = "";

    let index = 0;

    function type() {

        if (index < text.length) {

            title.textContent += text.charAt(index);

            index++;

            setTimeout(type, 70);

        }

    }

    type();

}

/*=====================================================
  Ripple Effect
======================================================*/

function initRippleEffect() {

    document.querySelectorAll("button,.primary-btn,.secondary-btn")
        .forEach(button => {

            button.addEventListener("click", function (e) {

                const ripple = document.createElement("span");

                ripple.className = "ripple-effect";

                const rect = this.getBoundingClientRect();

                ripple.style.left =
                    e.clientX - rect.left + "px";

                ripple.style.top =
                    e.clientY - rect.top + "px";

                this.appendChild(ripple);

                setTimeout(() => {

                    ripple.remove();

                }, 600);

            });

        });

}

/*=====================================================
  Live Search Suggestions
======================================================*/

function initLiveSearch() {

    const search = document.querySelector(".hero-search input");

    if (!search) return;

    const suggestions = [

        "Web Development",

        "Graphic Design",

        "AI Automation",

        "WordPress",

        "Flutter",

        "React",

        "UI/UX",

        "Video Editing",

        "SEO",

        "Digital Marketing"

    ];

    search.addEventListener("input", () => {

        const value = search.value.toLowerCase();

        const result = suggestions.filter(item =>

            item.toLowerCase().includes(value)

        );

        console.log("Suggestions:", result);

    });

}

/*=====================================================
  Toast Notification System
======================================================*/

function initToastSystem() {

    if (document.getElementById("toast-container")) return;

    const container = document.createElement("div");

    container.id = "toast-container";

    Object.assign(container.style, {

        position: "fixed",

        top: "20px",

        right: "20px",

        zIndex: "99999",

        display: "flex",

        flexDirection: "column",

        gap: "12px"

    });

    document.body.appendChild(container);

}

function showToast(message, type = "success") {

    const container = document.getElementById("toast-container");

    if (!container) return;

    const toast = document.createElement("div");

    toast.textContent = message;

    Object.assign(toast.style, {

        background: type === "success" ? "#22c55e" : "#ef4444",

        color: "#fff",

        padding: "14px 18px",

        borderRadius: "10px",

        minWidth: "250px",

        boxShadow: "0 10px 25px rgba(0,0,0,.15)",

        animation: "fadeUp .35s ease"

    });

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform = "translateY(-10px)";

        toast.style.transition = ".3s";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

/*=====================================================
  End Part 3
======================================================*/
/*=====================================================
  WorkBee V3 Premium Edition
  script.js
  Part 4 (Production Final)
======================================================*/

/*=====================================================
  Initialize Production Features
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initLazyImages();

    initAutoTheme();

    initPerformance();

    initKeyboardShortcuts();

    initOnlineStatus();

});

/*=====================================================
  Lazy Loading Images
======================================================*/

function initLazyImages() {

    const images = document.querySelectorAll("img[data-src]");

    if (!images.length) return;

    const observer = new IntersectionObserver((entries, obs) => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            const img = entry.target;

            img.src = img.dataset.src;

            img.removeAttribute("data-src");

            img.classList.add("fade-up");

            obs.unobserve(img);

        });

    });

    images.forEach(img => observer.observe(img));

}

/*=====================================================
  Auto Theme Detection
======================================================*/

function initAutoTheme() {

    if (localStorage.getItem("workbee-theme")) return;

    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    if (dark.matches) {

        document.body.classList.add("dark");

        const btn = document.getElementById("themeToggle");

        if (btn) {

            btn.innerHTML = '<i class="fa-solid fa-sun"></i>';

        }

    }

}

/*=====================================================
  Performance Optimizations
======================================================*/

function initPerformance() {

    let timer;

    window.addEventListener("resize", () => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            console.log("Layout updated.");

        }, 250);

    });

}

/*=====================================================
  Keyboard Shortcuts
======================================================*/

function initKeyboardShortcuts() {

    document.addEventListener("keydown", (e) => {

        // Press "/"
        if (e.key === "/") {

            const search = document.querySelector(".hero-search input");

            if (search) {

                e.preventDefault();

                search.focus();

            }

        }

        // ESC closes mobile menu
        if (e.key === "Escape") {

            const navbar = document.querySelector(".navbar");

            if (navbar) {

                navbar.classList.remove("active");

            }

        }

    });

}

/*=====================================================
  Online / Offline Status
======================================================*/

function initOnlineStatus() {

    window.addEventListener("online", () => {

        showToast("Internet Connected", "success");

    });

    window.addEventListener("offline", () => {

        showToast("Internet Connection Lost", "error");

    });

}

/*=====================================================
  Global Error Handler
======================================================*/

window.addEventListener("error", (event) => {

    console.error("WorkBee Error:", event.message);

});

/*=====================================================
  Unhandled Promise Rejection
======================================================*/

window.addEventListener("unhandledrejection", (event) => {

    console.error("Promise Error:", event.reason);

});

/*=====================================================
  Console Welcome Message
======================================================*/

console.log(`
=========================================
🐝 Welcome to WorkBee V3
Production Build Loaded Successfully
Version : 3.0
Status  : Ready for Firebase Integration
=========================================
`);

/*=====================================================
  End of WorkBee V3
======================================================*/