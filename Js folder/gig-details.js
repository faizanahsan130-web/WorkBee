// Package Switching & Dynamic Data Update
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.package-tabs button');
    const priceText = document.querySelector('.price-header .price');
    const titleText = document.querySelector('.price-header h3');
    const descText = document.querySelector('.package-desc');
    const deliveryText = document.querySelector('.package-features p:first-child');
    const orderBtn = document.querySelector('.btn-order');

    // Packages Data
    const packages = {
        'Basic': { 
            title: 'Basic Landing Page', 
            price: '$30', 
            delivery: '⏱️ 2 Days Delivery',
            desc: 'Single page layout, basic Firebase hosting, clean HTML/CSS code.'
        },
        'Standard': { 
            title: 'Standard Landing Page', 
            price: '$50', 
            delivery: '⏱️ 3 Days Delivery',
            desc: 'Single responsive page with basic Firebase setup, CSS animations, and source code delivery.'
        },
        'Premium': { 
            title: 'Full Web App Package', 
            price: '$100', 
            delivery: '⏱️ 5 Days Delivery',
            desc: 'Multi-page responsive app, Firebase Auth & Firestore DB setup, advanced CSS animations.'
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Get selected package info
            const pkgName = tab.innerText.trim();
            const selectedPkg = packages[pkgName];

            if (selectedPkg) {
                titleText.innerText = selectedPkg.title;
                priceText.innerText = selectedPkg.price;
                descText.innerText = selectedPkg.desc;
                deliveryText.innerHTML = `<strong>${selectedPkg.delivery}</strong>`;
                orderBtn.innerText = `Continue (${selectedPkg.price})`;
            }
        });
    });

    // Order Button Click Handling
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            alert('Order flow initiated! Redirecting to checkout...');
        });
    }
});