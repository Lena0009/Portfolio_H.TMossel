// JavaScript/main.js
console.log("Main.js has started!");

import { initPivNav } from './camera.js';
import { initSubCards } from './content.js';
import { initCamera } from './camera.js';
import { updateLines, updateReflectionLines, updateArchiveConnection } from './lines.js';
import { initExpertiseAreas } from './content.js';
import { initProjectScanner } from './project_scanner.js';
import { initFilters } from './filter_projects.js';
import {initProjectCitations} from './project_ciations.js';

window.navigateTo = navigateTo;




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
    }, 100);

});

window.addEventListener('resize', () => {
    updateLines(); 
});