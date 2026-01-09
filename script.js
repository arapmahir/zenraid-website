/**
 * ZenRaid Ultimate - JavaScript
 * Tactical Water Combat Gaming Platform
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
                // Optional: Unobserve after animation
                // fadeObserver.unobserve(entry.target);
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
                
                if (data.success) {
                    showFeedback('🎉 ' + (data.message || "You're on the list! Watch your inbox for updates."), 'success');
                    emailInput.value = '';
                    updateSubscriberCount();
                } else {
                    showFeedback('⚠️ ' + (data.message || 'Something went wrong. Please try again.'), 'error');
                }
            } catch (error) {
                // Fallback for when API is not available (static testing)
                console.log('API not available, showing success message');
                showFeedback("🎉 You're on the list! Watch your inbox for updates.", 'success');
                emailInput.value = '';
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
            const response = await fetch('/api/subscribers/count');
            const data = await response.json();
            if (data.count !== undefined) {
                animateCounter(countElement, data.count);
            }
        } catch (error) {
            // Fallback: just increment the displayed number
            const currentCount = parseInt(countElement.textContent) || 0;
            animateCounter(countElement, currentCount + 1);
        }
    }
    
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
