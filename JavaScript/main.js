// JavaScript/main.js
console.log("Main.js has started!");

import { initPivNav } from './camera.js';
import { initSubCards } from './content.js';
import { initCamera } from './camera.js';
import { updateLines, updateReflectionLines } from './lines.js';
import { initExpertiseAreas } from './content.js';

window.navigateTo = navigateTo;




document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing...");
    initCamera();
    initSubCards();
    initExpertiseAreas();
    initPivNav();
    updateLines();
    // Give the browser a split second to render before drawing lines
    setTimeout(() => {
        updateLines();
        updateReflectionLines();
    }, 100);

});

window.addEventListener('resize', () => {
    updateLines(); 
});