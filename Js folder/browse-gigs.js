document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sortGigs');
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    const gigsGrid = document.querySelector('.gigs-grid');
    const filterPills = document.querySelectorAll('.filter-pill');

    let activeCategory = 'all';

    // 1. Sorting Functionality
    if (sortSelect && gigsGrid) {
        sortSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            const gigCards = Array.from(gigsGrid.querySelectorAll('.gig-card'));

            gigCards.sort((a, b) => {
                const priceA = parseFloat(a.getAttribute('data-price')) || 0;
                const priceB = parseFloat(b.getAttribute('data-price')) || 0;
                const ratingA = parseFloat(a.getAttribute('data-rating')) || 0;
                const ratingB = parseFloat(b.getAttribute('data-rating')) || 0;

                if (value === 'price-low') {
                    return priceA - priceB;
                } else if (value === 'price-high') {
                    return priceB - priceA;
                } else if (value === 'rating') {
                    return ratingB - ratingA;
                }
                return 0;
            });

            gigCards.forEach(card => gigsGrid.appendChild(card));
        });
    }

    // 2. Filter Gigs by Search & Sidebar Category
    function filterGigs() {
        if (!searchInput || !gigsGrid) return;
        const query = searchInput.value.toLowerCase().trim();
        const gigCards = gigsGrid.querySelectorAll('.gig-card');

        gigCards.forEach(card => {
            const title = card.querySelector('.gig-title').textContent.toLowerCase();
            const seller = card.querySelector('.seller-name').textContent.toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchesSearch = title.includes(query) || seller.includes(query);
            const matchesCategory = (activeCategory === 'all' || category === activeCategory);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterGigs);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterGigs();
        });
    }

    // 3. Sidebar Filter Pills Click Handling
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            activeCategory = this.getAttribute('data-category');
            filterGigs();
        });
    });

    // 4. Trending Links Click Handling
    const trendingLinks = document.querySelectorAll('.trending-container a');
    trendingLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            trendingLinks.forEach(l => l.style.color = '#334155');
            this.style.color = '#2563eb';
            
            if (searchInput) {
                searchInput.value = this.textContent;
                filterGigs();
            }
        });
    });
});
