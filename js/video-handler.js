// Advanced Video Handler for Terra Timelapse Detective
class VideoHandler {
    constructor() {
        this.video = null;
        this.isPlaying = false;
        this.currentSpeed = 1;
        this.isFullscreen = false;
        this.videoDuration = 0;
        
        this.init();
    }

    init() {
        this.video = document.getElementById('timelapse-video');
        if (!this.video) return;
        
        this.setupEventListeners();
        this.setupVideoEvents();
        this.setupTimelineMarkers();
    }

    setupEventListeners() {
        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Speed control buttons
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                this.setPlaybackSpeed(speed);
            });
        });

        // Video toggle in navigation
        const videoToggle = document.getElementById('video-toggle');
        if (videoToggle) {
            videoToggle.addEventListener('click', () => this.scrollToVideo());
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isVideoInView()) {
                this.handleKeyboardControls(e);
            }
        });

        // Touch gestures for video control
        this.setupVideoTouchGestures();
    }

    setupVideoEvents() {
        if (!this.video) return;

        // Update play/pause button when video state changes
        this.video.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        });

        this.video.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        });

        this.video.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
            this.onVideoEnd();
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.videoDuration = this.video.duration;
        });

        this.video.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        // Auto-play when video comes into view
        this.setupIntersectionObserver();
    }

    setupTimelineMarkers() {
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => {
            marker.addEventListener('click', () => {
                const timePercent = parseFloat(marker.dataset.time);
                const targetTime = (timePercent / 100) * this.videoDuration;
                this.seekTo(targetTime);
                this.playVideo();
            });
        });
    }

    setupVideoTouchGestures() {
        if (!this.video) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;
        const videoContainer = this.video.parentElement;

        const handleVideoGesture = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe - seek video
                if (Math.abs(deltaX) > minSwipeDistance) {
                    const seekAmount = deltaX > 0 ? 10 : -10; // 10 seconds
                    this.seekBy(seekAmount);
                }
            } else {
                // Vertical swipe - volume control
                if (Math.abs(deltaY) > minSwipeDistance) {
                    const volumeChange = deltaY > 0 ? -0.1 : 0.1; // 10% volume change
                    this.adjustVolume(volumeChange);
                }
            }
        };

        // Double tap to play/pause
        let lastTap = 0;
        videoContainer.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
                this.togglePlayPause();
            }
            lastTap = currentTime;
        });

        // Swipe gestures
        videoContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        videoContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleVideoGesture();
        });

        // Prevent default touch behaviors that might interfere
        videoContainer.addEventListener('touchmove', (e) => {
            if (this.isVideoInView()) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    adjustVolume(change) {
        if (!this.video) return;

        const newVolume = Math.max(0, Math.min(1, this.video.volume + change));
        this.video.volume = newVolume;

        // Update volume slider if it exists
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = newVolume;
        }

        // Visual feedback
        this.showVolumeIndicator(newVolume);
    }

    showVolumeIndicator(volume) {
        // Remove existing indicator
        const existing = document.querySelector('.volume-indicator');
        if (existing) existing.remove();

        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'volume-indicator';
        indicator.textContent = `🔊 ${Math.round(volume * 100)}%`;
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 16px;
            z-index: 1000;
            pointer-events: none;
            animation: fadeOut 2s forwards;
        `;

        document.body.appendChild(indicator);

        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2000);
    }

    handleKeyboardControls(e) {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'KeyR':
                e.preventDefault();
                this.restart();
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.seekBy(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.seekBy(10);
                break;
            case 'Digit1':
                e.preventDefault();
                this.setPlaybackSpeed(0.5);
                break;
            case 'Digit2':
                e.preventDefault();
                this.setPlaybackSpeed(1);
                break;
            case 'Digit3':
                e.preventDefault();
                this.setPlaybackSpeed(2);
                break;
        }
    }

    togglePlayPause() {
        if (!this.video) return;

        if (this.isPlaying) {
            this.video.pause();
        } else {
            this.video.play();
        }
    }

    restart() {
        if (!this.video) return;
        
        this.video.currentTime = 0;
        this.video.play();
    }

    toggleFullscreen() {
        const container = document.querySelector('.video-container');
        if (!container) return;

        if (!this.isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            container.classList.add('fullscreen');
            this.isFullscreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            container.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
    }

    setPlaybackSpeed(speed) {
        if (!this.video) return;

        this.currentSpeed = speed;
        this.video.playbackRate = speed;

        // Update active speed button
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.speed) === speed) {
                btn.classList.add('active');
            }
        });
    }

    seekTo(timeInSeconds) {
        if (this.video) {
            this.video.currentTime = Math.max(0, Math.min(timeInSeconds, this.videoDuration));
        }
    }

    seekBy(seconds) {
        if (this.video) {
            this.video.currentTime += seconds;
        }
    }

    updatePlayPauseButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
        }
    }

    updateProgress() {
        // Update timeline markers based on current time
        const currentTime = this.video.currentTime;
        const progress = (currentTime / this.videoDuration) * 100;
        
        // Highlight current year marker
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => {
            const markerTime = parseFloat(marker.dataset.time);
            if (Math.abs(progress - markerTime) < 10) {
                marker.style.background = '#4a90e2';
                marker.style.color = 'white';
                marker.style.transform = 'scale(1.1)';
            } else {
                marker.style.background = '#2c2c2c';
                marker.style.color = '#e0e0e0';
                marker.style.transform = 'scale(1)';
            }
        });
    }

    onVideoEnd() {
        // Show replay options or navigate to next section
        const conclusion = document.getElementById('conclusion');
        if (conclusion) {
            setTimeout(() => {
                conclusion.scrollIntoView({ behavior: 'smooth' });
            }, 2000);
        }
    }

    scrollToVideo() {
        const videoSection = document.getElementById('timelapse-video-section');
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    scrollToVideoAndPlay() {
        this.scrollToVideo();
        setTimeout(() => {
            this.restart();
        }, 1000);
    }

    isVideoInView() {
        const videoSection = document.getElementById('timelapse-video-section');
        if (!videoSection) return false;
        
        const rect = videoSection.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    // Optional: Auto-play when video section is in view
                    // Uncomment the next line if you want auto-play
                    // this.playVideo();
                }
            });
        }, {
            threshold: [0.1, 0.3, 0.5]
        });

        const videoSection = document.getElementById('timelapse-video-section');
        if (videoSection) {
            observer.observe(videoSection);
        }
    }

    // Public methods for external control
    playVideo() {
        if (this.video) {
            this.video.play();
        }
    }

    pauseVideo() {
        if (this.video) {
            this.video.pause();
        }
    }

    replayFromTimestamp(percentage) {
        if (this.video && this.videoDuration > 0) {
            const targetTime = (percentage / 100) * this.videoDuration;
            this.seekTo(targetTime);
            this.playVideo();
            this.scrollToVideo();
        }
    }

    // Get video analytics
    getVideoStats() {
        return {
            duration: this.videoDuration,
            currentTime: this.video ? this.video.currentTime : 0,
            playbackRate: this.currentSpeed,
            isPlaying: this.isPlaying,
            isFullscreen: this.isFullscreen
        };
    }
}

// Initialize video handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoHandler = new VideoHandler();
    
    // Add keyboard shortcut info to UI
    const videoInfo = document.querySelector('.video-info');
    if (videoInfo) {
        const shortcuts = document.createElement('div');
        shortcuts.className = 'keyboard-shortcuts';
        shortcuts.innerHTML = `
            <div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">⌨️ Keyboard Shortcuts:</h4>
                <div style="font-size: 0.8rem; color: #666; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
                    <span><strong>Space:</strong> Play/Pause</span>
                    <span><strong>R:</strong> Restart</span>
                    <span><strong>F:</strong> Fullscreen</span>
                    <span><strong>← →:</strong> Seek ±10s</span>
                    <span><strong>1,2,3:</strong> Speed Control</span>
                </div>
            </div>
        `;
        videoInfo.appendChild(shortcuts);
    }
});

// Handle fullscreen change events
document.addEventListener('fullscreenchange', () => {
    const container = document.querySelector('.video-container');
    if (!document.fullscreenElement && container) {
        container.classList.remove('fullscreen');
        if (window.videoHandler) {
            window.videoHandler.isFullscreen = false;
        }
    }
});
