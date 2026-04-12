// JavaScript/project_scanner.js

export async function initProjectScanner() {
    const track = document.getElementById('project-track');
    const slider = document.querySelector('.archive-slider');
    const dotsContainer = document.getElementById('archive-dots');
    
    if (!track || !slider || !dotsContainer) {
        console.warn("Scanner: Missing required UI elements (track, slider, or dots).");
        return;
    }

    if (slider) {
    // Stop the "Grab and Drag" canvas logic from hearing mouse events inside the slider
    slider.addEventListener('mousedown', (e) => {
        e.stopPropagation(); 
    }, false);

    slider.addEventListener('touchstart', (e) => {
        e.stopPropagation(); 
    }, { passive: true });
}

    const myProjects = ['./projects/Project_Template.html',
                        './projects/seavilization.html',
                        './projects/colabora.html',
                        './projects/design_management.html',
                        './projects/LIVID.html',
                        './projects/paper_screen.html',
                        './projects/the_interactive_book.html',
                        './projects/the_urban_greennest.html',
                        './projects/TPP.html',
                        './projects/wegwijzer.html',
                        './projects/word_bond.html'
    ]; 


    track.innerHTML = '';

        for (let i = 0; i < myProjects.length; i++) {
        const file = myProjects[i];
        try {
            const response = await fetch(file);
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const root = doc.querySelector('.project-page-container');
            const category = root?.getAttribute('data-category') || 'all';
            
            const title = doc.querySelector('.js-project-title')?.innerText || "Untitled";
            const thumbSrc = doc.querySelector('.js-project-thumbnail')?.getAttribute('src') || "";
            const tagsHTML = doc.querySelector('.js-project-tags')?.innerHTML || "";
            const subtitle = doc.querySelector('.js-project-subtitle')?.innerText || "";

            // CLEANED UP cardHTML: Removed the extra div at the bottom and added data-index
            const cardHTML = `
                <div class="project-preview-card ${category}" data-link="${file}" data-index="${i}">
                    <div class="preview-tags">${tagsHTML}</div>
                    <div class="preview-thumb-container">
                        <img src="${thumbSrc}" alt="${title}">
                    </div>
                    <div class="card-footer">
                        <h3 class="preview-title">${title}</h3>
                        <p class="preview-subtitle">${subtitle}</p>
                    </div>
                </div>`;

            track.insertAdjacentHTML('beforeend', cardHTML);

            const newCard = track.lastElementChild;
            newCard.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Now 'i' is correctly captured for each card
                currentProjectIndex = i; 
                highlightActiveCard(i);
                window.openProjectSidebar(file);
            });

        } catch (e) { console.error("Error loading project:", file, e); }
    }

    const highlightActiveCard = (index) => {
    // 1. Remove the active class from every card
    track.querySelectorAll('.project-preview-card').forEach(card => {
        card.classList.remove('is-active');
    });

    // 2. Find the card that matches the current index and add the class
    const activeCard = track.querySelector(`.project-preview-card[data-index="${index}"]`);
    if (activeCard) {
        activeCard.classList.add('is-active');
        
        // Optional: Automatically scroll the carousel to keep the active card in view
        activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
};

    // 2. SETUP DOT PAGINATION (Internal Function)
    const updateDots = () => {
        dotsContainer.innerHTML = ''; 
        // Only count cards that are currently visible (not display: none)
        const visibleCards = Array.from(track.querySelectorAll('.project-preview-card'))
                                  .filter(card => card.style.display !== 'none');
        
        if (visibleCards.length === 0) {
            dotsContainer.style.display = 'none'; // Kills the container entirely
            return;
        }

        const cardsPerPage = 4;
        const totalDotsNeeded = Math.max(1, visibleCards.length - (cardsPerPage - 1));

        // If there are 4 or fewer projects, we don't really need dots
        if (visibleCards.length <= cardsPerPage) {
            dotsContainer.style.display = 'none';
            return;
        } else {
            dotsContainer.style.display = 'flex';
        }

        for (let i = 0; i < totalDotsNeeded; i++) {
            const dot = document.createElement('div');
            dot.classList.add('archive-dot');
            if (i === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {
                const gap = 40; 
                const cardWidth = visibleCards[0].offsetWidth;
                const moveDistance = i * (cardWidth + gap);
                track.style.transform = `translateX(-${moveDistance}px)`;

                dotsContainer.querySelectorAll('.archive-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
            dotsContainer.appendChild(dot);
        }
    };

    // --- FUNCTION DEFINITION STARTS HERE ---
    // Defining it as a constant inside the main function ensures it's "Defined" 
    // before it is called below.
        const setupFilterLogic = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-preview-card');
    const track = document.getElementById('project-track');

    // memory of what is selected
    let activeCategories = new Set();
    let activeExpertise = new Set();

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent any other ghost-clicks
            e.preventDefault();

            const filterValue = btn.getAttribute('data-filter');
            const isExpertise = btn.closest('.competency-legend');

            console.log(`User clicked: ${filterValue}`);

            // 1. UPDATE THE MEMORY (The Sets)
            if (filterValue === 'all') {
                activeCategories.clear();
                activeExpertise.clear();
            } else {
                const targetSet = isExpertise ? activeExpertise : activeCategories;
                
                if (targetSet.has(filterValue)) {
                    targetSet.delete(filterValue); // Toggle off
                } else {
                    targetSet.add(filterValue);    // Toggle on
                }
            }

            // 2. REFRESH BUTTON VISUALS (Force the UI to match Memory)
            filterButtons.forEach(button => {
                const val = button.getAttribute('data-filter');
                const isExpBtn = button.closest('.competency-legend');
                
                if (val === 'all') {
                    // All is active only if nothing else is selected
                    if (activeCategories.size === 0 && activeExpertise.size === 0) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                } else {
                    const checkSet = isExpBtn ? activeExpertise : activeCategories;
                    if (checkSet.has(val)) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                }
            });

            // 3. APPLY FILTER TO CARDS
            if (track) track.style.transform = 'translateX(0px)';

            cards.forEach(card => {
                const matchesCat = activeCategories.size === 0 || 
                    Array.from(activeCategories).some(c => card.classList.contains(c));

                const matchesExp = activeExpertise.size === 0 || 
                    Array.from(activeExpertise).some(e => card.querySelector(`[data-competence="${e}"]`));

                card.style.display = (matchesCat && matchesExp) ? 'flex' : 'none';
            });

            if (typeof updateDots === 'function') updateDots();
        });
    });
};


    // Inside initProjectScanner()
    let currentProjectIndex = -1;

    // 1. Helper to get only the projects currently shown by the filters
    const getVisibleProjects = () => {
        return Array.from(track.querySelectorAll('.project-preview-card'))
                    .filter(card => card.style.display !== 'none');
    };

    // 2. Logic to switch projects
    const navigateSidebar = (direction) => {
        const visibleCards = getVisibleProjects();
        if (visibleCards.length === 0) return;

        // Find the current card's index within the VISIBLE set
        const currentCard = track.querySelector(`.project-preview-card[data-index="${currentProjectIndex}"]`);
        let currentIndexInVisible = visibleCards.indexOf(currentCard);

        // Calculate next index
        let nextIndexInVisible = currentIndexInVisible + direction;

        // Loop around logic
        if (nextIndexInVisible >= visibleCards.length) nextIndexInVisible = 0;
        if (nextIndexInVisible < 0) nextIndexInVisible = visibleCards.length - 1;

        const nextCard = visibleCards[nextIndexInVisible];
        const nextFile = nextCard.getAttribute('data-link');
        const nextRealIndex = parseInt(nextCard.getAttribute('data-index'));

        // Update global tracker and load
        currentProjectIndex = nextRealIndex;
        highlightActiveCard(nextRealIndex);
        window.openProjectSidebar(nextFile);
    };

    // 3. Attach listeners to the buttons in the HTML
    document.getElementById('prev-project')?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateSidebar(-1);
    });

    document.getElementById('next-project')?.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateSidebar(1);
    });


    // Initial Run
    setupFilterLogic();
    updateDots();
}

window.openProjectSidebar = async function(url) {
    const sidebar = document.getElementById('project-sidebar');
    const content = document.getElementById('sidebar-content');

    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const container = doc.querySelector('.project-page-container');
        
        if (container) {
            // Smoothly swap content
            content.style.opacity = 0;
            setTimeout(() => {
                content.innerHTML = container.innerHTML;
                content.style.opacity = 1;
                content.scrollTop = 0; // Always start at the top of a new project
            }, 200);

            sidebar.classList.add('open');
        }
    } catch (err) {
        console.error("Failed to load project:", err);
    }
};

window.closeSidebar = function() {
    const sidebar = document.getElementById('project-sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        document.querySelectorAll('.project-preview-card').forEach(c => c.classList.remove('is-active'));
        console.log("Sidebar closed.");
    }
};