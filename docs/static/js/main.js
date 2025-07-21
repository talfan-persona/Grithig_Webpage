// Y Grithig Website - Main JavaScript

// DOM ready function
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading animation to external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            this.style.opacity = '0.7';
            this.innerHTML += ' <small>(loading...)</small>';
        });
    });
    
    // Enhanced track card interactions
    const trackCards = document.querySelectorAll('.track-card');
    trackCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add fade-in animation to page content
    const pageContent = document.querySelector('.page-content');
    if (pageContent) {
        pageContent.style.opacity = '0';
        pageContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            pageContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            pageContent.style.opacity = '1';
            pageContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Navigation active state management
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
    
    // Add download tracking for GPX files
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add visual feedback
            this.style.background = '#2c5530';
            this.innerHTML = 'Downloading...';
            
            // Reset after download
            setTimeout(() => {
                this.style.background = '#4a7c59';
                this.innerHTML = 'Download GPX';
            }, 2000);
            
            // Analytics could be added here
            console.log('GPX file downloaded:', this.getAttribute('href'));
        });
    });
    
    // Mobile menu optimization
    function optimizeForMobile() {
        if (window.innerWidth <= 768) {
            // Add mobile-specific optimizations
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.style.fontSize = '0.9rem';
            }
            
            // Reduce track card hover effects on mobile
            trackCards.forEach(card => {
                card.style.transition = 'none';
            });
        }
    }
    
    // Run on load and resize
    optimizeForMobile();
    window.addEventListener('resize', optimizeForMobile);
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key to close any modals/overlays
        if (e.key === 'Escape') {
            const overlays = document.querySelectorAll('.overlay, .modal');
            overlays.forEach(overlay => {
                if (overlay.style.display !== 'none') {
                    overlay.style.display = 'none';
                }
            });
        }
    });
    
    // Performance: Lazy load images that might be below fold
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Add print styles handler
    window.addEventListener('beforeprint', function() {
        // Hide navigation for printing
        const nav = document.querySelector('nav');
        if (nav) nav.style.display = 'none';
    });
    
    window.addEventListener('afterprint', function() {
        // Restore navigation after printing
        const nav = document.querySelector('nav');
        if (nav) nav.style.display = 'block';
    });
    
});

// Utility functions
const YGrithig = {
    // Smooth scroll to element
    scrollTo: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    // Show notification (could be used for contact forms, etc.)
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4a7c59' : '#2c5530'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Make utility available globally
window.YGrithig = YGrithig; 