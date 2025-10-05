// Before/After Comparison Slider
class ComparisonSlider {
    constructor() {
        this.slider = document.querySelector('.slider-input');
        this.afterImage = document.querySelector('.after-image');
        this.sliderHandle = document.querySelector('.slider-handle');
        this.isSliding = false;
        
        this.init();
    }
    
    init() {
        if (!this.slider || !this.afterImage || !this.sliderHandle) return;
        
        // Add event listeners
        this.slider.addEventListener('input', (e) => this.updateSlider(e));
        this.slider.addEventListener('mousedown', () => this.isSliding = true);
        this.slider.addEventListener('mouseup', () => this.isSliding = false);
        this.slider.addEventListener('touchstart', () => this.isSliding = true);
        this.slider.addEventListener('touchend', () => this.isSliding = false);
        
        // Auto-demo on load
        setTimeout(() => this.autoDemo(), 2000);
    }
    
    updateSlider(e) {
        const value = e.target.value;
        const percentage = value + '%';
        
        // Update clip-path for after image
        this.afterImage.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        
        // Update handle position
        this.sliderHandle.style.left = percentage;
        
        // Add visual feedback
        if (this.isSliding) {
            this.sliderHandle.style.transform = 'translateX(-50%) scale(1.1)';
        } else {
            this.sliderHandle.style.transform = 'translateX(-50%) scale(1)';
        }
    }
    
    autoDemo() {
        // Automatic demonstration
        let currentValue = 50;
        let direction = 1;
        
        const demo = setInterval(() => {
            currentValue += direction * 2;
            
            if (currentValue >= 90 || currentValue <= 10) {
                direction *= -1;
            }
            
            if (currentValue === 50) {
                clearInterval(demo);
            }
            
            this.slider.value = currentValue;
            this.updateSlider({ target: { value: currentValue } });
        }, 50);
    }
    
    // Public method to set specific position
    setPosition(value) {
        this.slider.value = value;
        this.updateSlider({ target: { value: value } });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.comparisonSlider = new ComparisonSlider();
});

// Make available globally
window.ComparisonSlider = ComparisonSlider;
