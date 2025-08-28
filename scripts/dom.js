import { SELECTORS } from './config.js';

// DOM Elements Cache
class DOMElements {
  constructor() {
    this.elements = {};
    this.cache();
  }

  cache() {
    // Cache all DOM elements
    Object.entries(SELECTORS).forEach(([key, selector]) => {
      const element = selector.startsWith('.') 
        ? document.querySelectorAll(selector)
        : document.querySelector(selector);
      
      this.elements[key] = element;
    });
  }

  get(key) {
    return this.elements[key];
  }

  // Helper method to get multiple elements
  getMultiple(...keys) {
    return keys.reduce((acc, key) => {
      acc[key] = this.elements[key];
      return acc;
    }, {});
  }
}

// Create and export singleton instance
export const domElements = new DOMElements();

// Utility functions for DOM manipulation
export const domUtils = {
  addClass(element, className) {
    if (element) element.classList.add(className);
  },

  removeClass(element, className) {
    if (element) element.classList.remove(className);
  },

  toggleClass(element, className, force = undefined) {
    if (element) element.classList.toggle(className, force);
  },

  setHTML(element, html) {
    if (element) element.innerHTML = html;
  },

  setText(element, text) {
    if (element) element.textContent = text;
  },

  setAttribute(element, attr, value) {
    if (element) element.setAttribute(attr, value);
  },

  removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  },

  addRippleEffect(element, event) {
    const ripple = this.createElement('div', 'ripple');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    
    element.appendChild(ripple);
    
    return new Promise(resolve => {
      setTimeout(() => {
        this.removeElement(ripple);
        resolve();
      }, 300);
    });
  },

  addPulseAnimation(element, duration = 500) {
    this.addClass(element, 'pulse-once');
    setTimeout(() => this.removeClass(element, 'pulse-once'), duration);
  },

  addFloatingHeart() {
    const heart = this.createElement('div', 'floating-heart', '<i class="fa-solid fa-heart"></i>');
    document.body.appendChild(heart);
    
    setTimeout(() => {
      this.removeElement(heart);
    }, 1000);
  }
};
