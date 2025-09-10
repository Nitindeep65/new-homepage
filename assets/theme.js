/**
 * Theme JavaScript
 * Handles interactive components and functionality
 */

(function() {
  'use strict';

  // Theme object
  window.theme = window.theme || {};

  // Utility functions
  theme.utils = {
    debounce: function(func, wait) {
      var timeout;
      return function executedFunction() {
        var later = function() {
          clearTimeout(timeout);
          func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    throttle: function(func, limit) {
      var inThrottle;
      return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(function() {
            inThrottle = false;
          }, limit);
        }
      };
    },

    ready: function(fn) {
      if (document.readyState !== 'loading') {
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }
    },

    fadeIn: function(element, duration = 300) {
      element.style.opacity = '0';
      element.style.display = 'block';
      
      var start = performance.now();
      
      function animate(timestamp) {
        var elapsed = timestamp - start;
        var progress = elapsed / duration;
        
        if (progress < 1) {
          element.style.opacity = progress.toString();
          requestAnimationFrame(animate);
        } else {
          element.style.opacity = '1';
        }
      }
      
      requestAnimationFrame(animate);
    },

    fadeOut: function(element, duration = 300) {
      var start = performance.now();
      var startOpacity = parseFloat(window.getComputedStyle(element).opacity);
      
      function animate(timestamp) {
        var elapsed = timestamp - start;
        var progress = elapsed / duration;
        
        if (progress < 1) {
          element.style.opacity = (startOpacity * (1 - progress)).toString();
          requestAnimationFrame(animate);
        } else {
          element.style.opacity = '0';
          element.style.display = 'none';
        }
      }
      
      requestAnimationFrame(animate);
    }
  };

  // Carousel functionality
  theme.Carousel = function(container) {
    this.container = container;
    this.track = container.querySelector('.testimonials-track');
    this.slides = container.querySelectorAll('.testimonial-slide');
    this.prevBtn = container.querySelector('.carousel-btn--prev');
    this.nextBtn = container.querySelector('.carousel-btn--next');
    this.dots = container.querySelectorAll('.carousel-dot');
    
    this.currentSlide = 0;
    this.autoRotateTimer = null;
    this.autoRotate = container.dataset.autoRotate === 'true';
    this.rotateSpeed = parseInt(container.dataset.rotateSpeed) || 5000;

    this.init();
  };

  theme.Carousel.prototype = {
    init: function() {
      if (this.slides.length === 0) return;

      this.showSlide(0);
      this.bindEvents();
      
      if (this.autoRotate && this.slides.length > 1) {
        this.startAutoRotate();
      }
    },

    showSlide: function(index) {
      var self = this;
      
      this.slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      
      this.dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
      
      this.currentSlide = index;
    },

    nextSlide: function() {
      var next = this.currentSlide + 1 >= this.slides.length ? 0 : this.currentSlide + 1;
      this.showSlide(next);
    },

    prevSlide: function() {
      var prev = this.currentSlide - 1 < 0 ? this.slides.length - 1 : this.currentSlide - 1;
      this.showSlide(prev);
    },

    startAutoRotate: function() {
      var self = this;
      if (this.autoRotate && this.slides.length > 1) {
        this.autoRotateTimer = setInterval(function() {
          self.nextSlide();
        }, this.rotateSpeed);
      }
    },

    stopAutoRotate: function() {
      if (this.autoRotateTimer) {
        clearInterval(this.autoRotateTimer);
        this.autoRotateTimer = null;
      }
    },

    bindEvents: function() {
      var self = this;

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', function() {
          self.stopAutoRotate();
          self.nextSlide();
          self.startAutoRotate();
        });
      }

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', function() {
          self.stopAutoRotate();
          self.prevSlide();
          self.startAutoRotate();
        });
      }

      this.dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          self.stopAutoRotate();
          self.showSlide(index);
          self.startAutoRotate();
        });
      });

      // Pause auto-rotate on hover
      this.container.addEventListener('mouseenter', function() {
        self.stopAutoRotate();
      });

      this.container.addEventListener('mouseleave', function() {
        self.startAutoRotate();
      });

      // Handle keyboard navigation
      this.container.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          self.prevSlide();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          self.nextSlide();
        }
      });
    }
  };

  // Smooth scroll functionality
  theme.SmoothScroll = {
    init: function() {
      var links = document.querySelectorAll('a[href^="#"]');
      
      links.forEach(function(link) {
        link.addEventListener('click', function(e) {
          var href = this.getAttribute('href');
          var target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }
  };

  // Lazy loading for images
  theme.LazyLoad = {
    init: function() {
      if ('IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          });
        });

        var lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(function(img) {
          imageObserver.observe(img);
        });
      }
    }
  };

  // Form validation
  theme.FormValidation = {
    init: function() {
      var forms = document.querySelectorAll('form[data-validate]');
      
      forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
          if (!theme.FormValidation.validateForm(form)) {
            e.preventDefault();
          }
        });
      });
    },

    validateForm: function(form) {
      var isValid = true;
      var requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(function(field) {
        if (!theme.FormValidation.validateField(field)) {
          isValid = false;
        }
      });
      
      return isValid;
    },

    validateField: function(field) {
      var isValid = true;
      var value = field.value.trim();
      
      // Remove previous error states
      field.classList.remove('form-control--error');
      var errorMsg = field.parentNode.querySelector('.error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
      
      // Check if field is empty
      if (field.required && !value) {
        isValid = false;
        theme.FormValidation.showError(field, 'This field is required');
      }
      
      // Email validation
      if (field.type === 'email' && value) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          theme.FormValidation.showError(field, 'Please enter a valid email address');
        }
      }
      
      return isValid;
    },

    showError: function(field, message) {
      field.classList.add('form-control--error');
      
      var errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.style.color = '#e74c3c';
      errorDiv.style.fontSize = '0.875rem';
      errorDiv.style.marginTop = '0.25rem';
      errorDiv.textContent = message;
      
      field.parentNode.appendChild(errorDiv);
    }
  };

  // Mobile menu
  theme.MobileMenu = {
    init: function() {
      var toggles = document.querySelectorAll('[data-mobile-menu-toggle]');
      var menu = document.querySelector('[data-mobile-menu]');
      
      if (!menu) return;

      toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
          theme.MobileMenu.toggle();
        });
      });

      // Close menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !e.target.matches('[data-mobile-menu-toggle]')) {
          theme.MobileMenu.close();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          theme.MobileMenu.close();
        }
      });
    },

    toggle: function() {
      var menu = document.querySelector('[data-mobile-menu]');
      if (menu.classList.contains('active')) {
        theme.MobileMenu.close();
      } else {
        theme.MobileMenu.open();
      }
    },

    open: function() {
      var menu = document.querySelector('[data-mobile-menu]');
      menu.classList.add('active');
      document.body.classList.add('menu-open');
    },

    close: function() {
      var menu = document.querySelector('[data-mobile-menu]');
      menu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  };

  // Initialize everything when DOM is ready
  theme.utils.ready(function() {
    // Initialize carousels
    var carousels = document.querySelectorAll('[data-section-type="testimonials"]');
    carousels.forEach(function(carousel) {
      new theme.Carousel(carousel.querySelector('.testimonials-carousel'));
    });

    // Initialize other components
    theme.SmoothScroll.init();
    theme.LazyLoad.init();
    theme.FormValidation.init();
    theme.MobileMenu.init();

    // Add loaded class to body
    document.body.classList.add('theme-loaded');
  });

  // Handle resize events
  window.addEventListener('resize', theme.utils.debounce(function() {
    // Trigger custom resize event
    var resizeEvent = new CustomEvent('theme:resize');
    document.dispatchEvent(resizeEvent);
  }, 250));

})();