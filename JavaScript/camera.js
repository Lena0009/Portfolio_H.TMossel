import { state, canvas, viewport, WORLD_SIZE } from './config.js';
import { updateLines } from './lines.js';

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
            isUpdatingLines = false;
        });
    }
}

/* --- NAVIGATION LOGIC --- */

export function navigateTo(location) {
    let targetScale;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Helper to find absolute world position of any card
    const getTargetPos = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        let left = 0, top = 0, current = el;
        while (current && current.id !== 'canvas') {
            left += current.offsetLeft || 0;
            top += current.offsetTop || 0;
            current = current.offsetParent;
        }
        return { 
            x: left + (el.offsetWidth / 2), 
            y: top + (el.offsetHeight / 2) 
        };
    };

    let targetCoord;
    if (location === 'piv') {
        targetCoord = getTargetPos('Home-card');
        targetScale = 1.0;
    } else if (location === 'archive') {
        targetCoord = getTargetPos('project-archive-hub');
        targetScale = 0.5;
    }

    if (!targetCoord) return;

    // RESTORE THE VIEW
    canvas.style.transition = "transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
    
    state.scale = targetScale;
    state.currentX = centerX - targetCoord.x * state.scale;
    state.currentY = centerY - targetCoord.y * state.scale;

    applyStyle();

    setTimeout(() => {
        canvas.style.transition = "none";
        // CRITICAL: re-enable pointer events if you disabled them during drag
        canvas.style.pointerEvents = "auto"; 
    }, 800);
}
window.navigateTo = navigateTo;

// Shared movement helper exported for other modules
export const moveCameraTo = (targetId, scale) => {
    const el = document.getElementById(targetId);
    if (!el) return;

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

    // Set transition ONLY for transform
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
            mouseTooltip.textContent = dot.getAttribute('data-label');
            mouseTooltip.classList.add('visible');
        });
        dot.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

        dot.addEventListener('click', (e) => {
            if (e.target.closest('.piv-sub-dot')) return;

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
            mouseTooltip.textContent = sub.getAttribute('data-label') || "Section";
            mouseTooltip.classList.add('visible');
        });
        sub.addEventListener('mouseleave', () => mouseTooltip.classList.remove('visible'));

        sub.addEventListener('click', (e) => {
            e.stopPropagation();
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