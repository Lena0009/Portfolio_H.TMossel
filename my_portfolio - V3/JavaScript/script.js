const viewport = document.getElementById('viewport');
const canvas = document.getElementById('canvas');
const WORLD_SIZE = 20000; // Match your CSS width/height

let isDragging = false;
let startX, startY;

let scale = 0.5; // Your zoomed-out scale
const heroCardElement = document.querySelector('.hero-card');
const cardWidth = heroCardElement.offsetWidth;
const cardHeight = heroCardElement.offsetHeight;
const cardX = 9000; 
const cardY = 9000; 

// This math calculates the exact middle of the screen
let currentX = (window.innerWidth / 2) - (cardX + cardWidth / 2) * scale;
let currentY = (window.innerHeight / 2) - (cardY + cardHeight / 2) * scale;

// Apply these to the canvas immediately so it starts centered
canvas.style.transform = `scale(${scale})`;
canvas.style.left = currentX + 'px';
canvas.style.top = currentY + 'px';


// --- ZOOM LOGIC ---
viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomSpeed = 0.100;
    const oldScale = scale;

    // 1. Calculate new scale
    let newScale = e.deltaY < 0 ? scale + zoomSpeed : scale - zoomSpeed;

    // Apply your existing smart limits
    const minScaleX = window.innerWidth / WORLD_SIZE; 
    const minScaleY = window.innerHeight / WORLD_SIZE;
    const absoluteMinScale = Math.max(minScaleX, minScaleY);
    newScale = Math.min(Math.max(absoluteMinScale, newScale), 3);

    // 2. ZOOM TO MOUSE MATH
    // Get mouse position relative to the viewport
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate where the mouse is pointing relative to the canvas origin
    const canvasMouseX = (mouseX - currentX) / oldScale;
    const canvasMouseY = (mouseY - currentY) / oldScale;

    // Update the global scale
    scale = newScale;

    // Calculate new currentX and currentY to keep the point under the mouse fixed
    currentX = mouseX - canvasMouseX * scale;
    currentY = mouseY - canvasMouseY * scale;

    // 3. Apply transformations
    // Use a very short transition for the "fluid" feel we discussed
    canvas.style.transition = "transform 0.1s ease-out, left 0.1s ease-out, top 0.1s ease-out";
    
    canvas.style.transform = `scale(${scale})`;
    canvas.style.left = currentX + 'px';
    canvas.style.top = currentY + 'px';

    // Ensure we don't zoom out past the edges
    checkBounds(); 
}, { passive: false });

// --- DRAG LOGIC ---
viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    
    // This math prevents the "jump" by calculating the distance 
    // between the mouse and the canvas edge correctly
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    // 2. APPLY THE "INVISIBLE WALLS"
    // This calls the function you just created
    checkBounds();
    
    canvas.style.left = currentX + 'px';
    canvas.style.top = currentY + 'px';
});

// This ensures the code runs only after the page is fully ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial line draw
    updateLines();

    // 2. Spawn the sub-cards into the 'goals-group'
    spawnSubCard('goals-group', 'Programming', 'I will strengthen my programming skills and ability to integrate technology into prototypes...');
    spawnSubCard('goals-group', 'Analytical Thinking', 'Detailing the analytical process and data-driven design decisions...');
    spawnSubCard('goals-group', 'Documentation', 'Keeping track of the design process through rigorous logging...');
});

function checkBounds() {
    // Use the variable instead of a hardcoded 8000
    const scaledSize = WORLD_SIZE * scale;

    if (currentX > 0) currentX = 0;
    if (currentY > 0) currentY = 0;
    
    if (currentX < window.innerWidth - scaledSize) {
        currentX = window.innerWidth - scaledSize;
    }
    if (currentY < window.innerHeight - scaledSize) {
        currentY = window.innerHeight - scaledSize;
    }

    canvas.style.left = currentX + 'px';
    canvas.style.top = currentY + 'px';
}

/* NAVIGATION OF THE TOP BUTTONS LOGIC START HERE */
function navigateTo(location) {
    const targetScale = 0.5;

    // Use a simpler math for centering that works regardless of the canvas size
    const centerX = (window.innerWidth / 2);
    const centerY = (window.innerHeight / 2);

    const destinations = {
        'piv': { 
            x: (window.innerWidth / 2) - (cardX + cardWidth / 2) * targetScale, 
            y: (window.innerHeight / 2) - (cardY + cardHeight / 2) * targetScale
        },
        'archive': { 
            x: centerX - 5000 * targetScale, // Example for archive
            y: centerY - 2500 * targetScale 
        }
    };

    const target = destinations[location];

    currentX = target.x;
    currentY = target.y;
    scale = targetScale;

    // Add a temporary class to disable bounds checking during the transition
    canvas.style.transition = "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
    canvas.style.transform = `scale(${scale})`;
    canvas.style.left = currentX + 'px';
    canvas.style.top = currentY + 'px';

    setTimeout(() => {
        canvas.style.transition = "none";
        // We only check bounds AFTER the animation is done
        checkBounds();
    }, 800);
}


/* LINE LOGIC START HERE */
function updateLines() {
    const svg = document.getElementById('lines-layer');
    const cards = document.querySelectorAll('.mindmap-card, .card-goal-header:not(.sub-card)');
    svg.innerHTML = '';
    if (cards.length < 2) return;

    const offsetX = 9000; 
    const offsetY = 9000;

    for (let i = 0; i < cards.length - 1; i++) {
        const cardA = cards[i];
        const cardB = cards[i + 1];

        // NEW LOGIC: Calculate position based on whether the card is in a group or not
        const getPos = (el) => {
            // Check if the element is inside a group wrapper
            const group = el.closest('.card-group');
            
            if (group) {
                // If it's in a group, we use the Group's world position (top/left)
                // PLUS the card's local offset inside that group.
                return {
                    left: offsetX + group.offsetLeft + el.offsetLeft,
                    top: offsetY + group.offsetTop + el.offsetTop,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                };
            } else {
                // Standard card behavior
                return {
                    left: offsetX + el.offsetLeft,
                    top: offsetY + el.offsetTop,
                    width: el.offsetWidth,
                    height: el.offsetHeight
                };
            }
        };

        const posA = getPos(cardA);
        const posB = getPos(cardB);

        const rectA = {
            left: posA.left,
            top: posA.top,
            right: posA.left + posA.width,
            bottom: posA.top + posA.height,
            centerX: posA.left + (posA.width / 2),
            centerY: posA.top + (posA.height / 2)
        };

        const rectB = {
            left: posB.left,
            top: posB.top,
            right: posB.left + posB.width,
            bottom: posB.top + posB.height,
            centerX: posB.left + (posB.width / 2),
            centerY: posB.top + (posB.height / 2)
        };

        let startX, startY, endX, endY, type;

        // 1. Determine if the connection is mostly Horizontal or Vertical
        const dx = Math.abs(rectA.centerX - rectB.centerX);
        const dy = Math.abs(rectA.centerY - rectB.centerY);

        if (dx > dy) {
            type = 'horizontal';
            if (rectA.centerX < rectB.centerX) {
                startX = rectA.right; startY = rectA.centerY;
                endX = rectB.left; endY = rectB.centerY;
            } else {
                startX = rectA.left; startY = rectA.centerY;
                endX = rectB.right; endY = rectB.centerY;
            }
        } else {
            type = 'vertical';
            if (rectA.centerY < rectB.centerY) {
                startX = rectA.centerX; startY = rectA.bottom;
                endX = rectB.centerX; endY = rectB.top;
            } else {
                startX = rectA.centerX; startY = rectA.top;
                endX = rectB.centerX; endY = rectB.bottom;
            }
        }

        // 2. Straight Line Detection & Drawing
        let pathData = "";
        const radius = 40;
        const threshold = 15;

        if (type === 'horizontal') {
            if (Math.abs(startY - endY) < threshold) {
                pathData = `M ${startX} ${startY} L ${endX} ${startY}`;
            } else {
                const midX = startX + (endX - startX) / 2;
                // Check if we are going Left or Right
                const dirX = endX > startX ? 1 : -1; 
                const dirY = endY > startY ? 1 : -1;

                pathData = `
                    M ${startX} ${startY}
                    L ${midX - (radius * dirX)} ${startY}
                    Q ${midX} ${startY} ${midX} ${startY + (radius * dirY)}
                    L ${midX} ${endY - (radius * dirY)}
                    Q ${midX} ${endY} ${midX + (radius * dirX)} ${endY}
                    L ${endX} ${endY}
                `;
            }
        } else {
            // Vertical connection logic
            if (Math.abs(startX - endX) < threshold) {
                pathData = `M ${startX} ${startY} L ${startX} ${endY}`;
            } else {
                const midY = startY + (endY - startY) / 2;
                const dirX = endX > startX ? 1 : -1;
                const dirY = endY > startY ? 1 : -1;

                pathData = `
                    M ${startX} ${startY}
                    L ${startX} ${midY - (radius * dirY)}
                    Q ${startX} ${midY} ${startX + (radius * dirX)} ${midY}
                    L ${endX - (radius * dirX)} ${midY}
                    Q ${endX} ${midY} ${endX} ${midY + (radius * dirY)}
                    L ${endX} ${endY}
                `;
            }
        }

                const newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                newPath.setAttribute("d", pathData);
                newPath.setAttribute("stroke", "#333");
                newPath.setAttribute("stroke-width", "6");
                newPath.setAttribute("fill", "none");
                newPath.setAttribute("stroke-linecap", "round");
                newPath.setAttribute("stroke-linejoin", "round");
                svg.appendChild(newPath);
            }
        }



function spawnSubCard(groupId, title, content) {
    // Target the stack inside the group
    const stack = document.querySelector(`#${groupId} .sub-card-stack`);
    
    if (!stack) {
        console.error("Stack container not found in group:", groupId);
        return;
    }

    const sub = document.createElement('div');
    sub.className = 'sub-card';
    sub.innerHTML = `
        <div class="sub-header"><strong>${title}</strong></div>
        <div class="sub-body" style="display:none; margin-top:10px;">
            <p>${content}</p>
        </div>
    `;

    sub.addEventListener('click', (e) => {
        e.stopPropagation();
        const body = sub.querySelector('.sub-body');
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
        updateLines(); // Redraw lines in case the stack shifted the layout
    });

    stack.appendChild(sub);
}

