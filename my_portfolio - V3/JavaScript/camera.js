// JavaScript/camera.js
import { state, canvas, viewport, WORLD_SIZE } from './config.js';
import { updateLines } from './lines.js';

export function initCamera() {
    // Applying initial position from config
    canvas.style.transform = `scale(${state.scale})`;
    canvas.style.left = state.currentX + 'px';
    canvas.style.top = state.currentY + 'px';

    viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.piv-nav-container')) return;


        state.isDragging = true;
        viewport.style.cursor = 'grabbing';
        state.startX = e.clientX - state.currentX;
        state.startY = e.clientY - state.currentY;
    });

    window.addEventListener('mousemove', (e) => {

        if (!state.isDragging) return;

            const dx = e.clientX - (state.startX + state.currentX);
            const dy = e.clientY - (state.startY + state.currentY);
    
    // Only move if the mouse has traveled a bit (threshold of 5px)
        if (Math.sqrt(dx*dx + dy*dy) > 5) {
            state.currentX = e.clientX - state.startX;
            state.currentY = e.clientY - state.startY;

        checkBounds();
        applyStyle();

        }
    });

    window.addEventListener('mouseup', () => {
        state.isDragging = false;
        viewport.style.cursor = 'grab';
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.100;
        const oldScale = state.scale;
        
        let newScale = e.deltaY < 0 ? state.scale + zoomSpeed : state.scale - zoomSpeed;
        

        //Zoom limits 
        const MIN_ZOOM = 0.30; // How far you can zoom out (0.15 = 15% size)
        const MAX_ZOOM = 2.0;  // How far you can zoom in (2.0 = 200% size)
         // Use Math.max with MIN_ZOOM to ensure you can't zoom out past 15%
        state.scale = Math.min(Math.max(MIN_ZOOM, newScale), MAX_ZOOM);

        const canvasMouseX = (e.clientX - state.currentX) / oldScale;
        const canvasMouseY = (e.clientY - state.currentY) / oldScale;

        state.currentX = e.clientX - canvasMouseX * state.scale;
        state.currentY = e.clientY - canvasMouseY * state.scale;

        canvas.style.transition = "transform 0.1s ease-out, left 0.1s ease-out, top 0.1s ease-out";
        checkBounds();
        applyStyle();
    }, { passive: false });
}

export function checkBounds() {
    const scaledSize = WORLD_SIZE * state.scale;
    if (state.currentX > 0) state.currentX = 0;
    if (state.currentY > 0) state.currentY = 0;
    if (state.currentX < window.innerWidth - scaledSize) state.currentX = window.innerWidth - scaledSize;
    if (state.currentY < window.innerHeight - scaledSize) state.currentY = window.innerHeight - scaledSize;
    applyStyle();
}

function applyStyle() {
    canvas.style.left = state.currentX + 'px';
    canvas.style.top = state.currentY + 'px';
    canvas.style.transform = `scale(${state.scale})`;

}

/* NAVIGATION OF THE TOP BUTTONS LOGIC START HERE */
function navigateTo(location) {
    const targetScale = 1.0;

    // Use a simpler math for centering that works regardless of the canvas size
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const heroCard = document.querySelector('.hero-card');
    const cardWidth = heroCard ? heroCard.offsetWidth : 1400;
    const cardHeight = heroCard ? heroCard.offsetHeight : 800;

    const destinations = {
        'piv': { 
            x: centerX - (state.cardX + cardWidth /2) * targetScale, 
            y: centerY - (state.cardY + cardHeight /2) * targetScale
        },
        'archive': { 
            x: centerX - 5000 * targetScale, 
            y: centerY - 2500 * targetScale
        }
    };

    const target = destinations[location];
    if (!target) return;

    // 2. Update state (Matches your console error fix)
    state.currentX = target.x;
    state.currentY = target.y;
    state.scale = targetScale;

    // 3. Apply animation
    canvas.style.transition = "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
    canvas.style.transform = `scale(${state.scale})`;
    canvas.style.left = state.currentX + 'px';
    canvas.style.top = state.currentY + 'px';

    setTimeout(() => {
        canvas.style.transition = "none";
        checkBounds();
        updateLines();
    }, 800);
}

window.navigateTo = navigateTo;


// JavaScript/camera.js

export function initPivNav() {
    const mainDots = document.querySelectorAll('.piv-dot');
    const subDots = document.querySelectorAll('.piv-sub-dot');
    const mouseTooltip = document.getElementById('piv-mouse-tooltip');

    // 1. TOOLTIP MOVEMENT (Shared for all dots)
    window.addEventListener('mousemove', (e) => {
        if (mouseTooltip && mouseTooltip.classList.contains('visible')) {
            mouseTooltip.style.left = `${e.clientX}px`;
            mouseTooltip.style.top = `${e.clientY}px`;
        }
    });

    // 2. CAMERA MOVEMENT HELPER
    const moveCameraTo = (targetId, scale) => {
        const el = document.getElementById(targetId);
        if (!el) {
            console.error("Target element not found:", targetId);
            return;
        }

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const getAbsolutePos = (target) => {
            let left = 0, top = 0, current = target;
            while (current && current.id !== 'canvas') {
                left += current.offsetLeft || 0;
                top += current.offsetTop || 0;
                current = current.offsetParent;
            }
            return { left, top };
        };

        const pos = getAbsolutePos(el);
        const targetX = pos.left + (el.offsetWidth / 2);
        const targetY = pos.top + (el.offsetHeight / 2);

        state.scale = scale;
        state.currentX = centerX - targetX * state.scale;
        state.currentY = centerY - targetY * state.scale;
        applyStyle();
    };

    // 3. MAIN DOTS LOGIC
    mainDots.forEach(dot => {
        dot.addEventListener('mouseenter', () => {
            mouseTooltip.textContent = dot.getAttribute('data-label');
            mouseTooltip.classList.add('visible');
        });
        dot.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

        dot.addEventListener('click', (e) => {
        // 1. SAFETY: If the user actually clicked a SUB-DOT, stop this function
        if (e.target.closest('.piv-sub-dot')) return;

        document.querySelectorAll('.piv-dot, .purple-anchor').forEach(d => {
            d.classList.remove('active');
        });

        document.querySelectorAll('.piv-sub-dot').forEach(sd => {
            sd.classList.remove('selected');
        });

        dot.classList.add('active');

        const targetId = dot.getAttribute('data-target');
        const targetScale = parseFloat(dot.getAttribute('data-scale')) || 0.5;

        if (targetId) {
            moveCameraTo(targetId, targetScale);
        } else {
            console.warn("Navigation failed: No data-target found on this dot.");
        }
        });
    });

    subDots.forEach(sub => {
    // Tooltip listeners (Ensure these are present)
    sub.addEventListener('mouseenter', () => {
        const label = sub.getAttribute('data-label') || "Section";
        mouseTooltip.textContent = label;
        mouseTooltip.classList.add('visible');
    });
    sub.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

    sub.addEventListener('click', (e) => {
        // Prevents the "Professional Identity" dot from re-triggering
        e.stopPropagation();

        // 1. Manage the black "pressed" state
        const parentColumn = sub.closest('.piv-pill-column');
        if (parentColumn) {
            parentColumn.querySelectorAll('.piv-sub-dot').forEach(sd => sd.classList.remove('selected'));
        }
        sub.classList.add('selected');

        // 2. Navigation: Explicitly grab the ID
        const targetId = sub.getAttribute('data-target');
        const targetScale = parseFloat(sub.getAttribute('data-scale')) || 0.6;
        
        console.log("Sub-dot clicked. Targeting:", targetId); // Debugging line

        if (targetId) {
            moveCameraTo(targetId, targetScale);
        }
        });
    });
}