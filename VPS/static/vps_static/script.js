// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');

    if (!navMenu.classList.contains('active')) {
        closeMobileNav();
    }
}

function resetLaneSubmenus() {
    document.querySelectorAll('.dropdown-subgroup').forEach(group => {
        group.classList.remove('active');
    });

    document.querySelectorAll('.dropdown-subtoggle').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
    });
}

function closeMobileNav() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    resetLaneSubmenus();
}

// Header particle animation
function createParticles() {
    const header = document.querySelector('header');
    if (!header) return;

    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    header.appendChild(particleContainer);

    for (let i = 0; i < 20; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';

    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Random animation duration
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';

    container.appendChild(particle);
}

// Initialize header animations on load
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initScrollAnimations();
    initTypingAnimation();
});

// Typing animation helper function
function createTypingAnimation(element, options = {}) {
    if (!element) return;

    const originalText = element.textContent.trim();
    if (!originalText) return;

    const {
        typingSpeed = 100,
        deleteSpeed = 50,
        pauseAfterType = 2000,
        pauseAfterDelete = 500,
        loop = true,
        startDelay = 500
    } = options;

    // Store text and clear element
    element.setAttribute('data-text', originalText);
    element.innerHTML = '';

    let charIndex = 0;
    let isDeleting = false;

    function animate() {
        const fullText = element.getAttribute('data-text');

        if (!isDeleting) {
            // Typing
            if (charIndex < fullText.length) {
                element.innerHTML = fullText.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(animate, typingSpeed);
            } else if (loop) {
                // Finished typing, pause then delete
                isDeleting = true;
                setTimeout(animate, pauseAfterType);
            }
        } else {
            // Deleting
            if (charIndex > 0) {
                charIndex--;
                element.innerHTML = fullText.substring(0, charIndex);
                setTimeout(animate, deleteSpeed);
            } else {
                // Finished deleting, pause then type again
                isDeleting = false;
                setTimeout(animate, pauseAfterDelete);
            }
        }
    }

    // Start animation after delay
    setTimeout(animate, startDelay);
}

// Initialize typing animations for title, subtitle, and nav brand
function initTypingAnimation() {
    const titleText = document.querySelector('.title-text');
    const subtitleText = document.querySelector('header p');
    const navBrand = document.querySelector('.nav-brand');

    // Title animation - repeating
    createTypingAnimation(titleText, {
        typingSpeed: 80,
        deleteSpeed: 40,
        pauseAfterType: 2000,
        pauseAfterDelete: 500,
        loop: true,
        startDelay: 500
    });

    // Subtitle animation - repeating (starts after title begins)
    createTypingAnimation(subtitleText, {
        typingSpeed: 60,
        deleteSpeed: 30,
        pauseAfterType: 3000,
        pauseAfterDelete: 800,
        loop: true,
        startDelay: 2000
    });

    // Nav brand animation - repeating
    if (navBrand) {
        // Store the emoji separately (emojis are multi-character in JS)
        const fullText = navBrand.textContent.trim();
        const chars = Array.from(fullText); // Properly split including emojis
        const emoji = chars[0] + ' '; // "📋 "
        const text = chars.slice(2).join('').trim(); // "VPS Progress"

        navBrand.setAttribute('data-emoji', emoji);
        navBrand.setAttribute('data-text', text);
        navBrand.innerHTML = emoji;

        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deleteSpeed = 50;
        const pauseAfterType = 4000;
        const pauseAfterDelete = 500;

        function animateNavBrand() {
            const emojiPart = navBrand.getAttribute('data-emoji');
            const textPart = navBrand.getAttribute('data-text');

            if (!isDeleting) {
                if (charIndex < textPart.length) {
                    navBrand.innerHTML = emojiPart + textPart.substring(0, charIndex + 1);
                    charIndex++;
                    setTimeout(animateNavBrand, typingSpeed);
                } else {
                    isDeleting = true;
                    setTimeout(animateNavBrand, pauseAfterType);
                }
            } else {
                if (charIndex > 0) {
                    charIndex--;
                    navBrand.innerHTML = emojiPart + textPart.substring(0, charIndex);
                    setTimeout(animateNavBrand, deleteSpeed);
                } else {
                    isDeleting = false;
                    setTimeout(animateNavBrand, pauseAfterDelete);
                }
            }
        }

        setTimeout(animateNavBrand, 1000);
    }
}

// Scroll-triggered animations for cards
function initScrollAnimations() {
    const cards = document.querySelectorAll('.card');

    // Initially hide cards
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach(card => {
        card.classList.remove('animate-in');
        observer.observe(card);
    });
}

// Mobile dropdown toggle
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && e.target.closest('.nav-link')) {
            const wasActive = this.classList.contains('active');
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });

            if (!wasActive) {
                this.classList.add('active');
            }

            resetLaneSubmenus();
            e.stopPropagation();
        }
    });
});

// Lane submenu toggle (tap on mobile, click/focus support on desktop)
document.querySelectorAll('.dropdown-subtoggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
        const subgroup = this.closest('.dropdown-subgroup');
        const willOpen = !subgroup.classList.contains('active');

        if (window.innerWidth > 768) {
            const parentMenu = subgroup.parentElement;
            parentMenu.querySelectorAll('.dropdown-subgroup').forEach(group => {
                if (group !== subgroup) {
                    group.classList.remove('active');
                    const otherToggle = group.querySelector('.dropdown-subtoggle');
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        }

        subgroup.classList.toggle('active', willOpen);
        this.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        e.preventDefault();
        e.stopPropagation();
    });
});

// Reset lane submenu state on desktop switch
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        resetLaneSubmenus();
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('navMenu');
    const mobileToggle = document.querySelector('.mobile-toggle');

    if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileNav();
    }
});

// Smooth scroll with offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 70;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu after clicking
            if (window.innerWidth <= 768) {
                closeMobileNav();
            }
        }
    });
});

// Highlight active section on scroll
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('.card[id]');

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.dropdown-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Copy to clipboard functionality
function copyToClipboard(text, button) {
    // Use Clipboard API for modern browsers
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback(button);
        }).catch(function(err) {
            // Fallback for older browsers
            fallbackCopyToClipboard(text, button);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(text, button);
    }
}

function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyFeedback(button);
    } catch (err) {
        console.error('Failed to copy:', err);
    }

    document.body.removeChild(textArea);
}

function showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(function() {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}

// Add copy buttons to all code blocks (.folder and .code)
document.addEventListener('DOMContentLoaded', function() {
    const codeBlocks = document.querySelectorAll('.folder, pre.code');

    codeBlocks.forEach(function(block) {
        // Skip if already has a copy button
        if (block.querySelector('.copy-btn')) return;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.setAttribute('aria-label', 'Copy code to clipboard');

        copyBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const code = block.textContent.replace('Copy', '').trim();
            copyToClipboard(code, copyBtn);
        });

        // Make sure block has position relative for absolute positioning of button
        if (getComputedStyle(block).position === 'static') {
            block.style.position = 'relative';
        }

        block.appendChild(copyBtn);
    });

    // Create back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);

    // Show/hide back to top button on scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Scroll to top when clicked
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
