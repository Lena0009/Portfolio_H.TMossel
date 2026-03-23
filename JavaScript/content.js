// JavaScript/content.js
import { updateLines } from './lines.js';

export function initSubCards() {
    // 1. Find all sub-cards currently in the HTML
    const subCards = document.querySelectorAll('.sub-card');
    console.log("Sub-cards found in HTML:", subCards.length);

    subCards.forEach(sub => {
        // 2. Find the body inside this specific card
        const body = sub.querySelector('.sub-body');
        
        // 3. Ensure the body starts hidden (Professional safety check)
        if (body) {
            body.style.display = 'none';
        }

        // 4. Add the click listener to toggle the body
        sub.addEventListener('click', (e) => {
            console.log("Goal Card Clicked:");
            e.stopPropagation(); // Prevents clicking the card from dragging the map
            
            if (body) {
                const isHidden = body.style.display === 'none';
                body.style.display = isHidden ? 'block' : 'none';
                
                // 5. Critical: Recalculate lines because the card grew/shrank
                updateLines(); 
            }
        });
    });
}

export function initExpertiseAreas() {
    const allTags = document.querySelectorAll('.tag');

    allTags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            const competence = tag.getAttribute('data-competence');
            
            // Highlight everything on the map that shares this competence
            document.querySelectorAll(`[data-competence="${competence}"]`).forEach(el => {
                el.style.outline = "2px solid #000";
            });
        });

        tag.addEventListener('mouseleave', () => {
            document.querySelectorAll('.tag').forEach(el => el.style.outline = "none");
        });
    });
}