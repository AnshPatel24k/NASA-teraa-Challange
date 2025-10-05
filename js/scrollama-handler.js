// Enhanced scrollama handler with smooth transitions and advanced features
class ScrollamaHandler {
    constructor() {
        this.scroller = null;
        this.currentSection = 0;
        this.transitionSpeed = 1000;
        this.isTransitioning = false;
        this.features = {
            comparisonSlider: null,
            aiAssistant: null,
            videoHandler: null
        };
        
        this.init();
    }

    init() {
        this.setupScrollama();
        this.setupIntersectionObserver();
        this.addCustomScrollEffects();
        this.setupFeatureIntegration();
    }

    setupScrollama() {
        this.scroller = scrollama();

        this.scroller
            .setup({
                step: '.step',
                offset: 0.6,
                debug: false
            })
            .onStepEnter((response) => {
                this.handleStepEnter(response);
            })
            .onStepExit((response) => {
                this.handleStepExit(response);
            })
            .onStepProgress((response) => {
                this.handleStepProgress(response);
            });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.scroller.resize();
        });
    }

    setupFeatureIntegration() {
        // Wait for features to initialize
        const checkFeatures = () => {
            this.features.comparisonSlider = window.comparisonSlider;
            this.features.aiAssistant = window.aiAssistant;
            this.features.videoHandler = window.videoHandler;
        };
        
        // Check immediately and periodically
        checkFeatures();
        setTimeout(checkFeatures, 1000);
        setTimeout(checkFeatures, 3000);
    }

    handleStepEnter(response) {
        const { element, index, direction } = response;
        
        if (this.isTransitioning) return;
        
        this.currentSection = index;
        element.classList.add('active');
        
        // Trigger section-specific animations
        this.triggerSectionAnimation(element.id, index, direction);
        
        // Update satellite image with smooth transition
        this.updateSatelliteImageSmooth(index);
        
        // Update navigation indicators
        this.updateNavigationIndicators(index);
        
        // Handle feature-specific triggers
        this.handleFeatureTriggers(element.id, index, direction);
    }

    handleStepExit(response) {
        const { element, index } = response;
        element.classList.remove('active');
    }

    handleStepProgress(response) {
        const { element, index, progress } = response;
        
        // Create parallax and fade effects based on scroll progress
        if (element.classList.contains('story-section')) {
            const opacity = Math.min(1, progress * 2);
            element.style.opacity = opacity;
            
            // Parallax effect for background elements
            const translateY = (1 - progress) * 50;
            const backgroundElements = element.querySelectorAll('.parallax-element');
            backgroundElements.forEach(el => {
                el.style.transform = `translateY(${translateY}px)`;
            });
        }

        // Special handling for comparison slider
        if (element.id === 'comparison-section' && this.features.comparisonSlider) {
            // Auto-demo when user scrolls through
            if (progress > 0.3 && progress < 0.7) {
                this.features.comparisonSlider.autoDemo();
            }
        }

        // Special handling for AI assistant
        if (element.id === 'ai-assistant-section' && progress > 0.4 && this.features.aiAssistant) {
            this.triggerAIDemo();
        }
    }

    handleFeatureTriggers(elementId, index, direction) {
        switch (elementId) {
            case 'comparison-section':
                this.triggerComparisonSlider();
                break;
                
            case 'ai-assistant-section':
                setTimeout(() => this.triggerAIDemo(), 1500);
                break;
                
            case 'timelapse-video-section':
                this.triggerVideoSection();
                break;
                
            case 'what-if-section':
                this.triggerWhatIfSimulation();
                break;
        }
    }

    triggerComparisonSlider() {
        if (this.features.comparisonSlider) {
            // Wait a moment then trigger auto-demo
            setTimeout(() => {
                this.features.comparisonSlider.autoDemo();
            }, 800);
        }
    }

    triggerAIDemo() {
        if (this.features.aiAssistant && !this.features.aiAssistant.hasTriggeredDemo) {
            // Mark as triggered to prevent multiple demos
            this.features.aiAssistant.hasTriggeredDemo = true;
            
            // Auto-ask a sample question
            setTimeout(() => {
                this.features.aiAssistant.simulateUserMessage("What caused the Aral Sea to disappear?");
            }, 2000);
        }
    }

    triggerVideoSection() {
        if (this.features.videoHandler) {
            // Auto-play video when section is entered
            setTimeout(() => {
                this.features.videoHandler.playVideo();
            }, 1000);
        }
    }

    triggerWhatIfSimulation() {
        const sliders = document.querySelectorAll('#what-if-section input[type="range"]');
        
        // Animate sliders to show interactivity
        sliders.forEach((slider, index) => {
            setTimeout(() => {
                slider.style.transform = 'scale(1.05)';
                slider.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
                
                setTimeout(() => {
                    slider.style.transform = 'scale(1)';
                    slider.style.boxShadow = 'none';
                }, 1000);
            }, index * 300);
        });
    }

    triggerSectionAnimation(elementId, index, direction) {
        const animations = {
            'hero': () => this.animateHeroSection(),
            'comparison-section': () => this.animateComparisonSection(),
            'timelapse-video-section': () => this.animateVideoSection(),
            'mystery-begins': () => this.animateMysterySection(),
            'investigation-deepens': () => this.animateInvestigationSection(),
            'evidence-unfolds': () => this.animateEvidenceSection(),
            'ai-assistant-section': () => this.animateAISection(),
            'what-if-section': () => this.animateWhatIfSection(),
            'conclusion': () => this.animateConclusionSection()
        };

        if (animations[elementId]) {
            animations[elementId]();
        }
    }

    animateHeroSection() {
        const title = document.querySelector('.hero-title');
        const subtitle = document.querySelector('.hero-subtitle');
        const description = document.querySelector('.hero-description');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        
        // Stagger animation
        this.staggerAnimation([title, subtitle, description, scrollIndicator], 'fadeInUp', 300);
    }

    animateComparisonSection() {
        const container = document.querySelector('.comparison-container');
        const stats = document.querySelectorAll('.stat-item');
        
        if (container) {
            container.classList.add('animate-fade-in');
            
            // Animate statistics with counting effect
            setTimeout(() => {
                this.staggerAnimation(stats, 'animate-slide-up', 200);
                this.animateCountingNumbers();
            }, 500);
        }
    }

    animateVideoSection() {
        const videoContainer = document.querySelector('.video-container');
        const controls = document.querySelectorAll('.video-control-btn');
        
        if (videoContainer) {
            videoContainer.classList.add('animate-scale-in');
            setTimeout(() => {
                this.staggerAnimation(controls, 'animate-slide-up', 100);
            }, 600);
        }
    }

    animateMysterySection() {
        const dataPoint = document.querySelector('.data-point');
        if (dataPoint) {
            dataPoint.classList.add('animate-slide-in');
            
            // Trigger number animation
            setTimeout(() => {
                if (window.terraApp) {
                    window.terraApp.animateDataPoint();
                }
            }, 500);
        }
    }

    animateInvestigationSection() {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.classList.add('animate-fade-in');
            
            // Initialize map after animation
            setTimeout(() => {
                if (window.mapHandler) {
                    window.mapHandler.initializeMap();
                }
            }, 800);
        }
    }

    animateEvidenceSection() {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('animate-scale-in');
            
            setTimeout(() => {
                if (window.dataVizHandler) {
                    window.dataVizHandler.initializeCharts();
                }
            }, 600);
        }
    }

    animateAISection() {
        const chatContainer = document.querySelector('.ai-chat-container');
        const quickButtons = document.querySelectorAll('.quick-btn');
        
        if (chatContainer) {
            chatContainer.classList.add('animate-scale-in');
            
            setTimeout(() => {
                this.staggerAnimation(quickButtons, 'animate-slide-up', 100);
            }, 800);
        }
    }

    animateWhatIfSection() {
        const controls = document.querySelectorAll('.controls');
        this.staggerAnimation(controls, 'animate-slide-up', 200);
    }

    animateConclusionSection() {
        const beforeAfter = document.querySelectorAll('.before, .after');
        this.staggerAnimation(beforeAfter, 'animate-zoom-in', 400);
    }

    animateCountingNumbers() {
        const numbers = document.querySelectorAll('.stat-number');
        
        numbers.forEach(numberEl => {
            const finalNumber = numberEl.textContent.replace(/[^0-9]/g, '');
            const suffix = numberEl.textContent.replace(/[0-9]/g, '');
            
            if (finalNumber) {
                this.animateCounter(numberEl, 0, parseInt(finalNumber), suffix, 2000);
            }
        });
    }

    animateCounter(element, start, end, suffix = '', duration = 2000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 16);
    }

    staggerAnimation(elements, className, delay) {
        elements.forEach((element, index) => {
            if (element) {
                setTimeout(() => {
                    element.classList.add(className);
                }, index * delay);
            }
        });
    }

    updateSatelliteImageSmooth(stepIndex) {
        const imageEl = document.getElementById('satellite-image');
        const yearEl = document.querySelector('.year-display');
        
        if (!imageEl || !window.terraApp) return;
        
        this.isTransitioning = true;
        
        // Fade out with scale effect
        imageEl.style.transition = 'all 0.3s ease';
        imageEl.style.opacity = '0.3';
        imageEl.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Update content
            if (stepIndex < window.terraApp.satelliteImages.length) {
                imageEl.src = window.terraApp.satelliteImages[stepIndex];
                if (yearEl) {
                    yearEl.textContent = window.terraApp.years[stepIndex];
                }
            }
            
            // Fade in with scale effect
            imageEl.style.opacity = '1';
            imageEl.style.transform = 'scale(1)';
            
            this.isTransitioning = false;
        }, 300);
    }

    updateNavigationIndicators(index) {
        // Update progress indicator if it exists
        const indicators = document.querySelectorAll('.nav-indicator');
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Update progress bar if it exists
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progress = ((index + 1) / 8) * 100; // Assuming 8 total sections
            progressBar.style.width = progress + '%';
        }
    }

    setupIntersectionObserver() {
        // Setup intersection observer for additional scroll effects
        const observerOptions = {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    // Trigger lazy loading for images
                    const images = entry.target.querySelectorAll('img[data-src]');
                    images.forEach(img => {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    });
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('.story-section, .step').forEach(section => {
            observer.observe(section);
        });
    }

    addCustomScrollEffects() {
        // Add custom CSS animations
        const style = document.createElement('style');
        style.textContent = `
            .fadeInUp {
                animation: fadeInUp 0.8s ease-out forwards;
            }
            
            .animate-slide-in {
                animation: slideInLeft 0.8s ease-out forwards;
            }
            
            .animate-fade-in {
                animation: fadeIn 1s ease-out forwards;
            }
            
            .animate-scale-in {
                animation: scaleIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            .animate-slide-up {
                animation: slideUp 0.6s ease-out forwards;
            }
            
            .animate-zoom-in {
                animation: zoomIn 0.8s ease-out forwards;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes zoomIn {
                from {
                    opacity: 0;
                    transform: scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            /* Smooth transitions */
            .step {
                transition: opacity 0.3s ease;
            }
            
            .step.active {
                opacity: 1;
            }
            
            /* Progress indicators */
            .progress-bar {
                transition: width 0.5s ease;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            }
        `;
        document.head.appendChild(style);
    }

    // Public method to scroll to specific section
    scrollToSection(index) {
        const sections = document.querySelectorAll('.step');
        if (sections[index]) {
            sections[index].scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Public method to trigger specific feature
    triggerFeature(featureName) {
        switch (featureName) {
            case 'comparison':
                this.triggerComparisonSlider();
                break;
            case 'ai':
                this.triggerAIDemo();
                break;
            case 'video':
                this.triggerVideoSection();
                break;
        }
    }

    // Public method to get current section
    getCurrentSection() {
        return this.currentSection;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.scrollamaHandler = new ScrollamaHandler();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollamaHandler;
}
