/**
 * ZenRaid Ultimate - JavaScript (FIXED VERSION)
 * Spotlight Bug Fixes Applied
 */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const scrollTopBtn = document.getElementById('scrollTop');
    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    const formFeedback = document.getElementById('formFeedback');

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    
    let lastScroll = 0;
    
    function handleNavbarScroll() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }
    
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });

    // ============================================
    // MOBILE MENU
    // ============================================
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        mobileMenuClose.focus();
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        mobileMenuBtn.focus();
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    // Close menu on link click
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    
    function handleScrollTopVisibility() {
        if (window.scrollY > 500) {
            scrollTopBtn.hidden = false;
        } else {
            scrollTopBtn.hidden = true;
        }
    }
    
    if (scrollTopBtn) {
        window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in, .tier-section, .rank-card-full, .benefit-card-large').forEach(el => {
        fadeObserver.observe(el);
    });

    // ============================================
    // NEWSLETTER FORM WITH CLOUDFLARE D1
    // ============================================
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            // Validation
            if (!email || !isValidEmail(email)) {
                showFeedback('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            setLoading(true);
            
            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // New subscription
                    showFeedback("🎉 You're on the list! Watch your inbox for updates.", 'success');
                    emailInput.value = '';
                    if (data.count !== undefined) {
                        animateCounter(document.getElementById('subscriberCount'), data.count);
                    }
                } else if (response.status === 409) {
                    // Already subscribed
                    showFeedback('📧 You\'re already on the list!', 'info');
                } else {
                    showFeedback('⚠️ ' + (data.error || 'Something went wrong. Please try again.'), 'error');
                }
            } catch (error) {
                console.log('API error:', error);
                showFeedback('⚠️ Something went wrong. Please try again.', 'error');
            }
            
            setLoading(false);
        });
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function showFeedback(message, type) {
        if (formFeedback) {
            formFeedback.textContent = message;
            formFeedback.className = 'newsletter-note ' + type;
        }
    }
    
    function setLoading(isLoading) {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.classList.toggle('loading', isLoading);
        }
    }
    
    async function updateSubscriberCount() {
        const countElement = document.getElementById('subscriberCount');
        if (!countElement) return;
        
        try {
            const response = await fetch('/api/subscribe');
            const data = await response.json();
            if (data.count !== undefined) {
                animateCounter(countElement, data.count);
            }
        } catch (error) {
            console.log('Count fetch error:', error);
        }
    }
    
    // Load subscriber count on page load
    updateSubscriberCount();
    
    function animateCounter(element, target) {
        const start = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * easeOutQuart);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ============================================
    // PARTICLE ANIMATION
    // ============================================
    
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(0, 229, 255, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
        
        // Add keyframes if not already present
        if (!document.querySelector('#particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.textContent = `
                @keyframes floatParticle {
                    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize particles on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createParticles);
    } else {
        createParticles();
    }

    // ============================================
    // PRODUCT CARD TILT EFFECT
    // ============================================
    
    function initTiltEffect() {
        const tiltCards = document.querySelectorAll('[data-tilt]');
        
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
    
    initTiltEffect();

    // ============================================
    // STAT COUNTER ANIMATION ON SCROLL
    // ============================================
    
    function initStatCounters() {
        const statItems = document.querySelectorAll('.stat-item[data-count]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    const numberElement = entry.target.querySelector('.stat-number');
                    
                    if (numberElement && !entry.target.dataset.counted) {
                        entry.target.dataset.counted = 'true';
                        animateStatCounter(numberElement, target);
                    }
                }
            });
        }, { threshold: 0.5 });
        
        statItems.forEach(item => counterObserver.observe(item));
    }
    
    function animateStatCounter(element, target) {
        const suffix = element.textContent.replace(/[0-9]/g, '');
        const duration = 2000;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    initStatCounters();

    // ============================================
    // KEYBOARD NAVIGATION IMPROVEMENTS
    // ============================================
    
    // Focus visible for keyboard users
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });

    // ============================================
    // PRELOAD CRITICAL IMAGES
    // ============================================
    
    function preloadImages() {
        const criticalImages = [
            'assets/zenraid_pistol_model.png',
            'assets/zenraid_logo.png'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    preloadImages();

    // ============================================
    // SPOTLIGHT EFFECT FOR RANK CARDS - FIXED VERSION
    // Each tier has its own color!
    // ============================================
    
    function initSpotlightEffect() {
        const rankCards = document.querySelectorAll('.rank-card-full, .rank-card');
        
        // Tier color mapping - vibrant colors for spotlight
        const tierColors = {
            5: 'rgba(255, 215, 0, 0.35)',      // Gold
            4: 'rgba(179, 102, 255, 0.35)',    // Purple
            3: 'rgba(0, 150, 255, 0.35)',      // Blue
            2: 'rgba(0, 255, 136, 0.35)',      // Green
            1: 'rgba(136, 136, 136, 0.25)'     // Gray
        };
        
        rankCards.forEach(card => {
            // Find which tier this card belongs to by checking parent elements
            let tierNumber = 1; // Default
            
            // Look for parent with tier-section OR rank-tier class (both used in different pages)
            let parent = card.parentElement;
            while (parent && !parent.classList.contains('tier-section') && !parent.classList.contains('rank-tier')) {
                parent = parent.parentElement;
            }
            
            // If we found a tier container, check which tier it is
            if (parent && (parent.classList.contains('tier-section') || parent.classList.contains('rank-tier'))) {
                for (let i = 5; i >= 1; i--) {
                    if (parent.classList.contains(`tier-${i}`)) {
                        tierNumber = i;
                        break;
                    }
                }
            }
            
            // Fallback: check any parent with tier-* class
            if (tierNumber === 1) {
                parent = card.parentElement;
                while (parent) {
                    if (parent.classList) {
                        for (let i = 5; i >= 1; i--) {
                            if (parent.classList.contains(`tier-${i}`)) {
                                tierNumber = i;
                                break;
                            }
                        }
                    }
                    if (tierNumber !== 1) break;
                    parent = parent.parentElement;
                }
            }
            
            // Set the spotlight color for this card
            const spotlightColor = tierColors[tierNumber];
            card.style.setProperty('--spotlight-color', spotlightColor);
            card.dataset.tier = tierNumber; // Store for debugging
            
            // Initialize mouse position OFF-SCREEN so no glow appears by default
            card.style.setProperty('--mouse-x', '-1000px');
            card.style.setProperty('--mouse-y', '-1000px');
            
            // Mouse move handler - update spotlight position
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
            
            // Reset on mouse leave - move spotlight OFF-SCREEN
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--mouse-x', '-1000px');
                card.style.setProperty('--mouse-y', '-1000px');
            });
        });
    }
    
    // Initialize spotlight effect
    initSpotlightEffect();

    // ============================================
    // CONSOLE EASTER EGG
    // ============================================
    
    console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   ███████╗███████╗███╗   ██╗██████╗       ║
    ║   ╚══███╔╝██╔════╝████╗  ██║██╔══██╗      ║
    ║     ███╔╝ █████╗  ██╔██╗ ██║██████╔╝      ║
    ║    ███╔╝  ██╔══╝  ██║╚██╗██║██╔══██╗      ║
    ║   ███████╗███████╗██║ ╚████║██║  ██║      ║
    ║   ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝      ║
    ║                                           ║
    ║   RAID                                    ║
    ║                                           ║
    ║   Tactical Water Combat Gaming            ║
    ║   🔫 💧 🎮                                 ║
    ║                                           ║
    ║   Want to join the raid?                  ║
    ║   https://zenraid.com                     ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);

})();
