class AudioHandler {
    constructor() {
        this.audioElements = {};
        this.currentTrack = null;
        this.isEnabled = true;
        this.volume = 0.7;

        this.init();
    }

    init() {
        this.setupAudioElements();
        this.preloadAudio();
        this.setupVolumeControls();
    }

    // Setup real audio elements with actual file URLs
    setupAudioElements() {
        const audioTracks = {
            ambient_water: {
                url: 'assets/audio/water-lapping.mp3',
                loop: true,
                volume: 0.6
            },
            wind_desert: {
                url: 'assets/audio/desert-wind.mp3',
                loop: true,
                volume: 0.8
            },
            fishing_village: {
                url: 'assets/audio/fishing-village.mp3',
                loop: true,
                volume: 0.5
            },
            machinery: {
                url: 'assets/audio/irrigation-machinery.mp3',
                loop: true,
                volume: 0.7
            },
            silence_eerie: {
                url: 'assets/audio/eerie-silence.mp3',
                loop: true,
                volume: 0.4
            }
        };

        Object.entries(audioTracks).forEach(([key, config]) => {
            const audio = new Audio(config.url);
            audio.loop = config.loop;
            audio.volume = config.volume * this.volume;
            audio.preload = 'auto';

            this.audioElements[key] = {
                element: audio,
                config: config
            };
        });
    }

    preloadAudio() {
        Object.values(this.audioElements).forEach(({ element }) => {
            element.load();
        });
    }

    setupVolumeControls() {
        const volumeControl = document.createElement('div');
        volumeControl.className = 'volume-control';
        volumeControl.innerHTML = `
            <div class="volume-slider-container">
                <span>🔊</span>
                <input type="range" id="volume-slider" min="0" max="1" step="0.01" value="${this.volume}">
            </div>
        `;

        const navControls = document.querySelector('.nav-controls');
        if (navControls) {
            navControls.appendChild(volumeControl);
        }

        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseFloat(e.target.value));
            });
        }
    }

    playTrack(trackName, fadeIn = true) {
        if (!this.isEnabled || !this.audioElements[trackName]) return;

        const { element } = this.audioElements[trackName];
        this.stopCurrentTrack(fadeIn);

        this.currentTrack = element;

        if (fadeIn) {
            element.volume = 0;
            element.play();
            this.fadeIn(element);
        } else {
            element.play();
        }
    }

    stopCurrentTrack(fadeOut = true) {
        if (!this.currentTrack) return;

        if (fadeOut) {
            this.fadeOut(this.currentTrack, () => {
                this.currentTrack.pause();
                this.currentTrack.currentTime = 0;
            });
        } else {
            this.currentTrack.pause();
            this.currentTrack.currentTime = 0;
        }

        this.currentTrack = null;
    }

    fadeIn(audioElement, duration = 2000) {
        const targetVolume = this.audioElements[Object.keys(this.audioElements).find(key => 
            this.audioElements[key].element === audioElement
        )].config.volume * this.volume;

        const step = targetVolume / (duration / 50);
        let currentVolume = 0;

        const fadeInterval = setInterval(() => {
            currentVolume += step;
            if (currentVolume >= targetVolume) {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
            } else {
                audioElement.volume = currentVolume;
            }
        }, 50);
    }

    fadeOut(audioElement, callback, duration = 1500) {
        const startVolume = audioElement.volume;
        const step = startVolume / (duration / 50);

        const fadeInterval = setInterval(() => {
            audioElement.volume -= step;
            if (audioElement.volume <= 0) {
                audioElement.volume = 0;
                clearInterval(fadeInterval);
                if (callback) callback();
            }
        }, 50);
    }

    setVolume(volume) {
        this.volume = volume;

        Object.entries(this.audioElements).forEach(([key, { element, config }]) => {
            element.volume = config.volume * this.volume;
        });
    }

    toggle() {
        this.isEnabled = !this.isEnabled;

        if (!this.isEnabled) {
            this.stopCurrentTrack(false);
        }

        const audioButton = document.getElementById('audio-toggle');
        if (audioButton) {
            audioButton.textContent = this.isEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
        }
    }

    playSceneAudio(scene) {
        const audioMap = {
            hero: 'ambient_water',
            mystery: 'ambient_water',
            investigation: 'fishing_village',
            evidence: 'machinery',
            conclusion: 'wind_desert',
            whatif: 'silence_eerie'
        };

        const trackName = audioMap[scene];
        if (trackName) {
            this.playTrack(trackName);
        }
    }
}

// Add CSS for volume control UI
const audioStyles = document.createElement('style');
audioStyles.textContent = `
    .volume-control {
        display: flex;
        align-items: center;
    }
    
    .volume-slider-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.5rem;
        border-radius: 5px;
    }
    
    .volume-slider-container span {
        font-size: 0.9rem;
    }
    
    #volume-slider {
        width: 80px;
        height: 5px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 5px;
        outline: none;
    }
    
    #volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 15px;
        height: 15px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }
    
    #volume-slider::-moz-range-thumb {
        width: 15px;
        height: 15px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
        border: none;
    }
`;
document.head.appendChild(audioStyles);

// Make audioHandler globally available
window.audioHandler = new AudioHandler();
