export function initFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-preview-card');

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Manage Active State of buttons
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // 2. Filter the cards
            cards.forEach(card => {
                if (filterValue === 'all' || card.classList.contains(filterValue)) {
                    card.style.display = 'flex'; // Show
                } else {
                    card.style.display = 'none'; // Hide
                }
            });
        });
    });
}