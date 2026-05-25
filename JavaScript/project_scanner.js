// JavaScript/project_scanner.js

import { moveCameraTo } from './camera.js';

// Define variables at the module level so they are accessible in window.closeSidebar
let currentPosition = 0;
let currentProjectIndex = -1;

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

    const myProjects = [
                        './projects/seavilization.html',
                        './projects/colabora.html',
                        'projects/Value_Based_Leadership.html',
                        './projects/LIVID.html',
                        './projects/paper_screen.html',
                        './projects/the_interactive_book.html',
                        './projects/the_urban_greennest.html',
                        './projects/TPP.html',
                        './projects/wegwijzer.html',
                        './projects/word_bond.html',
                        './projects/design_for_behavioural_change.html',
                        './projects/user_experience_theory-practice.html',
                        './projects/Freelancing.html',
                        './projects/teacher-assistant.html'
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
            const cardDescEl = doc.querySelector('.js-project-card-description');
            const cardDescription = cardDescEl ? cardDescEl.textContent : "";


            // CLEANED UP cardHTML: Removed the extra div at the bottom and added data-index
            const cardHTML = `
                <div class="project-preview-card ${category}" data-link="${file}" data-index="${i}">
                    <div class="preview-tags">${tagsHTML}</div>
                    <div class="preview-thumb-container">
                        <img src="${thumbSrc}" alt="${title}">
                    </div>
                    <div class="card-footer">
                        <h3 class="preview-title">${title}</h3>
                        <p class="card-subtitle">${cardDescription}</p>
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
        
        const trackContainer = archiveTrack.parentElement;
        const sidebar = document.getElementById('project-sidebar');
        
        if (trackContainer && archiveTrack) {
            const cardLeft = activeCard.offsetLeft;
            const cardWidth = activeCard.offsetWidth;
            const containerWidth = trackContainer.offsetWidth;
            
            // Get sidebar width. If it's closed/hidden at this exact millisecond, 
            // fallback to a safe estimate (e.g., 400px or adjust to your CSS).
            let sidebarWidth = 0;
            if (sidebar) {
                sidebarWidth = sidebar.offsetWidth > 0 ? sidebar.offsetWidth : 400; 
            }

            // Center the card in the VISIBLE area (container width minus the sidebar width)
            const visibleWidth = containerWidth - sidebarWidth;
            let newPosition = -(cardLeft - (visibleWidth / 2) + (cardWidth / 2));

            const trackWidth = archiveTrack.scrollWidth;
            
            // CRITICAL FIX: Expand the boundary! Allow the slider to push further left 
            // by the width of the sidebar (+ a little padding) so the final cards aren't trapped.
            const maxScroll = -(trackWidth - containerWidth + sidebarWidth + 32); 

            // Enforce boundaries
            if (newPosition > 0) newPosition = 0;
            if (newPosition < maxScroll) newPosition = maxScroll;

            // Apply cleanly using your existing slider variable
            currentPosition = newPosition;
            archiveTrack.style.transition = "transform 0.4s ease-out";
            archiveTrack.style.transform = `translateX(${currentPosition}px)`;
        }
    }
};

        const archiveTrack = document.getElementById('project-track');

        window.moveArchiveSlider = (direction) => {
            if (!archiveTrack) return;

            const trackWidth = archiveTrack.scrollWidth;
            const containerWidth = archiveTrack.parentElement.offsetWidth;
            
            // Target the correct card class
            const projectCard = archiveTrack.querySelector('.project-preview-card');
            if (!projectCard) return;
            
            const projectWidth = projectCard.offsetWidth + 16; // Card width + gap
            const maxScroll = -(trackWidth - containerWidth);

            currentPosition -= direction * projectWidth;

            // Force boundaries
            if (currentPosition > 0) currentPosition = 0;
            if (currentPosition < maxScroll) currentPosition = maxScroll;

            archiveTrack.style.transition = "transform 0.4s ease-out";
            archiveTrack.style.transform = `translateX(${currentPosition}px)`;
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

        });
    });
};


const archiveHub = document.getElementById('project-archive-hub');
    if (archiveHub) {
        archiveHub.dataset.staticX = archiveHub.offsetLeft;
        archiveHub.dataset.staticY = archiveHub.offsetTop;
    };




    // 1. Helper to get only the projects currently shown by the filters
    const getVisibleProjects = () => {
        return Array.from(track.querySelectorAll('.project-preview-card'))
                    .filter(card => card.style.display !== 'none');
    };

    // 2. Logic to switch projects
    const navigateSidebar = (direction) => {
        const visibleCards = getVisibleProjects();
        if (visibleCards.length === 0) return;

        const currentCard = track.querySelector(`.project-preview-card[data-index="${currentProjectIndex}"]`);
        let currentIndexInVisible = visibleCards.indexOf(currentCard);
        let nextIndexInVisible = currentIndexInVisible + direction;

        if (nextIndexInVisible >= visibleCards.length) nextIndexInVisible = 0;
        if (nextIndexInVisible < 0) nextIndexInVisible = visibleCards.length - 1;

        const nextCard = visibleCards[nextIndexInVisible];
        const nextFile = nextCard.getAttribute('data-link');
        const nextRealIndex = parseInt(nextCard.getAttribute('data-index'));

        currentProjectIndex = nextRealIndex;
        highlightActiveCard(nextRealIndex);
        
        // Allow the sidebar to move the camera back to the hub or to the new citation
        window.openProjectSidebar(nextFile, true); 
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

    setTimeout(() => {
        // Select BOTH the cards and the group wrappers to be safe
        const targets = document.querySelectorAll('.mindmap-card, .section-box, .card-group');
        
        targets.forEach(el => {
            let actualLeft = 0;
            let actualTop = 0;
            let currentEl = el;

            // Calculate absolute position relative to canvas
            while (currentEl && currentEl.id !== 'canvas') {
                actualLeft += currentEl.offsetLeft;
                actualTop += currentEl.offsetTop;
                currentEl = currentEl.offsetParent;
            }

            el.dataset.staticX = actualLeft;
            el.dataset.staticY = actualTop;
        });
        console.log("World-Space coordinates captured for cards and group wrappers.");
    }, 600);



        window.captureTrueNorth = () => {
            const canvas = document.getElementById('canvas');
            const sidebar = document.getElementById('project-sidebar');
            
            // SAFETY: If sidebar is open, do not capture. 
            // We only want the "Natural" coordinates from when the sidebar is closed.
            if (!canvas || (sidebar && sidebar.classList.contains('open'))) return;

            const targets = document.querySelectorAll('.mindmap-card, .section-box, .card-group');
            
            targets.forEach(el => {
                let actualLeft = 0;
                let actualTop = 0;
                let currentEl = el;

                while (currentEl && currentEl !== canvas) {
                    actualLeft += currentEl.offsetLeft;
                    actualTop += currentEl.offsetTop;
                    currentEl = currentEl.offsetParent;
                }

                el.dataset.staticX = actualLeft;
                el.dataset.staticY = actualTop;
            });
            console.log("True North locked to Natural (Sidebar Closed) coordinates.");
        };


}


window.openProjectSidebar = async function(url, shouldMoveCamera = true) {
    const sidebar = document.getElementById('project-sidebar');
    const content = document.getElementById('sidebar-content');
    if (!sidebar || !content) return;

    const fileName = url.split('/').pop();

    try {
        const response = await fetch(url);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const container = doc.querySelector('.project-page-container');
        
        if (container) {
            // 1. CAPTURE COORDINATES while it is still closed/natural
            if (!sidebar.classList.contains('open')) {
                window.captureTrueNorth();
            }

            content.style.opacity = 0;
            setTimeout(() => {
                content.innerHTML = container.innerHTML;
                content.style.opacity = 1;
                content.scrollTop = 0;
            }, 200);
            
            // 2. OPEN SIDEBAR
            sidebar.classList.add('open');

            document.querySelectorAll('.project-citation').forEach(cite => cite.classList.remove('highlight-active'));
            const relevantCitations = document.querySelectorAll(`.project-citation[data-project="${fileName}"]`);
            relevantCitations.forEach(cite => cite.classList.add('highlight-active'));

            // 3. CAMERA NAVIGATION
            if (shouldMoveCamera) {
                if (relevantCitations.length > 0) {
                    const parentCard = relevantCitations[0].closest('.mindmap-card');
                    if (parentCard && parentCard.id) {
                        // Use a delay to let the sidebar 'push' happen so the camera 
                        // centers correctly in the NEW visible space
                        setTimeout(() => {
                            moveCameraTo(parentCard.id, 1);
                        }, 400);
                    }
                } else {
                    // Return to the project scanner view if there is no citation
                    setTimeout(() => {
                        moveCameraTo('project-archive-hub', 0.5);
                    }, 400);
                }
            }
        }
    } catch (err) { console.error("Sidebar Load Error:", err); }
};

window.closeSidebar = function() {
    const sidebar = document.getElementById('project-sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
        
        document.querySelectorAll('.project-preview-card').forEach(c => c.classList.remove('is-active'));

        // Also remove the highlight from the citation in the text
        document.querySelectorAll('.project-citation').forEach(cite => cite.classList.remove('highlight-active'));
        // Reset the current project index so the camera doesn't recenter
        currentProjectIndex = -1;

        // --- NEW: Fix the "empty space" slider bug ---
        const archiveTrack = document.getElementById('project-track');
        const trackContainer = archiveTrack ? archiveTrack.parentElement : null;

        if (archiveTrack && trackContainer) {
            const trackWidth = archiveTrack.scrollWidth;
            const containerWidth = trackContainer.offsetWidth;

            // Calculate the normal max scroll WITHOUT the sidebar width
            let standardMaxScroll = -(trackWidth - containerWidth);
            if (standardMaxScroll > 0) standardMaxScroll = 0; // Prevent positive scroll limits

            // If the track is pushed further left than normally allowed, pull it back
            if (currentPosition < standardMaxScroll) {
                currentPosition = standardMaxScroll;
                archiveTrack.style.transition = "transform 0.4s ease-out";
                archiveTrack.style.transform = `translateX(${currentPosition}px)`;
            }
        }
        // ---------------------------------------------

        // Recenter the camera on the active card (from our previous fix)
        if (typeof currentProjectIndex !== 'undefined' && currentProjectIndex !== -1) {
            const activeCard = archiveTrack.querySelector(`.project-preview-card[data-index="${currentProjectIndex}"]`);
            if (activeCard) {
                const projectFile = activeCard.getAttribute('data-link');
                const fileName = projectFile.split('/').pop();
                const relevantCitation = document.querySelector(`.project-citation[data-project="${fileName}"]`);
                
                if (relevantCitation) {
                    const parentCard = relevantCitation.closest('.mindmap-card');
                    if (parentCard && parentCard.id) {
                        moveCameraTo(parentCard.id, 1);
                    }
                }
            }
        }

        // Recalculate true north after the layout settles
        setTimeout(() => {
            window.captureTrueNorth();
        }, 450);
    }
};