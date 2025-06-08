/**
 * Product Review Page JavaScript
 * Handles gallery navigation, cart management, mobile menu, and accessibility features
 */

class ProductReviewPage {
    constructor() {
        // Product data
        this.product = {
            id: 1,
            name: 'Fall Limited Edition Sneakers',
            price: 125.00,
            images: [
                '../../images/image-product-1-thumbnail.jpg',
                '../../images/image-product-2-thumbnail.jpg',
                '../../images/image-product-3-thumbnail.jpg',
                '../../images/image-product-4-thumbnail.jpg'
            ],
            largeImages: [
                '../../images/image-product-1.jpg',
                '../../images/image-product-2.jpg',
                '../../images/image-product-3.jpg',
                '../../images/image-product-4.jpg'
            ]
        };

        // State
        this.currentImageIndex = 0;
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.isMobileMenuOpen = false;
        this.isCartDropdownOpen = false;
        this.isLightboxOpen = false;

        // DOM elements
        this.elements = this.initializeElements();

        // Initialize features
        this.initializeEventListeners();
        this.updateCartUI();
        this.setInitialFocus();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        return {
            // Navigation
            mobileMenuBtn: document.querySelector('.nav__menu-btn'),
            mobileMenu: document.querySelector('.nav__mobile-menu'),
            mobileOverlay: document.querySelector('.nav__mobile-overlay'),
            mobileCloseBtn: document.querySelector('.nav__mobile-close'),
            cartBtn: document.querySelector('.nav__cart-btn'),
            cartCount: document.querySelector('.nav__cart-count'),
            cartDropdown: document.querySelector('.cart-dropdown'),

            // Gallery
            galleryImage: document.querySelector('.gallery__image'),
            galleryPrevBtn: document.querySelector('.gallery__nav--prev'),
            galleryNextBtn: document.querySelector('.gallery__nav--next'),
            galleryThumbnails: document.querySelectorAll('.gallery__thumbnail'),
            galleryMain: document.querySelector('.gallery__main'),

            // Product actions
            quantityInput: document.querySelector('.quantity-selector__input'),
            quantityMinusBtn: document.querySelector('.quantity-selector__btn--minus'),
            quantityPlusBtn: document.querySelector('.quantity-selector__btn--plus'),
            addToCartBtn: document.querySelector('.product__add-to-cart'),
            errorMessage: document.querySelector('.error-message'),

            // Lightbox
            lightbox: document.querySelector('.lightbox'),
            lightboxImage: document.querySelector('.lightbox__image'),
            lightboxCloseBtn: document.querySelector('.lightbox__close'),
            lightboxPrevBtn: document.querySelector('.lightbox__nav--prev'),
            lightboxNextBtn: document.querySelector('.lightbox__nav--next'),
            lightboxThumbnails: document.querySelectorAll('.lightbox__thumbnail'),
            lightboxOverlay: document.querySelector('.lightbox__overlay'),

            // Cart
            cartEmpty: document.querySelector('.cart-dropdown__empty'),
            cartItems: document.querySelector('.cart-dropdown__items'),

            // Accessibility
            announcements: document.getElementById('announcements')
        };
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Mobile menu
        this.elements.mobileMenuBtn?.addEventListener('click', () => this.toggleMobileMenu());
        this.elements.mobileCloseBtn?.addEventListener('click', () => this.closeMobileMenu());
        this.elements.mobileOverlay?.addEventListener('click', () => this.closeMobileMenu());

        // Cart dropdown
        this.elements.cartBtn?.addEventListener('click', () => this.toggleCartDropdown());
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Gallery navigation
        this.elements.galleryPrevBtn?.addEventListener('click', () => this.previousImage());
        this.elements.galleryNextBtn?.addEventListener('click', () => this.nextImage());
        this.elements.galleryMain?.addEventListener('click', () => this.openLightbox());

        // Gallery thumbnails
        this.elements.galleryThumbnails?.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => this.selectImage(index));
            thumbnail.addEventListener('keydown', (e) => this.handleThumbnailKeydown(e, index));
        });

        // Quantity controls
        this.elements.quantityMinusBtn?.addEventListener('click', () => this.decreaseQuantity());
        this.elements.quantityPlusBtn?.addEventListener('click', () => this.increaseQuantity());
        this.elements.quantityInput?.addEventListener('input', () => this.validateQuantity());
        this.elements.quantityInput?.addEventListener('blur', () => this.validateQuantity());

        // Add to cart
        this.elements.addToCartBtn?.addEventListener('click', () => this.addToCart());

        // Lightbox
        this.elements.lightboxCloseBtn?.addEventListener('click', () => this.closeLightbox());
        this.elements.lightboxOverlay?.addEventListener('click', () => this.closeLightbox());
        this.elements.lightboxPrevBtn?.addEventListener('click', () => this.previousImage(true));
        this.elements.lightboxNextBtn?.addEventListener('click', () => this.nextImage(true));

        // Lightbox thumbnails
        this.elements.lightboxThumbnails?.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => this.selectImage(index, true));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Touch gestures for mobile gallery
        this.initializeTouchGestures();

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        // Escape key
        if (e.key === 'Escape') {
            if (this.isLightboxOpen) {
                this.closeLightbox();
            } else if (this.isCartDropdownOpen) {
                this.closeCartDropdown();
            } else if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        }

        // Arrow keys for gallery navigation
        if (this.isLightboxOpen) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousImage(true);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextImage(true);
            }
        }
    }

    /**
     * Handle thumbnail keyboard navigation
     */
    handleThumbnailKeydown(e, index) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectImage(index);
        }
    }

    /**
     * Mobile menu management
     */
    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
        this.updateMobileMenuUI();
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
        this.updateMobileMenuUI();
    }

    updateMobileMenuUI() {
        const { mobileMenu, mobileOverlay, mobileMenuBtn } = this.elements;

        if (this.isMobileMenuOpen) {
            mobileMenu?.classList.add('nav__mobile-menu--active');
            mobileOverlay?.classList.add('nav__mobile-overlay--active');
            mobileMenuBtn?.setAttribute('aria-expanded', 'true');
            mobileMenu?.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus first menu item
            const firstLink = mobileMenu?.querySelector('.nav__mobile-link');
            firstLink?.focus();
        } else {
            mobileMenu?.classList.remove('nav__mobile-menu--active');
            mobileOverlay?.classList.remove('nav__mobile-overlay--active');
            mobileMenuBtn?.setAttribute('aria-expanded', 'false');
            mobileMenu?.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Return focus to menu button
            mobileMenuBtn?.focus();
        }
    }

    /**
     * Cart dropdown management
     */
    toggleCartDropdown() {
        this.isCartDropdownOpen = !this.isCartDropdownOpen;
        this.updateCartDropdownUI();
    }

    closeCartDropdown() {
        this.isCartDropdownOpen = false;
        this.updateCartDropdownUI();
    }

    updateCartDropdownUI() {
        const { cartDropdown, cartBtn } = this.elements;

        if (this.isCartDropdownOpen) {
            cartDropdown?.classList.add('cart-dropdown--active');
            cartDropdown?.setAttribute('aria-hidden', 'false');
        } else {
            cartDropdown?.classList.remove('cart-dropdown--active');
            cartDropdown?.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Handle clicks outside dropdowns
     */
    handleOutsideClick(e) {
        const { cartDropdown, cartBtn } = this.elements;

        if (this.isCartDropdownOpen && 
            !cartDropdown?.contains(e.target) && 
            !cartBtn?.contains(e.target)) {
            this.closeCartDropdown();
        }
    }

    /**
     * Gallery navigation
     */
    selectImage(index, isLightbox = false) {
        this.currentImageIndex = index;
        this.updateGalleryUI(isLightbox);
        this.announceImageChange(index);
    }

    previousImage(isLightbox = false) {
        this.currentImageIndex = this.currentImageIndex === 0 
            ? this.product.images.length - 1 
            : this.currentImageIndex - 1;
        this.updateGalleryUI(isLightbox);
        this.announceImageChange(this.currentImageIndex);
    }

    nextImage(isLightbox = false) {
        this.currentImageIndex = this.currentImageIndex === this.product.images.length - 1 
            ? 0 
            : this.currentImageIndex + 1;
        this.updateGalleryUI(isLightbox);
        this.announceImageChange(this.currentImageIndex);
    }

    updateGalleryUI(isLightbox = false) {
        const imageElement = isLightbox ? this.elements.lightboxImage : this.elements.galleryImage;
        const thumbnails = isLightbox ? this.elements.lightboxThumbnails : this.elements.galleryThumbnails;
        const images = isLightbox ? this.product.largeImages : this.product.images;

        // Update main image
        if (imageElement) {
            imageElement.src = images[this.currentImageIndex];
            imageElement.alt = `Fall Limited Edition Sneakers - View ${this.currentImageIndex + 1}`;
        }

        // Update thumbnail states
        thumbnails?.forEach((thumbnail, index) => {
            const isActive = index === this.currentImageIndex;
            const activeClass = isLightbox ? 'lightbox__thumbnail--active' : 'gallery__thumbnail--active';
            
            if (isActive) {
                thumbnail.classList.add(activeClass);
                thumbnail.setAttribute('aria-selected', 'true');
            } else {
                thumbnail.classList.remove(activeClass);
                thumbnail.setAttribute('aria-selected', 'false');
            }
        });
    }

    announceImageChange(index) {
        const message = `Image ${index + 1} of ${this.product.images.length} selected`;
        this.announceToScreenReader(message);
    }

    /**
     * Lightbox management
     */
    openLightbox() {
        // Only open lightbox on desktop
        if (window.innerWidth < 768) return;

        this.isLightboxOpen = true;
        this.elements.lightbox?.classList.add('lightbox--active');
        this.elements.lightbox?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus close button
        this.elements.lightboxCloseBtn?.focus();
        
        // Update lightbox content
        this.updateGalleryUI(true);
    }

    closeLightbox() {
        this.isLightboxOpen = false;
        this.elements.lightbox?.classList.remove('lightbox--active');
        this.elements.lightbox?.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Return focus to gallery main image
        this.elements.galleryMain?.focus();
    }

    /**
     * Quantity management
     */
    decreaseQuantity() {
        const currentValue = parseInt(this.elements.quantityInput?.value || '0');
        if (currentValue > 0) {
            this.elements.quantityInput.value = currentValue - 1;
            this.validateQuantity();
        }
    }

    increaseQuantity() {
        const currentValue = parseInt(this.elements.quantityInput?.value || '0');
        const maxValue = parseInt(this.elements.quantityInput?.max || '10');
        if (currentValue < maxValue) {
            this.elements.quantityInput.value = currentValue + 1;
            this.validateQuantity();
        }
    }

    validateQuantity() {
        const input = this.elements.quantityInput;
        const errorMessage = this.elements.errorMessage;
        
        if (!input || !errorMessage) return;

        const value = parseInt(input.value);
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || 10;

        let error = '';

        if (isNaN(value) || value < min) {
            error = `Quantity must be at least ${min}`;
            input.value = min;
        } else if (value > max) {
            error = `Quantity cannot exceed ${max}`;
            input.value = max;
        }

        if (error) {
            this.showError(error);
        } else {
            this.hideError();
        }
    }

    showError(message) {
        const { errorMessage } = this.elements;
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('error-message--visible');
            errorMessage.setAttribute('aria-live', 'assertive');
        }
    }

    hideError() {
        const { errorMessage } = this.elements;
        if (errorMessage) {
            errorMessage.classList.remove('error-message--visible');
            errorMessage.setAttribute('aria-live', 'polite');
        }
    }

    /**
     * Cart management
     */
    addToCart() {
        const quantity = parseInt(this.elements.quantityInput?.value || '0');
        
        if (quantity <= 0) {
            this.showError('Please select a quantity greater than 0');
            this.elements.quantityInput?.focus();
            return;
        }

        // Find existing item or create new one
        const existingItemIndex = this.cart.findIndex(item => item.id === this.product.id);
        
        if (existingItemIndex >= 0) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                image: this.product.images[0],
                quantity: quantity
            });
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(this.cart));
        
        // Update UI
        this.updateCartUI();
        this.elements.quantityInput.value = '0';
        
        // Show success message
        this.announceToScreenReader(`${quantity} ${this.product.name} added to cart`);
        
        // Brief success animation
        this.elements.addToCartBtn?.classList.add('btn--success');
        setTimeout(() => {
            this.elements.addToCartBtn?.classList.remove('btn--success');
        }, 1000);
    }

    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex >= 0) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartUI();
            this.announceToScreenReader(`${removedItem.name} removed from cart`);
        }
    }

    updateCartUI() {
        const { cartCount, cartEmpty, cartItems } = this.elements;
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        // Update cart count badge
        if (cartCount) {
            cartCount.textContent = totalItems;
            if (totalItems > 0) {
                cartCount.classList.add('nav__cart-count--visible');
                cartCount.setAttribute('aria-label', `${totalItems} items in cart`);
            } else {
                cartCount.classList.remove('nav__cart-count--visible');
                cartCount.removeAttribute('aria-label');
            }
        }

        // Update cart dropdown content
        if (this.cart.length === 0) {
            cartEmpty?.style.setProperty('display', 'block');
            cartItems?.style.setProperty('display', 'none');
        } else {
            cartEmpty?.style.setProperty('display', 'none');
            cartItems?.style.setProperty('display', 'flex');
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const { cartItems } = this.elements;
        if (!cartItems) return;

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                <div class="cart-item__details">
                    <div class="cart-item__name">${item.name}</div>
                    <div class="cart-item__pricing">
                        <span class="cart-item__price">$${item.price.toFixed(2)} x ${item.quantity}</span>
                        <span class="cart-item__total">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
                <button class="cart-item__delete" onclick="productPage.removeFromCart(${item.id})" aria-label="Remove ${item.name} from cart">
                    <svg width="14" height="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 2.625V1.875C0 1.334.334 1 .875 1h3.5L5.125.125h3.75L9.625 1h3.5c.54 0 .875.334.875.875v.75c0 .541-.334.875-.875.875H.875C.334 3.5 0 3.166 0 2.625ZM13 4.125c0-.54-.334-.875-.875-.875H1.875C1.334 3.25 1 3.584 1 4.125v9.875c0 1.54 1.25 2.875 2.875 2.875h6.25C11.75 16.875 13 15.54 13 14V4.125Z" fill="#C3CAD9" fill-rule="nonzero"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add checkout button
        const checkoutBtn = document.createElement('button');
        checkoutBtn.className = 'btn btn--primary cart-dropdown__checkout';
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.addEventListener('click', () => this.checkout());
        cartItems.appendChild(checkoutBtn);
    }

    checkout() {
        // Simulate checkout process
        this.announceToScreenReader('Proceeding to checkout');
        alert('Checkout functionality would be implemented here');
    }

    /**
     * Touch gestures for mobile gallery
     */
    initializeTouchGestures() {
        let startX = 0;
        let endX = 0;
        const threshold = 50;

        const galleryMain = this.elements.galleryMain;
        if (!galleryMain) return;

        galleryMain.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryMain.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            const difference = startX - endX;

            if (Math.abs(difference) > threshold) {
                if (difference > 0) {
                    this.nextImage();
                } else {
                    this.previousImage();
                }
            }
        }, { passive: true });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Close lightbox on resize to mobile
        if (window.innerWidth < 768 && this.isLightboxOpen) {
            this.closeLightbox();
        }
    }

    /**
     * Accessibility helpers
     */
    announceToScreenReader(message) {
        const { announcements } = this.elements;
        if (announcements) {
            announcements.textContent = message;
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    setInitialFocus() {
        // Set initial focus to main content for screen readers
        const mainContent = document.querySelector('.main');
        if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            mainContent.removeAttribute('tabindex');
        }
    }

    /**
     * Error handling
     */
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.announceToScreenReader('An error occurred. Please try again.');
    }
}

// Initialize the application
let productPage;

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            productPage = new ProductReviewPage();
        } catch (error) {
            console.error('Failed to initialize product page:', error);
        }
    });
} else {
    try {
        productPage = new ProductReviewPage();
    } catch (error) {
        console.error('Failed to initialize product page:', error);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductReviewPage;
}