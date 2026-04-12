// JavaScript/lines.js
import { state } from './config.js';

export function updateLines() {
    const svg = document.getElementById('lines-layer');
    if (!svg) return;
    svg.innerHTML = ''; // Clear existing paths

    // 1. HELPER: Calculate absolute world coordinates
    const getPos = (el) => {
        let left = 0;
        let top = 0;
        let current = el;

        // Climb up the tree until we hit the canvas
        // This captures world region (9000), box (3400), and group (8500) automatically
        while (current && current.id !== 'canvas') {
            left += current.offsetLeft || 0;
            top += current.offsetTop || 0;
            current = current.offsetParent;
        }

        return {
            left: left,
            top: top,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    };

    // 2. THE SEQUENCE: Defines the exact path the line takes
    const sequence = [
        'Home-card', 
        'Vision-card', 
        'Ambition-card', 
        'PI-card', 
        'PIStrength-card', 
        'PIWeakness-card', 
        'Goals-header'
    ];

    // 3. DRAWING LOOP
    for (let i = 0; i < sequence.length - 1; i++) {
        const cardA = document.getElementById(sequence[i]);
        const cardB = document.getElementById(sequence[i+1]);

        if (!cardA) console.warn("Missing Card A:", sequence[i]);
        if (!cardB) console.warn("Missing Card B:", sequence[i+1]);

        if (!cardA || !cardB) continue;

        const posA = getPos(cardA);
        const posB = getPos(cardB);

        const rectA = {
            right: posA.left + posA.width,
            bottom: posA.top + posA.height,
            centerX: posA.left + (posA.width / 2),
            centerY: posA.top + (posA.height / 2)
        };
        const rectB = {
            left: posB.left,
            top: posB.top,
            centerX: posB.left + (posB.width / 2),
            centerY: posB.top + (posB.height / 2)
        };

        const dx = Math.abs(rectA.centerX - rectB.centerX);
        const dy = Math.abs(rectA.centerY - rectB.centerY);
        
        let pathData = "";
        const radius = 20;

        // Logic for Vision -> Ambition (Vertical drop)
        if (sequence[i] === 'Vision-card' && sequence[i+1] === 'Ambition-card') {
            pathData = `M ${rectA.centerX} ${rectA.bottom} L ${rectB.centerX} ${rectB.top}`;
        } 
        // Logic for Ambition -> PI-card (The "L" shape connector)
        else if (sequence[i] === 'Ambition-card') {
            const startX = rectA.right;
            const startY = rectA.centerY;
            const endX = rectB.left;
            const endY = rectB.centerY;
            
            // Calculate midpoint and direction for curves
            const midX = startX + (endX - startX) / 2;
            const dirY = endY > startY ? 1 : -1;
            const radius = 20; // Matches the others

            pathData = `
                M ${startX} ${startY}
                L ${midX - radius} ${startY}
                Q ${midX} ${startY} ${midX} ${startY + (radius * dirY)}
                L ${midX} ${endY - (radius * dirY)}
                Q ${midX} ${endY} ${midX + radius} ${endY}
                L ${endX} ${endY}
            `;
        }
        // Logic for everything else (Standard Horizontal Step)
        else {
            const startX = rectA.right;
            const startY = rectA.centerY;
            const endX = rectB.left;
            const endY = rectB.centerY;
            const midX = startX + (endX - startX) / 2;
            const dirY = endY > startY ? 1 : -1;

            pathData = `
                M ${startX} ${startY} 
                L ${midX - radius} ${startY} 
                Q ${midX} ${startY} ${midX} ${startY + (radius * dirY)} 
                L ${midX} ${endY - (radius * dirY)} 
                Q ${midX} ${endY} ${midX + radius} ${endY} 
                L ${endX} ${endY}
            `;
        }

        const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        newPath.setAttribute("d", pathData);
        newPath.setAttribute("stroke", "#333");
        newPath.setAttribute("stroke-width", "6");
        newPath.setAttribute("fill", "none");
        newPath.setAttribute("stroke-linecap", "round");
        svg.appendChild(newPath);
    }



// --- PART 2: SEPARATE REFLECTION BRANCH ---
    // This connects the DASHED BOX itself to the REFLECTION HUB
    const clusterBox = document.getElementById('identity-cluster-box');
    const reflectionGroup = document.getElementById('reflection-group');

    if (clusterBox && reflectionGroup) {
        // We use getBoundingClientRect to get absolute screen positions
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        const boxRect = clusterBox.getBoundingClientRect();
        const reflectRect = reflectionGroup.getBoundingClientRect();

        // 1. Calculate the TOP-CENTER of the identity box relative to the canvas
        // We divide by state.scale to get "world" coordinates
        const startX = ((boxRect.left + boxRect.right) / 2 - canvasRect.left) / state.scale;
        const startY = (boxRect.top - canvasRect.top) / state.scale;

        // 2. Calculate the BOTTOM-CENTER of the reflection group relative to the canvas
        const endX = ((reflectRect.left + reflectRect.right) / 2 - canvasRect.left) / state.scale;
        const endY = (reflectRect.bottom - canvasRect.top) / state.scale;

        const branchPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        branchPath.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
        branchPath.setAttribute("stroke", "#333");
        branchPath.setAttribute("stroke-width", "4");
        branchPath.setAttribute("fill", "none");
        branchPath.setAttribute("stroke-dasharray", "10, 10");
        svg.appendChild(branchPath);
    }

}

// Inside your updateLines function in lines.js
// JavaScript/lines.js
export function getAttachmentPoint(cardId, position) {
    const el = document.getElementById(cardId);
    if (!el) return { x: 0, y: 0 };

    // This pulls the LIVE width and height, regardless of what's in your CSS
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    
    // Pull current world coordinates from your state or inline styles
    const cardX = parseFloat(el.style.left) || 0;
    const cardY = parseFloat(el.style.top) || 0;

    let offsetX = 0;
    let offsetY = 0;

    // Use the live width/height to find the edges
    if (position === 'right') {
        offsetX = width;
        offsetY = height / 2;
    } else if (position === 'left') {
        offsetX = 0;
        offsetY = height / 2;
    } else if (position === 'bottom') {
        offsetX = width / 2;
        offsetY = height;
    } else if (position === 'top') {
        offsetX = width / 2;
        offsetY = 0;
    }

    return { x: cardX + offsetX, y: cardY + offsetY };
}



// 1. New Helper: Calculate Vertical Midpoint path data
function getVerticalPath(rectA, rectB) {
    const startX = rectA.centerX;
    const startY = rectA.bottom;
    const endX = rectB.centerX;
    const endY = rectB.top;

    const midY = startY + (endY - startY) / 2;
    const dirX = endX > startX ? 1 : -1;
    const radius = 20;

    // Use a vertical step-style connector
    return `
        M ${startX} ${startY}
        L ${startX} ${midY - radius}
        Q ${startX} ${midY} ${startX + radius * dirX} ${midY}
        L ${endX - radius * dirX} ${midY}
        Q ${endX} ${midY} ${endX} ${midY + radius}
        L ${endX} ${endY}
    `;
}

// 2. New Function: Handle the specific Vertical Branch
export function updateReflectionLines() {
    const svg = document.getElementById('lines-layer');
    const sectionPIV = document.getElementById('PI-cards');
    const sectionReflection = document.getElementById('reflection-group');
    
    if (!sectionPIV || !sectionReflection) return;

    // Helper to get the absolute center-top or center-bottom of a CONTAINER
    const getBoxEdge = (el, edge) => {
        const left = parseFloat(el.style.left) || 0;
        const top = parseFloat(el.style.top) || 0;
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        return {
            x: left + (width / 2),
            y: edge === 'top' ? top : top + height
        };
    };

    // Connection points: Bottom of Reflection box to Top of PIV box
    const start = getBoxEdge(sectionReflection, 'bottom');
    const end = getBoxEdge(sectionPIV, 'top');

    // Draw a straight vertical line between the boxes
    const pathData = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

    // Create the path
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", pathData);
    line.setAttribute("stroke", "#333");
    line.setAttribute("stroke-width", "4");
    line.setAttribute("fill", "none");
    line.setAttribute("stroke-dasharray", "10, 10"); // Match the dashed box style
    
    svg.appendChild(line);
}

// 3. New Function: Connect Identity Cluster to Project Archive
export function updateArchiveConnection() {
    const svg = document.getElementById('lines-layer');
    const canvas = document.getElementById('canvas');
    const clusterBox = document.getElementById('identity-cluster-box');
    const archiveHub = document.getElementById('project-archive-hub');

    if (!svg || !canvas || !clusterBox || !archiveHub) {
        console.warn("Archive Line Debug: Missing one of the elements.");
        return;
    }

    // 1. Get the scroll/position of the canvas itself
    const canvasRect = canvas.getBoundingClientRect();

    // 2. Get the positions of the two boxes on the screen
    const boxRect = clusterBox.getBoundingClientRect();
    const hubRect = archiveHub.getBoundingClientRect();

    // 3. Calculate points relative to the canvas (and account for scale)
    // We want the BOTTOM CENTER of the Identity Box
    const startX = ((boxRect.left + boxRect.right) / 2 - canvasRect.left) / state.scale;
    const startY = (boxRect.bottom - canvasRect.top) / state.scale;

    // We want the TOP CENTER of the Archive Hub
    const endX = ((hubRect.left + hubRect.right) / 2 - canvasRect.left) / state.scale;
    const endY = (hubRect.top - canvasRect.top) / state.scale;

    // 4. Create the path
    const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", pathData);
    line.setAttribute("stroke", "#333");
    line.setAttribute("stroke-width", "4"); // Match your other dashed lines
    line.setAttribute("fill", "none");
    line.setAttribute("stroke-dasharray", "10, 10");
    line.setAttribute("stroke-linecap", "round");
    
    svg.appendChild(line);
}
