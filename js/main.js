// Main application controller - UPDATED with video integration
class TerraTimelapse {
    constructor() {
        this.currentStep = 0;
        this.isAudioEnabled = true;
        
        // Updated to use real image paths
        this.satelliteImages = [
            'assets/images/aral-sea-1999.jpeg',
            'assets/images/aral-sea-2005.jpeg',
            'assets/images/aral-sea-2010.jpeg',
            'assets/images/aral-sea-2015.jpeg',
            'assets/images/aral-sea-2020.jpeg',
            'assets/images/aral-sea-2024.jpg'
        ];
        this.years = [1999, 2005, 2010, 2015, 2020, 2025];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeScrollama();
        this.initializeAudio();
        this.initializeWhatIfSimulator();
        this.setupVideoIntegration(); // NEW
        this.setupTouchGestures(); // NEW: Touch gestures for mobile navigation
    }

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;

        const handleGesture = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.navigatePreviousSection();
                    } else {
                        this.navigateNextSection();
                    }
                }
            } else {
                // Vertical swipe - could be used for other controls if needed
            }
        };

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleGesture();
        });
    }

    navigatePreviousSection() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.scrollToStep(this.currentStep);
        }
    }

    navigateNextSection() {
        const maxStep = document.querySelectorAll('.step').length - 1;
        if (this.currentStep < maxStep) {
            this.currentStep++;
            this.scrollToStep(this.currentStep);
        }
    }

    scrollToStep(stepIndex) {
        const steps = document.querySelectorAll('.step');
        if (steps[stepIndex]) {
            steps[stepIndex].scrollIntoView({ behavior: 'smooth' });
        }
    }

    setupEventListeners() {
        // Audio toggle
        document.getElementById('audio-toggle').addEventListener('click', () => {
            this.toggleAudio();
        });

        // What If button
        document.getElementById('what-if-btn').addEventListener('click', () => {
            this.showWhatIf();
        });

        // Local issues finder
        document.getElementById('find-local').addEventListener('click', () => {
            this.findLocalIssues();
        });
    }

    // NEW: Setup video integration with scrollytelling
    setupVideoIntegration() {
        // Sync video with scroll sections
        const videoSection = document.getElementById('timelapse-video-section');
        if (videoSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Optional: Auto-play video when it comes into view
                        // window.videoHandler?.playVideo();
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(videoSection);
        }
    }

    initializeScrollama() {
        const scroller = scrollama();

        scroller
            .setup({
                step: '.step',
                offset: 0.5,
                debug: false
            })
            .onStepEnter((response) => {
                this.handleStepEnter(response);
            })
            .onStepExit((response) => {
                this.handleStepExit(response);
            });

        // Resize handler
        window.addEventListener('resize', scroller.resize);
    }

    handleStepEnter(response) {
        const { element, index } = response;
        this.currentStep = index;

        // Update satellite image based on step (skip video section)
        const imageSteps = [0, 2, 3, 4, 5, 6]; // Skip step 1 (video section)
        const imageIndex = imageSteps.indexOf(index);
        
        if (imageIndex !== -1 && imageIndex < this.satelliteImages.length) {
            this.updateSatelliteImage(imageIndex);
        }

        // Handle specific step actions
        switch (index) {
            case 1: // Video section
                this.playAudio('mystery');
                break;
            case 2: // Mystery begins
                this.playAudio('mystery');
                this.animateDataPoint();
                break;
            case 3: // Investigation
                this.initializeMap();
                this.playAudio('investigation');
                break;
            case 4: // Evidence
                this.initializeDataViz();
                this.playAudio('evidence');
                break;
            case 6: // Conclusion
                this.playAudio('conclusion');
                break;
        }
    }

    handleStepExit(response) {
        // Handle step exit logic if needed
    }

    updateSatelliteImage(stepIndex) {
        const imageEl = document.getElementById('satellite-image');
        const yearEl = document.querySelector('.year-display');
        
        if (imageEl && stepIndex < this.satelliteImages.length) {
            imageEl.src = this.satelliteImages[stepIndex];
            if (yearEl) {
                yearEl.textContent = this.years[stepIndex];
            }
        }
    }

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        const btn = document.getElementById('audio-toggle');
        btn.textContent = this.isAudioEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
        
        if (!this.isAudioEnabled) {
            this.stopAllAudio();
        }
    }

    initializeAudio() {
        // Initialize audio elements
        this.audioElements = {
            water: document.getElementById('water-sounds'),
            wind: document.getElementById('wind-sounds')
        };
    }

    playAudio(type) {
        if (!this.isAudioEnabled) return;

        // Stop all audio first
        this.stopAllAudio();

        // Play appropriate audio
        switch (type) {
            case 'mystery':
            case 'investigation':
                if (this.audioElements.water) {
                    this.audioElements.water.play();
                }
                break;
            case 'evidence':
            case 'conclusion':
                if (this.audioElements.wind) {
                    this.audioElements.wind.play();
                }
                break;
        }
    }

    stopAllAudio() {
        Object.values(this.audioElements).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    animateDataPoint() {
        const statEl = document.querySelector('.stat');
        if (statEl) {
            let count = 0;
            const target = 90;
            const increment = target / 100;
            
            const counter = setInterval(() => {
                count += increment;
                statEl.textContent = Math.floor(count) + '%';
                
                if (count >= target) {
                    clearInterval(counter);
                    statEl.textContent = target + '%';
                }
            }, 20);
        }
    }

    initializeMap() {
        // Initialize Leaflet map (will be implemented in map-handler.js)
        if (typeof initMap === 'function') {
            initMap();
        }
    }

    initializeDataViz() {
        // Initialize data visualization (will be implemented in data-viz.js)
        if (typeof initDataViz === 'function') {
            initDataViz();
        }
    }

    showWhatIf() {
        const whatIfSection = document.getElementById('what-if-section');
        if (whatIfSection) {
            whatIfSection.classList.remove('hidden');
            whatIfSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    initializeWhatIfSimulator() {
        const waterSlider = document.getElementById('water-usage');
        const conservationSlider = document.getElementById('conservation');
        const waterValue = document.getElementById('water-value');
        const conservationValue = document.getElementById('conservation-value');
        const resultDiv = document.getElementById('scenario-result');

        if (waterSlider && conservationSlider) {
            const updateScenario = () => {
                const waterUsage = parseInt(waterSlider.value);
                const conservation = parseInt(conservationSlider.value);
                
                waterValue.textContent = waterUsage + '%';
                conservationValue.textContent = conservation + '%';

                // Calculate scenario result
                const waterRemaining = Math.max(0, 100 - waterUsage + conservation);
                let message = '';
                
                if (waterRemaining > 70) {
                    message = '🌊 The Aral Sea would still be thriving with abundant fish populations and healthy coastal communities.';
                } else if (waterRemaining > 40) {
                    message = '⚠️ The sea would be reduced but stable, supporting limited fishing and local ecosystems.';
                } else if (waterRemaining > 10) {
                    message = '🏜️ Significant shrinkage would occur, with major environmental and economic impacts.';
                } else {
                    message = '💀 Complete ecological collapse, similar to what actually happened.';
                }
                
                resultDiv.innerHTML = `<strong>Water Remaining: ${waterRemaining}%</strong><br>${message}`;
            };

            waterSlider.addEventListener('input', updateScenario);
            conservationSlider.addEventListener('input', updateScenario);
            
            // Initialize
            updateScenario();
        }
    }

    findLocalIssues() {
        const resultsDiv = document.getElementById('local-issues');
        
        // Simulate getting user location and finding local issues
        resultsDiv.innerHTML = '<p>🔍 Searching for environmental issues near you...</p>';
        
        setTimeout(() => {
            const mockIssues = [
                {
                    title: 'Local Lake Water Quality',
                    description: 'Recent satellite data shows algae bloom concerns in nearby water bodies.',
                    distance: '15 km away'
                },
                {
                    title: 'Urban Heat Island Effect',
                    description: 'Your city shows increasing heat signatures compared to surrounding areas.',
                    distance: 'Your city'
                },
                {
                    title: 'Forest Cover Changes',
                    description: 'Deforestation detected in the region over the past 5 years.',
                    distance: '45 km away'
                }
            ];

            let html = '<h4>Environmental Issues Near You:</h4>';
            mockIssues.forEach(issue => {
                html += `
                    <div style="border: 1px solid #ddd; padding: 1rem; margin: 1rem 0; border-radius: 5px;">
                        <h5>${issue.title}</h5>
                        <p>${issue.description}</p>
                        <small style="color: #666;">${issue.distance}</small>
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }, 2000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terraApp = new TerraTimelapse();
});
