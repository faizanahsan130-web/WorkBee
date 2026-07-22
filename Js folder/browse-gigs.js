document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-bar button');
    const gigCards = document.querySelectorAll('.gig-card');
    const gigsGrid = document.querySelector('.gigs-grid');

    // Create a 'No Results' Message Element
    const noResultsMsg = document.createElement('div');
    noResultsMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 40px; font-size: 18px; color: #666; display: none;';
    noResultsMsg.innerHTML = '<h3>No gigs found in this category 🐝</h3><p style="margin-top: 8px; font-size: 14px;">Try selecting another category or clear filters.</p>';
    if (gigsGrid) {
        gigsGrid.appendChild(noResultsMsg);
    }

    // Category Filter Logic
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Unselect previous active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Set clicked button as active
            button.classList.add('active');

            const selectedCategory = button.innerText.trim().toLowerCase();
            let visibleCount = 0;

            // Filter Gig Cards based on category
            gigCards.forEach(card => {
                const title = card.querySelector('.gig-title').innerText.toLowerCase();

                let isMatch = false;
                if (selectedCategory === 'all categories') {
                    isMatch = true;
                } else if (selectedCategory === 'web development' && (title.includes('html') || title.includes('website') || title.includes('css'))) {
                    isMatch = true;
                } else if (selectedCategory === 'ai services' && (title.includes('vapi') || title.includes('ai') || title.includes('bot'))) {
                    isMatch = true;
                } else if (selectedCategory === 'graphic & design' && (title.includes('ui/ux') || title.includes('design') || title.includes('mobile'))) {
                    isMatch = true;
                } else if (selectedCategory === 'digital marketing' && (title.includes('script') || title.includes('form') || title.includes('google'))) {
                    isMatch = true;
                }

                if (isMatch) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show empty state if no matching gigs
            if (visibleCount === 0) {
                noResultsMsg.style.display = 'block';
            } else {
                noResultsMsg.style.display = 'none';
            }
        });
    });

    // Search Bar Logic
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');

    if (searchBtn && searchInput) {
        const handleSearch = () => {
            const query = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            gigCards.forEach(card => {
                const title = card.querySelector('.gig-title').innerText.toLowerCase();
                const seller = card.querySelector('.seller-name').innerText.toLowerCase();

                if (title.includes(query) || seller.includes(query)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (visibleCount === 0) {
                noResultsMsg.style.display = 'block';
            } else {
                noResultsMsg.style.display = 'none';
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});