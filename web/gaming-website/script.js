// Lucy Games - Fun Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // CTA button smooth scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const gamesSection = document.querySelector('#games');
            if (gamesSection) {
                gamesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Header background opacity on scroll - REMOVED to prevent header movement
    // const header = document.querySelector('.header');
    // window.addEventListener('scroll', function() {
    //     const scrolled = window.pageYOffset;
    //     const rate = scrolled * -0.5;
    //     
    //     if (scrolled > 50) {
    //         header.style.background = 'rgba(255, 255, 255, 0.98)';
    //         header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
    //     } else {
    //         header.style.background = 'rgba(255, 255, 255, 0.95)';
    //         header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    //     }
    // });

    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const finalValue = stat.textContent;
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateNumber(stat, finalValue);
                }
            }
        });
    };

    // Number animation function
    function animateNumber(element, finalValue) {
        const isPercentage = finalValue.includes('%');
        const isPlus = finalValue.includes('+');
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        let currentValue = 0;
        const increment = Math.ceil(numericValue / 50);
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            
            let displayValue = currentValue.toString();
            if (isPercentage) displayValue += '%';
            if (isPlus) displayValue += '+';
            
            element.textContent = displayValue;
        }, 30);
    }

    // Scroll event listener for stats animation
    window.addEventListener('scroll', animateStats);

    // Game card hover effects
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Mobile menu toggle (for future mobile menu implementation)
    let mobileMenuOpen = false;
    
    // Add mobile menu button if screen is small
    function checkMobileMenu() {
        const nav = document.querySelector('.nav');
        const header = document.querySelector('.header .container');
        
        if (window.innerWidth <= 768) {
            if (!document.querySelector('.mobile-menu-btn')) {
                const mobileBtn = document.createElement('button');
                mobileBtn.className = 'mobile-menu-btn';
                mobileBtn.innerHTML = '☰';
                mobileBtn.style.cssText = `
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #333;
                    cursor: pointer;
                    display: block;
                `;
                
                mobileBtn.addEventListener('click', function() {
                    mobileMenuOpen = !mobileMenuOpen;
                    nav.style.display = mobileMenuOpen ? 'flex' : 'none';
                    nav.style.flexDirection = 'column';
                    nav.style.position = 'absolute';
                    nav.style.top = '100%';
                    nav.style.left = '0';
                    nav.style.right = '0';
                    nav.style.background = 'white';
                    nav.style.padding = '1rem';
                    nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                });
                
                header.appendChild(mobileBtn);
            }
        } else {
            const mobileBtn = document.querySelector('.mobile-menu-btn');
            if (mobileBtn) {
                mobileBtn.remove();
                nav.style.display = 'flex';
                nav.style.flexDirection = 'row';
                nav.style.position = 'static';
                nav.style.background = 'none';
                nav.style.padding = '0';
                nav.style.boxShadow = 'none';
            }
        }
    }

    // Check mobile menu on load and resize
    checkMobileMenu();
    window.addEventListener('resize', checkMobileMenu);

    // Lazy loading for game previews
    const gameImages = document.querySelectorAll('.game-image');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const gameImage = entry.target;
                gameImage.style.opacity = '1';
                gameImage.style.transform = 'scale(1)';
                observer.unobserve(gameImage);
            }
        });
    });

    gameImages.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        imageObserver.observe(img);
    });

    // Add loading animation to play buttons
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                
                // Reset after 2 seconds (in case the page doesn't navigate)
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.textContent = originalText;
                }, 2000);
            }
        });
    });

    // Add CSS for loading state
    const style = document.createElement('style');
    style.textContent = `
        .play-btn.loading {
            opacity: 0.7;
            cursor: wait;
            pointer-events: none;
        }
        
        @media (max-width: 768px) {
            .nav {
                gap: 0.5rem;
            }
            
            .nav a {
                padding: 0.5rem;
                border-bottom: 1px solid #eee;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize AdSense (placeholder for when you get approved)
    function initializeAds() {
        // This will be called when you have actual AdSense approval
        try {
            if (typeof adsbygoogle !== 'undefined') {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.log('AdSense not yet configured');
        }
    }

    // Call ad initialization after a delay
    setTimeout(initializeAds, 1000);

    // Analytics placeholder (for future Google Analytics integration)
    function trackEvent(category, action, label) {
        // Placeholder for analytics tracking
        console.log(`Analytics: ${category} - ${action} - ${label}`);
        
        // When you add Google Analytics, replace with:
        // gtag('event', action, {
        //     event_category: category,
        //     event_label: label
        // });
    }

    // Track game plays
    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const gameName = this.closest('.game-card').querySelector('h3').textContent;
            trackEvent('Games', 'Play', gameName);
        });
    });

    // Track contact clicks
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('Contact', 'Email Click', 'Footer Contact');
        });
    });

    console.log('🐰 Lucy Games - Fun for Everyone!');
});
