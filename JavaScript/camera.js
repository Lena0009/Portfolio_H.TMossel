import { state, canvas, viewport, WORLD_SIZE } from './config.js';
import { updateLines, updateArchiveConnection, updateReflectionLines } from './lines.js';

// 1. Performance Throttler
let isUpdatingLines = false;

export function initCamera() {
    applyStyle();

    viewport.addEventListener('mousedown', (e) => {
        // Allow UI interaction
        if (e.target.closest('.piv-nav-container')) return;

        state.isDragging = true;
        viewport.style.cursor = 'grabbing';
        
        // Capture initial positions
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.originalX = state.currentX;
        state.originalY = state.currentY;

        canvas.style.transition = "none";
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isDragging) return;

        const moveX = e.clientX - state.dragStartX;
        const moveY = e.clientY - state.dragStartY;
    
        // Only disable clicks and move if they move more than 5px (a real drag)
        if (Math.sqrt(moveX*moveX + moveY*moveY) > 5) {
            canvas.style.pointerEvents = 'none'; // Performance boost only when moving
            document.body.classList.add('is-dragging');
            
            state.currentX = state.originalX + moveX;
            state.currentY = state.originalY + moveY;

            checkBounds();
            applyStyle();
        }
    });

    window.addEventListener('mouseup', () => {
        state.isDragging = false;
        canvas.style.pointerEvents = 'auto'; // RE-ENABLE CLICKS
        document.body.classList.remove('is-dragging');
        viewport.style.cursor = 'grab';
    });


    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.100;
        const oldScale = state.scale;
        
        let newScale = e.deltaY < 0 ? state.scale + zoomSpeed : state.scale - zoomSpeed;
        
        const MIN_ZOOM = 0.30; 
        const MAX_ZOOM = 2.0;  
        state.scale = Math.min(Math.max(MIN_ZOOM, newScale), MAX_ZOOM);

        const canvasMouseX = (e.clientX - state.currentX) / oldScale;
        const canvasMouseY = (e.clientY - state.currentY) / oldScale;

        state.currentX = e.clientX - canvasMouseX * state.scale;
        state.currentY = e.clientY - canvasMouseY * state.scale;

        // Smooth zoom transition (only for transform)
        canvas.style.transition = "transform 0.05s linear";
        checkBounds();
        applyStyle();
    }, { passive: false });

}

export function checkBounds() {
    const scaledWidth = 30000 * state.scale;
    const scaledHeight = 20000 * state.scale;

    if (state.currentX > 0) state.currentX = 0;
    if (state.currentY > 0) state.currentY = 0;

    if (state.currentX < window.innerWidth - scaledWidth) {
        state.currentX = window.innerWidth - scaledWidth;
    }
    if (state.currentY < window.innerHeight - scaledHeight) {
        state.currentY = window.innerHeight - scaledHeight;
    }
}

function applyStyle() {
    // Reset legacy properties to prevent conflict
    canvas.style.left = '0';
    canvas.style.top = '0';

    // Apply GPU-accelerated transform
    canvas.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0) scale(${state.scale})`;

    // Throttled line updates
    if (!isUpdatingLines) {
        isUpdatingLines = true;
        requestAnimationFrame(() => {
            updateLines();
            updateArchiveConnection();
            updateReflectionLines();
            updateActiveNavDot();
            isUpdatingLines = false;
        });
    }
}

export function updateActiveNavDot() {
    // 1. Find the exact coordinate on the canvas currently in the center of the screen
    const centerX = (window.innerWidth / 2 - state.currentX) / state.scale;
    const centerY = (window.innerHeight / 2 - state.currentY) / state.scale;

    const dots = document.querySelectorAll('.piv-dot, .piv-sub-dot, .purple-anchor');
    let closestDot = null;
    let minDistance = Infinity;

    // 2. Measure distance from the center of the screen to every target card
    dots.forEach(dot => {
        const targetId = dot.getAttribute('data-target');
        if (!targetId) return;

        const el = document.getElementById(targetId);
        if (!el) return;

        const left = el.dataset.staticX ? parseFloat(el.dataset.staticX) : el.offsetLeft;
        const top = el.dataset.staticY ? parseFloat(el.dataset.staticY) : el.offsetTop;
        
        const targetCenterX = left + (el.offsetWidth / 2);
        const targetCenterY = top + (el.offsetHeight / 2);

        const dx = centerX - targetCenterX;
        const dy = centerY - targetCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            minDistance = distance;
            closestDot = dot;
        }
    });

    // 3. Update the UI for the closest card (Only if reasonably close, e.g., within 3000px)
    if (closestDot && minDistance < 3000) {
        // Skip DOM manipulation if the closest dot is already active
        if (closestDot.classList.contains('active') || closestDot.classList.contains('selected')) {
            // Always ensure the parent pill stays open if a sub-dot is selected
            if (closestDot.classList.contains('piv-sub-dot')) {
                const parentColumn = closestDot.closest('.piv-pill-column');
                if (parentColumn) {
                    const anchor = parentColumn.querySelector('.purple-anchor');
                    if (anchor && !anchor.classList.contains('active')) anchor.classList.add('active');
                }
            }
            return;
        }

        // Remove active state from all nav dots
        document.querySelectorAll('.piv-dot, .purple-anchor').forEach(d => d.classList.remove('active'));
        document.querySelectorAll('.piv-sub-dot').forEach(sd => sd.classList.remove('selected'));

        // Add active state to the new closest dot
        if (closestDot.classList.contains('piv-sub-dot')) {
            closestDot.classList.add('selected');
            // If we selected a top/bottom dot inside the vertical pill, we MUST activate the anchor to keep it open
            const parentColumn = closestDot.closest('.piv-pill-column');
            if (parentColumn) {
                const anchor = parentColumn.querySelector('.purple-anchor');
                if (anchor) anchor.classList.add('active');
            }
        } else {
            closestDot.classList.add('active');
        }
    }
}

/* --- NAVIGATION LOGIC --- */

// --- Updated navigateTo ---
export function navigateTo(location) {
    // Standardize the target ID based on the nav-item clicked
    const targetId = (location === 'piv') ? 'Home-card' : 'project-archive-hub';
    const targetScale = (location === 'piv') ? 1.0 : 0.5;

    // Use our shared, fixed helper
    moveCameraTo(targetId, targetScale);
}


window.navigateTo = navigateTo;

// Shared movement helper exported for other modules
// JavaScript/camera.js

export const moveCameraTo = (targetId, scale) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    // Use the stored World-Space coordinates if they exist
    const left = el.dataset.staticX ? parseFloat(el.dataset.staticX) : el.offsetLeft;
    const top = el.dataset.staticY ? parseFloat(el.dataset.staticY) : el.offsetTop;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate the center of the card
    const targetX = left + (el.offsetWidth / 2);
    const targetY = top + (el.offsetHeight / 2);

    canvas.style.transition = "transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
    
    state.scale = scale;
    state.currentX = centerX - targetX * state.scale;
    state.currentY = centerY - targetY * state.scale;
    
    applyStyle();
    
    setTimeout(() => {
        canvas.style.transition = "none";
    }, 800);
};

/* --- DOT NAVIGATION --- */

export function initPivNav() {
    const mainDots = document.querySelectorAll('.piv-dot');
    const subDots = document.querySelectorAll('.piv-sub-dot');
    const mouseTooltip = document.getElementById('piv-mouse-tooltip');

    window.addEventListener('mousemove', (e) => {

        if (mouseTooltip && mouseTooltip.classList.contains('visible')) {
            mouseTooltip.style.left = `${e.clientX}px`;
            mouseTooltip.style.top = `${e.clientY}px`;
        }
    });

    mainDots.forEach(dot => {
        dot.addEventListener('mouseenter', () => {
            if (dot.classList.contains('active')) return;
            mouseTooltip.textContent = dot.getAttribute('data-label');
            mouseTooltip.classList.add('visible');
        });
        dot.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

        dot.addEventListener('click', (e) => {
            if (e.target.closest('.piv-sub-dot')) return;

            mouseTooltip.classList.remove('visible');

            document.querySelectorAll('.piv-dot, .purple-anchor').forEach(d => d.classList.remove('active'));
            document.querySelectorAll('.piv-sub-dot').forEach(sd => sd.classList.remove('selected'));

            dot.classList.add('active');
            const targetId = dot.getAttribute('data-target');
            const targetScale = parseFloat(dot.getAttribute('data-scale')) || 0.5;

            if (targetId) moveCameraTo(targetId, targetScale);
        });
    });

    subDots.forEach(sub => {
        sub.addEventListener('mouseenter', () => {
            if (sub.classList.contains('selected')) return;
            mouseTooltip.textContent = sub.getAttribute('data-label') || "Section";
            mouseTooltip.classList.add('visible');
        });
        sub.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

        sub.addEventListener('click', (e) => {
            e.stopPropagation();
            mouseTooltip.classList.remove('visible');
            const parentColumn = sub.closest('.piv-pill-column');
            if (parentColumn) {
                parentColumn.querySelectorAll('.piv-sub-dot').forEach(sd => sd.classList.remove('selected'));
            }
            sub.classList.add('selected');

            const targetId = sub.getAttribute('data-target');
            const targetScale = parseFloat(sub.getAttribute('data-scale')) || 0.6;
            
            if (targetId) moveCameraTo(targetId, targetScale);
        });
    });
}