// Dev Journal - Animations & Micro-interactions Module

const Animations = {
    // TypeWriter effect
    TypeWriter: {
        type(element, text, options = {}) {
            const speed = options.speed || 50;
            const delay = options.delay || 0;
            const cursor = options.cursor !== false;
            let i = 0;

            if (cursor) {
                element.classList.add('typing-cursor');
            }
            element.textContent = '';

            return new Promise(resolve => {
                setTimeout(() => {
                    const interval = setInterval(() => {
                        element.textContent += text.charAt(i);
                        i++;
                        if (i >= text.length) {
                            clearInterval(interval);
                            if (cursor) {
                                setTimeout(() => element.classList.remove('typing-cursor'), 1500);
                            }
                            if (options.onComplete) options.onComplete();
                            resolve();
                        }
                    }, speed);
                }, delay);
            });
        }
    },

    // Ripple effect on buttons
    initRipples() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn, .btn-primary, .btn-secondary, .btn-danger, .btn-ai, .nav-btn');
            if (!btn) return;

            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);

            ripple.addEventListener('animationend', () => ripple.remove());
        });
    },

    // Staggered entrance for list items
    staggerEntrance(selector, animationClass = 'animate-fadeInUp') {
        const items = document.querySelectorAll(selector);
        items.forEach((item, i) => {
            item.style.opacity = '0';
            item.style.animationDelay = (i * 50) + 'ms';
            item.classList.add(animationClass);
        });
    },

    // Page transition fade
    initPageTransitions() {
        document.body.classList.add('page-loaded');

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript') ||
                link.target === '_blank' || e.ctrlKey || e.metaKey) return;

            e.preventDefault();
            document.body.classList.add('page-exit');

            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    },

    // Toast animation enhancement
    enhanceToast(toast) {
        toast.classList.add('toast-enter');
        setTimeout(() => {
            toast.classList.add('toast-exit');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 2700);
    },

    // Init all animations
    init() {
        this.initRipples();
        this.initPageTransitions();
    }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Animations.init();
});
