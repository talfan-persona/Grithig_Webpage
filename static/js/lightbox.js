// Lightbox functionality for Gallery page

class Lightbox {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.lightboxElement = null;
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Create lightbox HTML structure
        this.createLightboxHTML();
        
        // Find all gallery images
        this.images = Array.from(document.querySelectorAll('.gallery-image'));
        
        // Add click handlers to gallery images
        this.images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(index);
            });
            
            // Add keyboard accessibility
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.open(index);
                }
            });
            
            // Make images focusable for accessibility
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', `View ${img.alt || 'image'} in lightbox`);
        });
        
        // Add event listeners
        this.addEventListeners();
    }
    
    createLightboxHTML() {
        const lightboxHTML = `
            <div id="lightbox" class="lightbox">
                <div class="lightbox-content">
                    <div class="lightbox-close">&times;</div>
                    <div class="lightbox-counter">
                        <span id="current-index">1</span> / <span id="total-images">1</span>
                    </div>
                    <div class="lightbox-nav lightbox-prev">&#8249;</div>
                    <div class="lightbox-nav lightbox-next">&#8250;</div>
                    <div class="lightbox-loading">
                        <div class="spinner"></div>
                        Loading...
                    </div>
                    <img id="lightbox-image" class="lightbox-image" alt="" style="display: none;">
                    <div id="lightbox-caption" class="lightbox-caption" style="display: none;"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.lightboxElement = document.getElementById('lightbox');
    }
    
    addEventListeners() {
        // Close button
        const closeBtn = this.lightboxElement.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Navigation buttons
        const prevBtn = this.lightboxElement.querySelector('.lightbox-prev');
        const nextBtn = this.lightboxElement.querySelector('.lightbox-next');
        
        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());
        
        // Click outside to close
        this.lightboxElement.addEventListener('click', (e) => {
            if (e.target === this.lightboxElement) {
                this.close();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            
            switch(e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        });
        
        // Touch/swipe support for mobile
        this.addTouchSupport();
        
        // Prevent page scroll when lightbox is open
        this.lightboxElement.addEventListener('wheel', (e) => {
            e.preventDefault();
        });
    }
    
    addTouchSupport() {
        let startX = null;
        let startY = null;
        
        this.lightboxElement.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.lightboxElement.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        });
        
        this.lightboxElement.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if it's a horizontal swipe (not vertical)
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) { // Minimum swipe distance
                    if (diffX > 0) {
                        this.next(); // Swipe left = next
                    } else {
                        this.prev(); // Swipe right = previous
                    }
                }
            }
            
            startX = null;
            startY = null;
        });
    }
    
    open(index) {
        if (this.images.length === 0) return;
        
        this.currentIndex = index;
        this.isOpen = true;
        
        // Show lightbox
        this.lightboxElement.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Load and display image
        this.loadImage();
        
        // Update counter
        this.updateCounter();
        
        // Add zoom-in animation
        const content = this.lightboxElement.querySelector('.lightbox-content');
        content.classList.add('zoom-in');
        
        // Focus on lightbox for accessibility
        this.lightboxElement.focus();
        
        // Hide navigation arrows if only one image
        this.updateNavigation();
    }
    
    close() {
        this.isOpen = false;
        this.lightboxElement.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Clear zoom animation class
        const content = this.lightboxElement.querySelector('.lightbox-content');
        content.classList.remove('zoom-in');
        
        // Return focus to the trigger image
        if (this.images[this.currentIndex]) {
            this.images[this.currentIndex].focus();
        }
    }
    
    next() {
        if (this.images.length <= 1) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.loadImage();
        this.updateCounter();
    }
    
    prev() {
        if (this.images.length <= 1) return;
        
        this.currentIndex = this.currentIndex === 0 
            ? this.images.length - 1 
            : this.currentIndex - 1;
        this.loadImage();
        this.updateCounter();
    }
    
    loadImage() {
        const img = this.images[this.currentIndex];
        const lightboxImg = document.getElementById('lightbox-image');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const loadingDiv = this.lightboxElement.querySelector('.lightbox-loading');
        
        // Show loading, hide image and caption
        loadingDiv.style.display = 'block';
        lightboxImg.style.display = 'none';
        lightboxCaption.style.display = 'none';
        
        // Create new image to preload
        const newImg = new Image();
        
        newImg.onload = () => {
            // Image loaded successfully
            lightboxImg.src = newImg.src;
            lightboxImg.alt = img.alt || '';
            
            // Handle caption
            const caption = img.getAttribute('data-title') || 
                          img.closest('.gallery-item')?.querySelector('.gallery-caption')?.textContent || 
                          '';
            
            if (caption.trim()) {
                lightboxCaption.textContent = caption;
                lightboxCaption.style.display = 'block';
            } else {
                lightboxCaption.style.display = 'none';
            }
            
            // Hide loading, show image
            loadingDiv.style.display = 'none';
            lightboxImg.style.display = 'block';
        };
        
        newImg.onerror = () => {
            // Error loading image
            loadingDiv.innerHTML = '<p style="color: white;">Error loading image</p>';
            console.error('Error loading image:', img.src);
        };
        
        // Start loading
        newImg.src = img.src;
    }
    
    updateCounter() {
        const currentSpan = document.getElementById('current-index');
        const totalSpan = document.getElementById('total-images');
        
        currentSpan.textContent = this.currentIndex + 1;
        totalSpan.textContent = this.images.length;
    }
    
    updateNavigation() {
        const prevBtn = this.lightboxElement.querySelector('.lightbox-prev');
        const nextBtn = this.lightboxElement.querySelector('.lightbox-next');
        
        if (this.images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
    }
}

// Initialize lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on gallery page
    if (document.querySelector('.gallery-grid')) {
        new Lightbox();
    }
});

// Utility function for external use
window.openLightbox = function(index = 0) {
    if (window.lightboxInstance) {
        window.lightboxInstance.open(index);
    }
};

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Lightbox;
} 