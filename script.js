/*
================================================
I RUN JHB - Premium Streetwear Scripts
Enhanced with modern JavaScript features
================================================
*/

// Global state management
const AppState = {
    cart: JSON.parse(localStorage.getItem('irunjhb_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('irunjhb_wishlist') || '[]'),
    user: JSON.parse(localStorage.getItem('irunjhb_user') || '{}'),
    isLoading: false
};

// Utility functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Sanitize input to prevent XSS
    sanitizeInput(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Notification system
const NotificationManager = {
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const icons = {
            success: '✓',
            error: '⚠',
            info: 'ℹ',
            warning: '⚠'
        };

        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__icon">${icons[type] || icons.info}</span>
                <span class="notification__message">${Utils.sanitizeInput(message)}</span>
                <button class="notification__close" aria-label="Close notification">&times;</button>
            </div>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            fontSize: '0.9rem',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Close button functionality
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        // Auto hide
        setTimeout(() => this.hide(notification), duration);

        return notification;
    },

    hide(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
};

// Cart management
const CartManager = {
    add(product) {
        const existingItem = AppState.cart.find(item => 
            item.id === product.id && item.size === product.size
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            AppState.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        this.save();
        this.updateUI();
        NotificationManager.show(`${product.name} added to cart!`, 'success');
        
        // Track event for analytics
        this.trackEvent('add_to_cart', product);
    },

    remove(productId, size) {
        AppState.cart = AppState.cart.filter(item => 
            !(item.id === productId && item.size === size)
        );
        this.save();
        this.updateUI();
        NotificationManager.show('Item removed from cart', 'info');
    },

    updateQuantity(productId, size, newQuantity) {
        const item = AppState.cart.find(item => 
            item.id === productId && item.size === size
        );

        if (item) {
            if (newQuantity <= 0) {
                this.remove(productId, size);
            } else {
                item.quantity = newQuantity;
                this.save();
                this.updateUI();
            }
        }
    },

    clear() {
        AppState.cart = [];
        this.save();
        this.updateUI();
    },

    getTotal() {
        return AppState.cart.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );
    },

    getItemCount() {
        return AppState.cart.reduce((total, item) => total + item.quantity, 0);
    },

    save() {
        localStorage.setItem('irunjhb_cart', JSON.stringify(AppState.cart));
    },

    updateUI() {
        this.updateCartCount();
        this.renderCartItems();
    },

    updateCartCount() {
        const count = this.getItemCount();
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        
        if (!cartItemsContainer) return;

        if (AppState.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Your cart is empty</p>
                    <p style="color: #666; font-size: 0.9rem;">Add some premium streetwear to get started!</p>
                    <a href="#featured" class="continue-shopping" onclick="UIManager.toggleCart()">Continue Shopping</a>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        const itemsHTML = AppState.cart.map(item => `
            <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
                <div class="cart-item__image">
                    <img src="${item.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">IRJ</text></svg>'}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item__details">
                    <h4>${Utils.sanitizeInput(item.name)}</h4>
                    <p class="cart-item__size">Size: ${item.size}</p>
                    <p class="cart-item__price">${Utils.formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item__controls">
                    <button class="quantity-btn" onclick="CartManager.updateQuantity('${item.id}', '${item.size}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="CartManager.updateQuantity('${item.id}', '${item.size}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-item" onclick="CartManager.remove('${item.id}', '${item.size}')" aria-label="Remove item">&times;</button>
            </div>
        `).join('');

        cartItemsContainer.innerHTML = itemsHTML;

        // Update cart footer
        if (cartFooter) {
            const subtotal = this.getTotal();
            const shipping = subtotal > 500 ? 0 : 50;
            const total = subtotal + shipping;

            document.getElementById('cartSubtotal').textContent = Utils.formatCurrency(subtotal);
            document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE' : Utils.formatCurrency(shipping);
            document.getElementById('cartTotal').textContent = Utils.formatCurrency(total);
            
            cartFooter.style.display = 'block';
        }
    },

    trackEvent(eventName, product) {
        // Analytics tracking (Google Analytics, Facebook Pixel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                currency: 'ZAR',
                value: product.price,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    category: product.category,
                    quantity: 1,
                    price: product.price
                }]
            });
        }
    }
};

// Wishlist management
const WishlistManager = {
    toggle(product) {
        const existingIndex = AppState.wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            AppState.wishlist.splice(existingIndex, 1);
            NotificationManager.show(`${product.name} removed from wishlist`, 'info');
        } else {
            AppState.wishlist.push({
                ...product,
                addedAt: new Date().toISOString()
            });
            NotificationManager.show(`${product.name} added to wishlist!`, 'success');
        }

        this.save();
        this.updateUI();
    },

    remove(productId) {
        AppState.wishlist = AppState.wishlist.filter(item => item.id !== productId);
        this.save();
        this.updateUI();
    },

    save() {
        localStorage.setItem('irunjhb_wishlist', JSON.stringify(AppState.wishlist));
    },

    updateUI() {
        this.updateWishlistCount();
        this.renderWishlistItems();
        this.updateWishlistButtons();
    },

    updateWishlistCount() {
        const count = AppState.wishlist.length;
        const wishlistCountElements = document.querySelectorAll('#wishlistCount, .wishlist-count');
        
        wishlistCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    },

    updateWishlistButtons() {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        wishlistButtons.forEach(btn => {
            const productId = btn.dataset.product;
            const isInWishlist = AppState.wishlist.some(item => item.id === productId);
            btn.classList.toggle('active', isInWishlist);
        });
    },

    renderWishlistItems() {
        const wishlistItemsContainer = document.getElementById('wishlistItems');
        if (!wishlistItemsContainer) return;

        if (AppState.wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = `
                <div class="wishlist-empty">
                    <i class="fas fa-heart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>Your wishlist is empty</p>
                    <p style="color: #666; font-size: 0.9rem;">Save items you love for later!</p>
                    <a href="#featured" class="continue-shopping" onclick="UIManager.toggleWishlist()">Continue Shopping</a>
                </div>
            `;
            return;
        }

        const itemsHTML = AppState.wishlist.map(item => `
            <div class="wishlist-item" data-id="${item.id}">
                <div class="wishlist-item__image">
                    <img src="${item.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f2f2f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">IRJ</text></svg>'}" alt="${item.name}" loading="lazy">
                </div>
                <div class="wishlist-item__details">
                    <h4>${Utils.sanitizeInput(item.name)}</h4>
                    <p class="wishlist-item__price">${Utils.formatCurrency(item.price)}</p>
                    <button class="add-to-cart-from-wishlist" onclick="WishlistManager.moveToCart('${item.id}')">
                        Add to Cart
                    </button>
                </div>
                <button class="remove-item" onclick="WishlistManager.remove('${item.id}')" aria-label="Remove from wishlist">&times;</button>
            </div>
        `).join('');

        wishlistItemsContainer.innerHTML = itemsHTML;
    },

    moveToCart(productId) {
        const item = AppState.wishlist.find(item => item.id === productId);
        if (item) {
            CartManager.add({ ...item, size: 'M' }); // Default size
            this.remove(productId);
        }
    }
};

// UI Management
const UIManager = {
    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupMobileMenu();
        this.setupFormValidation();
        this.setupProductFilters();
        this.setupLazyLoading();
    },

    setupEventListeners() {
        // Navigation
        document.getElementById('menuToggle')?.addEventListener('click', this.toggleMobileMenu);
        document.getElementById('cartBtn')?.addEventListener('click', this.toggleCart);
        document.getElementById('wishlistBtn')?.addEventListener('click', this.toggleWishlist);
        document.getElementById('searchBtn')?.addEventListener('click', this.toggleSearch);
        document.getElementById('accountBtn')?.addEventListener('click', this.toggleAccount);

        // Cart/Wishlist close buttons
        document.getElementById('closeCartBtn')?.addEventListener('click', this.toggleCart);
        document.getElementById('closeWishlistBtn')?.addEventListener('click', this.toggleWishlist);

        // Overlay
        document.getElementById('overlay')?.addEventListener('click', this.closeAllModals);

        // Scroll indicator
        document.getElementById('scrollIndicator')?.addEventListener('click', () => {
            document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
        });

        // Product actions
        this.setupProductActions();

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation);

        // Window events
        window.addEventListener('scroll', Utils.debounce(this.handleScroll, 16));
        window.addEventListener('resize', Utils.debounce(this.handleResize, 250));
    },

    setupProductActions() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                const sizeSelector = productCard?.querySelector('.size-selector');
                
                const product = {
                    id: e.target.dataset.product,
                    name: e.target.dataset.name,
                    price: parseFloat(e.target.dataset.price),
                    size: sizeSelector?.value || 'M',
                    image: productCard?.querySelector('img')?.src,
                    category: productCard?.dataset.collection
                };

                CartManager.add(product);
            }

            // Wishlist buttons
            if (e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.wishlist-btn');
                const productCard = btn.closest('.product-card');
                
                const product = {
                    id: btn.dataset.product,
                    name: productCard?.querySelector('.product-name')?.textContent,
                    price: parseFloat(productCard?.querySelector('.product-price')?.textContent.replace(/[^\d.]/g, '')),
                    image: productCard?.querySelector('img')?.src,
                    category: productCard?.dataset.collection
                };

                WishlistManager.toggle(product);
            }

            // Quick view
            if (e.target.classList.contains('quick-view')) {
                e.preventDefault();
                const productCard = e.target.closest('.product-card');
                const productId = productCard?.dataset.productId;
                if (productId) {
                    window.location.href = `product-detail.html?product=${productId}`;
                }
            }
        });
    },

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        const overlay = document.getElementById('overlay');
        
        navLinks?.classList.toggle('active');
        menuToggle?.classList.toggle('active');
        overlay?.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    },

    toggleCart() {
        const cartDrawer = document.getElementById('cartDrawer');
        const overlay = document.getElementById('overlay');
        
        cartDrawer?.classList.toggle('open');
        overlay?.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        if (cartDrawer?.classList.contains('open')) {
            CartManager.renderCartItems();
        }
    },

    toggleWishlist() {
        const wishlistDrawer = document.getElementById('wishlistDrawer');
        const overlay = document.getElementById('overlay');
        
        wishlistDrawer?.classList.toggle('open');
        overlay?.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
        
        if (wishlistDrawer?.classList.contains('open')) {
            WishlistManager.renderWishlistItems();
        }
    },

    toggleSearch() {
        // Implement search modal
        NotificationManager.show('Search functionality coming soon!', 'info');
    },

    toggleAccount() {
        // Implement account modal
        NotificationManager.show('Account features coming soon!', 'info');
    },

    closeAllModals() {
        const modals = [
            document.getElementById('cartDrawer'),
            document.getElementById('wishlistDrawer'),
            document.querySelector('.nav-links')
        ];
        
        modals.forEach(modal => modal?.classList.remove('open', 'active'));
        document.getElementById('overlay')?.classList.remove('active');
        document.querySelector('.menu-toggle')?.classList.remove('active');
        document.body.classList.remove('no-scroll');
    },

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    setupMobileMenu() {
        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (document.querySelector('.nav-links')?.classList.contains('active')) {
                    this.toggleMobileMenu();
                }
            });
        });
    },

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit);
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    },

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        // Email validation
        else if (type === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        // Minimum length validation
        else if (field.minLength && value.length < field.minLength) {
            isValid = false;
            errorMessage = `Minimum ${field.minLength} characters required`;
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    },

    showFieldError(field, message) {
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           document.querySelector(`[data-error-for="${field.name}"]`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        field.classList.toggle('error', !!message);
    },

    clearFieldError(field) {
        this.showFieldError(field, '');
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        let isValid = true;

        // Validate all fields
        const fields = form.querySelectorAll('input, textarea');
        fields.forEach(field => {
            if (!UIManager.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            NotificationManager.show('Please correct the errors above', 'error');
            return;
        }

        // Handle different form types
        if (form.id === 'contactForm') {
            UIManager.handleContactForm(formData);
        } else if (form.id === 'newsletterForm') {
            UIManager.handleNewsletterForm(formData);
        }
    },

    handleContactForm(formData) {
        const responseElement = document.getElementById('formResponse');
        
        // Show loading state
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual endpoint)
        setTimeout(() => {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show success message
            if (responseElement) {
                responseElement.className = 'form-response success';
                responseElement.textContent = 'Thank you for your message! We\'ll get back to you soon.';
                responseElement.style.display = 'block';
            }

            NotificationManager.show('Message sent successfully!', 'success');
            
            // Reset form
            document.getElementById('contactForm').reset();
        }, 2000);
    },

    handleNewsletterForm(formData) {
        const email = formData.get('email');
        
        // Save to localStorage (replace with actual API call)
        const subscribers = JSON.parse(localStorage.getItem('irunjhb_subscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('irunjhb_subscribers', JSON.stringify(subscribers));
        }

        NotificationManager.show('Successfully subscribed to newsletter!', 'success');
        document.getElementById('newsletterForm').reset();
    },

    setupProductFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterProducts(filter);
                
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    },

    filterProducts(filter) {
        const products = document.querySelectorAll('.product-card');
        
        products.forEach(product => {
            const collection = product.dataset.collection;
            const shouldShow = filter === 'all' || collection === filter;
            
            if (shouldShow) {
                product.style.display = 'block';
                product.classList.remove('product-hidden');
            } else {
                product.classList.add('product-hidden');
                setTimeout(() => {
                    product.style.display = 'none';
                }, 300);
            }
        });
    },

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });

            // Observe all images - images that already finished loading
            // (fast/cached loads racing ahead of this script) are marked
            // loaded immediately instead of being silently stuck at opacity:0
            document.querySelectorAll('img').forEach(img => {
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.classList.add('lazy');
                    imageObserver.observe(img);
                }
            });
        }

        // Preload critical images
        this.preloadCriticalImages();
    },
    
    preloadCriticalImages() {
        const criticalImages = [
            'images/hero.jpg',
            'images/pic1.jpg',
            'images/pic2.jpg'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    },

    handleScroll() {
        const scrolled = window.pageYOffset;
        const navbar = document.querySelector('.navbar');
        
        // Update navbar on scroll
        if (scrolled > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        // Parallax effect for hero
        const hero = document.querySelector('.hero');
        if (hero && Utils.isInViewport(hero)) {
            const rate = scrolled * -0.3;
            hero.style.transform = `translateY(${rate}px)`;
        }
    },

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            UIManager.closeAllModals();
        }
    },

    handleKeyboardNavigation(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            UIManager.closeAllModals();
        }

        // Enter key on buttons
        if (e.key === 'Enter' && e.target.classList.contains('quick-view')) {
            e.target.click();
        }
    }
};

// Performance monitoring (disabled in development)
const PerformanceMonitor = {
    init() {
        if (location.hostname === 'localhost' || location.protocol === 'file:') return;
        
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData && perfData.loadEventEnd > 0) {
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }
        });

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.duration > 100) {
                            console.warn('Long task detected:', entry.duration, 'ms');
                        }
                    });
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Ignore if not supported
            }
        }
    }
};

// Mobile-first optimizations
const MobileOptimizations = {
    init() {
        this.setViewportHeight();
        this.preventZoomOnInput();
        this.optimizeTouchTargets();
        this.handleOrientationChange();
        this.setupFastClick();
    },

    setViewportHeight() {
        // Fix for iOS Safari viewport height issues
        const setVH = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    },

    preventZoomOnInput() {
        // Prevent zoom on input focus for iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const viewport = document.querySelector('meta[name=viewport]');
            const inputs = document.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                });
                
                input.addEventListener('blur', () => {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                });
            });
        }
    },

    optimizeTouchTargets() {
        // Ensure touch targets are at least 44px
        const touchElements = document.querySelectorAll('button, a, input, select');
        touchElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                el.style.minWidth = '44px';
                el.style.minHeight = '44px';
            }
        });
    },

    handleOrientationChange() {
        window.addEventListener('orientationchange', () => {
            // Close any open modals on orientation change
            UIManager.closeAllModals();
            
            // Recalculate layout after orientation change
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 500);
        });
    },

    setupFastClick() {
        // Remove 300ms click delay on mobile
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // Add touch feedback
            document.addEventListener('touchstart', (e) => {
                if (e.target.matches('button, a, .clickable')) {
                    e.target.classList.add('touch-active');
                }
            });
            
            document.addEventListener('touchend', (e) => {
                if (e.target.matches('button, a, .clickable')) {
                    setTimeout(() => {
                        e.target.classList.remove('touch-active');
                    }, 150);
                }
            });
        }
    }
};

// Cross-browser compatibility fixes
const BrowserCompatibility = {
    init() {
        this.addVendorPrefixes();
        this.polyfillFeatures();
        this.fixBrowserQuirks();
    },

    addVendorPrefixes() {
        // Add CSS vendor prefixes via JavaScript for critical features
        const style = document.createElement('style');
        style.textContent = `
            .nav-links {
                -webkit-transform: translateX(-100%);
                -ms-transform: translateX(-100%);
                transform: translateX(-100%);
            }
            .nav-links.active {
                -webkit-transform: translateX(0);
                -ms-transform: translateX(0);
                transform: translateX(0);
            }
            .touch-active {
                -webkit-transform: scale(0.95);
                -ms-transform: scale(0.95);
                transform: scale(0.95);
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    },

    polyfillFeatures() {
        // IntersectionObserver polyfill for older browsers
        if (!('IntersectionObserver' in window)) {
            // Fallback for scroll animations
            window.addEventListener('scroll', () => {
                const elements = document.querySelectorAll('.animate-on-scroll');
                elements.forEach(el => {
                    if (Utils.isInViewport(el)) {
                        el.classList.add('animated');
                    }
                });
            });
        }

        // CustomEvent polyfill for IE
        if (typeof window.CustomEvent !== 'function') {
            function CustomEvent(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                const evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        }
    },

    fixBrowserQuirks() {
        // Safari flexbox fix
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            document.body.classList.add('safari');
        }

        // Edge/IE fixes
        if (/Edge/.test(navigator.userAgent) || /Trident/.test(navigator.userAgent)) {
            document.body.classList.add('edge-ie');
        }

        // Firefox fixes
        if (/Firefox/.test(navigator.userAgent)) {
            document.body.classList.add('firefox');
        }

        // Chrome fixes
        if (/Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent)) {
            document.body.classList.add('chrome');
        }
    }
};

// Product Catalog for Shop page
const PRODUCTS = [
    { id: 'heritage-ndebele-bomber', name: 'Heritage Ndebele Bomber', price: 1499, category: 'heritage', image: 'images/collection-heritage.jpg', desc: 'Traditional print bomber celebrating Ndebele geometric pattern work.', badge: 'New' },
    { id: 'kasi-windbreaker', name: 'Kasi Windbreaker Track Jacket', price: 1299, category: 'gold', image: 'images/lookbook-09.jpg', desc: 'Bold colour-blocked windbreaker built for the streets of Jozi.' },
    { id: 'city-dreams-tee', name: 'City Dreams Graphic Tee', price: 549, category: 'city', image: 'images/hero-alt.jpg', desc: 'Everyday tee for the dreamers and hustlers of the City of Gold.' },
    { id: 'amapantsula-track-pants', name: 'Amapantsula Track Pants', price: 799, category: 'city', image: 'images/product-green-set.jpg', desc: 'Relaxed-fit track pants inspired by Kasi pantsula culture.' },
    { id: 'umswenko-golfer', name: 'UMSWENKO Golfer Shirt', price: 649, category: 'heritage', image: 'images/product-teal-floral.jpg', desc: 'Smart-casual golfer with traditional trim detailing.' },
    { id: 'braamfontein-duffel', name: 'Braamfontein Duffel Bag', price: 899, category: 'city', image: 'images/product-friends-bags.jpg', desc: 'Weekend-ready duffel with heritage print panels.' },
    { id: 'gold-rush-bomber', name: 'Gold Rush Satin Bomber', price: 1599, category: 'gold', image: 'images/collection-gold.jpg', desc: 'Limited edition satin bomber inspired by Johannesburg’s golden legacy.', badge: 'Limited' },
    { id: 'traditional-wrap-dress', name: 'Traditional Print Wrap Dress', price: 1099, category: 'heritage', image: 'images/collection-heritage.jpg', desc: 'Flowing wrap dress in indigenous South African print fabric.' },
    { id: 'jozi-fanny-pack', name: 'Jozi Fanny Pack', price: 399, category: 'city', image: 'images/lookbook-09.jpg', desc: 'Compact crossbody fanny pack for city runs.' },
    { id: 'township-jumpsuit', name: 'Township Trends Jumpsuit', price: 1199, category: 'heritage', image: 'images/lookbook-10.jpg', desc: 'One-piece jumpsuit fusing Kasi tailoring with heritage cloth.' },
    { id: 'hustle-travel-bag', name: 'Hustle Culture Travel Bag', price: 1099, category: 'gold', image: 'images/lookbook-11.jpg', desc: 'Durable travel bag for the ambitious and always-on-the-move.' },
    { id: 'izikhothane-tracksuit', name: 'Izikhothane Track Suit', price: 1799, category: 'gold', image: 'images/lookbook-12.jpg', desc: 'Statement tracksuit celebrating izikhothane street sub-culture flair.', badge: 'Limited' },
    { id: 'sepedi-heritage-shirt', name: 'Sepedi Heritage Shirt', price: 699, category: 'heritage', image: 'images/hero.jpg', desc: 'Button-up shirt drawing on Sepedi pattern traditions.' },
    { id: 'city-lights-backpack', name: 'City Lights Backpack', price: 949, category: 'city', image: 'images/product-friends-bags.jpg', desc: 'Everyday backpack with reflective city-lights trim.' },
    { id: 'gold-standard-cap', name: 'Gold Standard Cap', price: 349, category: 'gold', image: 'images/collection-gold.jpg', desc: 'Embroidered cap finishing off any UMSWENKO fit.' }
];

const ShopCatalog = {
    state: {
        search: '',
        category: 'all',
        price: 'all',
        sort: 'featured',
        visibleCount: 6
    },

    init() {
        this.grid = document.getElementById('productsGrid');
        if (!this.grid) return;

        this.searchInput = document.getElementById('searchInput');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.priceFilter = document.getElementById('priceFilter');
        this.sortFilter = document.getElementById('sortFilter');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');

        const params = new URLSearchParams(window.location.search);
        const collectionParam = params.get('collection');
        if (collectionParam && ['heritage', 'city', 'gold'].includes(collectionParam)) {
            this.state.category = collectionParam;
            if (this.categoryFilter) this.categoryFilter.value = collectionParam;
        }

        this.searchInput?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value.toLowerCase().trim();
            this.state.visibleCount = 6;
            this.render();
        }, 250));

        this.categoryFilter?.addEventListener('change', (e) => {
            this.state.category = e.target.value;
            this.state.visibleCount = 6;
            this.render();
        });

        this.priceFilter?.addEventListener('change', (e) => {
            this.state.price = e.target.value;
            this.state.visibleCount = 6;
            this.render();
        });

        this.sortFilter?.addEventListener('change', (e) => {
            this.state.sort = e.target.value;
            this.render();
        });

        this.loadMoreBtn?.addEventListener('click', () => {
            this.state.visibleCount += 6;
            this.render();
        });

        this.render();
    },

    getFiltered() {
        let items = PRODUCTS.filter(p => {
            if (this.state.category !== 'all' && p.category !== this.state.category) return false;
            if (this.state.search && !p.name.toLowerCase().includes(this.state.search) && !p.desc.toLowerCase().includes(this.state.search)) return false;
            if (this.state.price !== 'all') {
                if (this.state.price.endsWith('+')) {
                    const minVal = parseInt(this.state.price);
                    if (p.price < minVal) return false;
                } else {
                    const [minVal, maxVal] = this.state.price.split('-').map(Number);
                    if (p.price < minVal || p.price > maxVal) return false;
                }
            }
            return true;
        });

        switch (this.state.sort) {
            case 'price-low': items.sort((a, b) => a.price - b.price); break;
            case 'price-high': items.sort((a, b) => b.price - a.price); break;
            case 'newest': items = items.slice().reverse(); break;
            default: break;
        }

        return items;
    },

    render() {
        const items = this.getFiltered();
        const visible = items.slice(0, this.state.visibleCount);

        if (visible.length === 0) {
            this.grid.innerHTML = `<p class="no-products" style="grid-column: 1/-1; text-align:center; padding: 3rem 1rem; color: var(--text-gray);">No products match your search. Try a different filter.</p>`;
        } else {
            this.grid.innerHTML = visible.map(p => this.cardHTML(p)).join('');
        }

        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = this.state.visibleCount < items.length ? 'inline-flex' : 'none';
        }
    },

    cardHTML(p) {
        return `
            <article class="product-card" data-collection="${p.category}" data-product-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image}" alt="${Utils.sanitizeInput(p.name)} - ${Utils.sanitizeInput(p.desc)}" loading="lazy">
                    ${p.badge ? `<span class="quick-view" style="opacity:1; bottom:auto; top:1rem; left:1rem; transform:none; background:var(--umswenko-gradient); color:white;">${p.badge}</span>` : ''}
                    <button class="wishlist-btn" aria-label="Add to wishlist" data-product="${p.id}">
                        <i class="fas fa-heart" aria-hidden="true"></i>
                    </button>
                    <span class="quick-view" role="button" tabindex="0" aria-label="Quick view ${Utils.sanitizeInput(p.name)}">Quick View</span>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${Utils.sanitizeInput(p.name)}</h3>
                    <p class="product-price">${Utils.formatCurrency(p.price)}</p>
                    <div class="product-actions">
                        <label for="size-${p.id}" class="sr-only">Select size for ${Utils.sanitizeInput(p.name)}</label>
                        <select class="size-selector" id="size-${p.id}" autocomplete="off">
                            <option value="S">Small</option>
                            <option value="M" selected>Medium</option>
                            <option value="L">Large</option>
                            <option value="XL">Extra Large</option>
                        </select>
                        <button class="add-to-cart" data-product="${p.id}" data-name="${Utils.sanitizeInput(p.name)}" data-price="${p.price}">
                            Add to Cart
                        </button>
                    </div>
                    <div class="product-trust">
                        <span><i class="fas fa-shield-alt"></i> Secure Payment</span>
                        <span><i class="fas fa-undo"></i> 30-Day Returns</span>
                    </div>
                </div>
            </article>
        `;
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile and browser optimizations first
    MobileOptimizations.init();
    BrowserCompatibility.init();
    
    // Initialize managers
    CartManager.updateUI();
    WishlistManager.updateUI();
    UIManager.init();
    PerformanceMonitor.init();
    ShopCatalog.init();

    // Add scroll animations to elements with stagger effect
    document.querySelectorAll('.collection-card, .product-card, .pillar, .testimonial-card, .achievement-card').forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        el.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Add luxury interactions
    document.querySelectorAll('.cta-button, .btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Announce page ready for screen readers
    const announcements = document.getElementById('announcements');
    if (announcements) {
        announcements.textContent = 'Page loaded successfully. I RUN JHB premium streetwear website ready.';
    }

    console.log('🚀 I RUN JHB website initialized successfully!');
});

// Service Worker registration for PWA capabilities (only in production)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for global access
window.CartManager = CartManager;
window.WishlistManager = WishlistManager;
window.UIManager = UIManager;
window.NotificationManager = NotificationManager;