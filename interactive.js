document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // 1. PAGE TRANSITIONS
    // ========================================
    const transitionEl = document.getElementById('page-transition');
    
    // Play enter animation on load
    if (transitionEl) {
        setTimeout(() => {
            transitionEl.classList.remove('is-active');
        }, 300);
    }

    // Intercept internal links
    const internalLinks = document.querySelectorAll('a[href$=".html"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', e => {
            if (link.target === "_blank") return; // Ignore external/new tab links
            e.preventDefault();
            const target = link.href;
            
            if (transitionEl) {
                transitionEl.classList.add('is-active');
                setTimeout(() => {
                    window.location.href = target;
                }, 500); // Matches CSS transition duration
            } else {
                window.location.href = target;
            }
        });
    });

    // ========================================
    // 2. SCROLL PROGRESS BAR
    // ========================================
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        });
    }



    // ========================================
    // 4. PARTICLES.JS INIT
    // ========================================
    if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 60, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#b74b4b" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.1,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } },
                    "push": { "particles_nb": 2 }
                }
            },
            "retina_detect": true
        });
    }

});
