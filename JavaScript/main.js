// JavaScript/main.js
console.log("Main.js has started!");

import { initPivNav, initCamera, navigateTo, updateActiveNavDot } from './camera.js'; // Added navigateTo
import { initSubCards } from './content.js';
import { updateLines, updateReflectionLines, updateArchiveConnection } from './lines.js';
import { initExpertiseAreas } from './content.js';
import { initProjectScanner } from './project_scanner.js';
import { initFilters } from './filter_projects.js';
import {initProjectCitations} from './project_ciations.js';

window.navigateTo = navigateTo;

window.openVisualModal = (buttonElement) => {
    const modal = document.getElementById('visual-modal');
    const modalImg = document.getElementById('modal-image');
    
    // Find the image inside the clicked tile
    const visualInner = buttonElement.closest('.visual-inner');
    const clickedImg = visualInner.querySelector('img');
    
    if (modal && modalImg && clickedImg) {
        modalImg.src = clickedImg.src;
        
        // Ensure the modal is visible
        modal.style.display = 'flex';
        modal.classList.add('open');
        
        // Optional: Hide the main body scrollbar while looking at the image
        document.body.style.overflow = 'hidden';
    }
};

window.closeVisualModal = () => {
    const modal = document.getElementById('visual-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('open');
        
        // Restore scrolling
        document.body.style.overflow = 'auto';
    }
};


// --- PDF TAB SWITCHING LOGIC ---
window.switchPdf = function(event, docId) {
    console.log("Switching to PDF:", docId);

    // 1. Hide all tab content containers
    const contents = document.querySelectorAll('.pdf-tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // 2. Remove 'active' status from all tab buttons
    const buttons = document.querySelectorAll('.pdf-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. Show the specific content requested
    const target = document.getElementById(docId);
    if (target) {
        target.classList.add('active');
    } else {
        console.error("Could not find PDF content with ID:", docId);
    }

    // 4. Mark the clicked button as the active one
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing...");
    initCamera();
    initSubCards();
    initExpertiseAreas();
    initPivNav();
    initProjectScanner();
    initProjectCitations();
    initFilters();

//--PROJECT WINDOW LOGIC
    const sidebar = document.getElementById('project-sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    let isResizing = false;

    if (resizer && sidebar) {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'ew-resize';
            // Optional: add a class to body to prevent text selection while dragging
            document.body.classList.add('is-resizing');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // Calculate new width (distance from right edge of window)
            let newWidth = window.innerWidth - e.clientX;
            
            // Limits: Min 400px, Max 80% of screen
            if (newWidth > 400 && newWidth < window.innerWidth * 0.8) {
                sidebar.style.width = `${newWidth}px`;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
                document.body.classList.remove('is-resizing');
            }
        });
    }
    // ------------------------------------------

    updateLines();
    // Give the browser a split second to render before drawing lines
    setTimeout(() => {
        updateLines();
        updateReflectionLines();
        updateArchiveConnection();
        updateActiveNavDot();
    }, 100);

});

window.addEventListener('resize', () => {
    updateLines(); 
});
