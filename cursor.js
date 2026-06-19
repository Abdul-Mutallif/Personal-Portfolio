document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Logic
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    
    if (!cursorDot || !cursorOutline) return;

    // Check if device supports touch/pointer (disable custom cursor on mobile)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (isTouchDevice) {
        cursorDot.style.display = 'none';
        cursorOutline.style.display = 'none';
        return;
    }

    // Variables to track mouse position and cursor position
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let isHovering = false;
    let ticking = false;

    // Follow mouse
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant update for the dot, preserving the -50% centering
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        // Start animation loop for outline if not already running
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateCursorOutline);
        }
    });

    function updateCursorOutline() {
        // Easing factor
        const ease = 0.15;
        
        outlineX += (mouseX - outlineX) * ease;
        outlineY += (mouseY - outlineY) * ease;
        
        cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

        // Continue looping if it hasn't caught up yet
        if (Math.abs(mouseX - outlineX) > 0.1 || Math.abs(mouseY - outlineY) > 0.1) {
            requestAnimationFrame(updateCursorOutline);
        } else {
            ticking = false;
        }
    }

    // Event delegation for hover effect on clickable elements
    document.body.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .project-card, .achievement-detail-card, .menu-toggle, .terminal-toggle-btn');
        if (target && !isHovering) {
            isHovering = true;
            cursorOutline.classList.add('cursor-hover');
            cursorDot.classList.add('cursor-hover');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, .project-card, .achievement-detail-card, .menu-toggle, .terminal-toggle-btn');
        if (target) {
            // Check if the mouse is actually leaving the element
            const related = e.relatedTarget;
            if (!related || !target.contains(related)) {
                isHovering = false;
                cursorOutline.classList.remove('cursor-hover');
                cursorDot.classList.remove('cursor-hover');
            }
        }
    });
});
