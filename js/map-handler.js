// Interactive map handler using Leaflet.js
class MapHandler {
    constructor() {
        this.map = null;
        this.globalCrisisMap = null;
        this.markers = [];
        this.layers = {};
        this.isInitialized = false;
        this.globalMapInitialized = false;
        
        // Aral Sea coordinates
        this.aralSeaCenter = [45.0, 60.0];
        this.bounds = [[43.5, 58.5], [46.5, 61.5]];
        
        // Global water crisis data
        this.globalCrisisData = [
            { name: 'Aral Sea', coords: [45.0, 60.0], loss: 90, country: 'Kazakhstan/Uzbekistan' },
            { name: 'Lake Chad', coords: [13.0, 14.0], loss: 90, country: 'Chad/Nigeria/Niger/Cameroon' },
            { name: 'Great Salt Lake', coords: [41.1, -112.5], loss: 80, country: 'United States' },
            { name: 'Lake Urmia', coords: [37.7, 45.2], loss: 85, country: 'Iran' },
            { name: 'Dead Sea', coords: [31.5, 35.5], loss: 70, country: 'Jordan/Israel/Palestine' },
            { name: 'Lake Powell', coords: [37.0, -110.7], loss: 60, country: 'United States' },
            { name: 'Lake Mead', coords: [36.1, -114.7], loss: 65, country: 'United States' },
            { name: 'Lake Poopó', coords: [-18.5, -67.1], loss: 95, country: 'Bolivia' },
            { name: 'Salton Sea', coords: [33.3, -115.8], loss: 75, country: 'United States' },
            { name: 'Lake Balkhash', coords: [46.8, 74.9], loss: 55, country: 'Kazakhstan' }
        ];
    }

    initializeMap() {
        if (this.isInitialized) return;
        
        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer) return;
        
        // Clear any existing map
        mapContainer.innerHTML = '';
        
        // Create map
        this.map = L.map('interactive-map', {
            center: this.aralSeaCenter,
            zoom: 8,
            zoomControl: true,
            scrollWheelZoom: true
        });
        
        // Add base layers
        this.addBaseLayers();
        
        // Add Aral Sea data layers
        this.addAralSeaLayers();
        
        // Add markers and annotations
        this.addMarkers();
        
        // Add controls
        this.addControls();
        
        // Set bounds
        this.map.fitBounds(this.bounds);
        
        this.isInitialized = true;
    }

    initializeGlobalCrisisMap() {
        if (this.globalMapInitialized) return;
        
        const globalMapContainer = document.getElementById('global-crisis-map');
        if (!globalMapContainer) return;
        
        // Clear any existing map
        globalMapContainer.innerHTML = '';
        
        // Create global crisis map
        this.globalCrisisMap = L.map('global-crisis-map', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            scrollWheelZoom: true,
            minZoom: 2,
            maxZoom: 10
        });
        
        // Add base layer for global map
        const globalBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });
        globalBaseLayer.addTo(this.globalCrisisMap);
        
        // Add global crisis markers
        this.addGlobalCrisisMarkers();
        
        // Add global map legend programmatically
        this.addGlobalMapLegend();
        
        this.globalMapInitialized = true;
        
        // Auto-fit to show all crisis locations
        setTimeout(() => {
            const group = new L.featureGroup(this.globalCrisisMarkers || []);
            this.globalCrisisMap.fitBounds(group.getBounds().pad(0.1));
        }, 500);
    }

    addGlobalCrisisMarkers() {
        this.globalCrisisMarkers = [];
        
        this.globalCrisisData.forEach(crisis => {
            const { name, coords, loss, country } = crisis;
            
            // Determine color based on water loss percentage
            let color = '#2ecc71'; // Green for mild loss
            let severity = 'Mild Loss';
            let icon = '💧';
            
            if (loss > 80) {
                color = '#e74c3c'; // Red for severe loss
                severity = 'Severe Loss';
                icon = '🚨';
            } else if (loss > 50) {
                color = '#f39c12'; // Orange for moderate loss
                severity = 'Moderate Loss';
                icon = '⚠️';
            }
            
            // Create circle marker
            const marker = L.circle(coords, {
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                radius: Math.max(50000, loss * 1000), // Scale radius by loss percentage
                weight: 2
            });
            
            // Create detailed popup content
            const popupContent = `
                <div class="global-crisis-popup">
                    <div class="crisis-icon">${icon}</div>
                    <h4>${name}</h4>
                    <p><strong>Location:</strong> ${country}</p>
                    <p><strong>Water Loss:</strong> ${loss}%</p>
                    <p><strong>Severity:</strong> ${severity}</p>
                    <div class="crisis-description">
                        ${this.getCrisisDescription(name)}
                    </div>
                    ${name === 'Aral Sea' ? '<p class="highlight">👆 This is our main story!</p>' : ''}
                </div>
            `;
            
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-crisis-popup'
            });
            
            // Add hover effect
            marker.on('mouseover', function() {
                this.openPopup();
            });
            
            marker.addTo(this.globalCrisisMap);
            this.globalCrisisMarkers.push(marker);
        });
    }

    getCrisisDescription(lakeName) {
        const descriptions = {
            'Aral Sea': 'Once the 4th largest lake globally, now 90% gone due to Soviet irrigation projects.',
            'Lake Chad': 'Shrunk 90% since 1960s due to climate change and increased irrigation.',
            'Great Salt Lake': 'At historic lows due to drought and increased water diversions.',
            'Lake Urmia': 'Iran\'s largest lake, severely impacted by dam construction and drought.',
            'Dead Sea': 'Dropping 1 meter per year due to mineral extraction and river diversions.',
            'Lake Powell': 'Major Colorado River reservoir at critically low levels.',
            'Lake Mead': 'Largest US reservoir, showing "bathtub ring" from water level drops.',
            'Lake Poopó': 'Bolivia\'s second-largest lake completely dried up in 2015.',
            'Salton Sea': 'California\'s largest lake shrinking, creating toxic dust storms.',
            'Lake Balkhash': 'Central Asian lake threatened by mining and climate change.'
        };
        
        return descriptions[lakeName] || 'Significant water loss due to human activity and climate change.';
    }

    addGlobalMapLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'global-map-legend');
            div.innerHTML = `
                <div class="legend-content">
                    <h4>Water Loss Severity</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <i class="legend-marker" style="background:#e74c3c"></i>
                            <span>Severe Loss >80%</span>
                        </div>
                        <div class="legend-item">
                            <i class="legend-marker" style="background:#f39c12"></i>
                            <span>Moderate Loss 50–80%</span>
                        </div>
                        <div class="legend-item">
                            <i class="legend-marker" style="background:#2ecc71"></i>
                            <span>Mild Loss <50%</span>
                        </div>
                    </div>
                </div>
            `;
            
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        
        legend.addTo(this.globalCrisisMap);
    }

    addBaseLayers() {
        // Satellite imagery base layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: 'Tiles © Esri'
        });
        
        // OpenStreetMap base layer
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        });
        
        // Add satellite as default
        satelliteLayer.addTo(this.map);
        
        // Store layers
        this.layers.satellite = satelliteLayer;
        this.layers.osm = osmLayer;
    }

    addAralSeaLayers() {
        // Historical Aral Sea boundaries (more accurate data)
        const boundaries = {
            1999: [[43.7, 58.8], [46.2, 61.2]], // Original size
            2010: [[44.0, 59.2], [45.8, 60.8]], // Significant shrinkage
            2024: [[44.3, 59.8], [45.1, 60.4]]  // Current remnants
        };
        
        Object.entries(boundaries).forEach(([year, coords]) => {
            const rectangle = L.rectangle(coords, {
                color: this.getYearColor(year),
                weight: 3,
                fillOpacity: 0.4,
                dashArray: year === '1999' ? null : '10, 10' // Dashed for historical boundaries
            });
            
            rectangle.bindPopup(`
                <div class="boundary-popup">
                    <h4>Aral Sea Boundary - ${year}</h4>
                    <p>Water coverage area in ${year}</p>
                    <p><strong>Status:</strong> ${this.getYearStatus(year)}</p>
                </div>
            `);
            
            this.layers[`boundary_${year}`] = rectangle;
            
            if (year === '1999') {
                rectangle.addTo(this.map);
            }
        });
    }

    getYearStatus(year) {
        const statuses = {
            '1999': 'Full lake, thriving ecosystem',
            '2010': 'Severe shrinkage, ecosystem collapse',
            '2024': 'Nearly dried up, environmental disaster'
        };
        return statuses[year] || 'Historical boundary';
    }

    addMarkers() {
        const locations = [
            {
                coords: [44.1, 59.8],
                title: 'Aralsk (Former Port City)',
                description: 'Once a thriving fishing port, now 100km from water. Ships sit stranded in the desert.',
                icon: '🏘️',
                type: 'settlement'
            },
            {
                coords: [45.5, 60.5],
                title: 'Ship Graveyard',
                description: 'Abandoned fishing vessels create an eerie "ship cemetery" in the former lakebed.',
                icon: '⚓',
                type: 'landmark'
            },
            {
                coords: [44.8, 59.2],
                title: 'Cotton Irrigation Canal',
                description: 'Part of the massive Soviet irrigation system that diverted the Amu Darya river.',
                icon: '🌱',
                type: 'infrastructure'
            },
            {
                coords: [45.8, 61.0],
                title: 'Aralkum Desert',
                description: 'New desert formed from exposed lakebed, source of toxic salt storms.',
                icon: '🏜️',
                type: 'environmental'
            },
            {
                coords: [44.5, 60.8],
                title: 'Kokaral Dam',
                description: 'Successful restoration project that saved the North Aral Sea.',
                icon: '🚧',
                type: 'restoration'
            }
        ];

        locations.forEach((location, index) => {
            const marker = L.marker(location.coords)
                .bindPopup(`
                    <div class="custom-popup enhanced">
                        <div class="popup-icon">${location.icon}</div>
                        <h4>${location.title}</h4>
                        <p>${location.description}</p>
                        <div class="popup-type">${location.type.toUpperCase()}</div>
                    </div>
                `)
                .on('click', () => {
                    this.highlightMarker(index);
                });
            
            marker.addTo(this.map);
            this.markers.push(marker);
        });
    }

    addControls() {
        // Enhanced year selector control
        const yearControl = L.control({ position: 'topright' });
        
        yearControl.onAdd = () => {
            const div = L.DomUtil.create('div', 'year-selector-control enhanced');
            div.innerHTML = `
                <div class="year-selector">
                    <label>Historical View:</label>
                    <select id="year-selector">
                        <option value="1999">1999 - Original Lake</option>
                        <option value="2010">2010 - Major Shrinkage</option>
                        <option value="2024">2024 - Current Remnants</option>
                    </select>
                    <div class="year-info" id="year-info">
                        Select a year to see the lake's evolution
                    </div>
                </div>
            `;
            
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        
        yearControl.addTo(this.map);
        
        // Add event listener for year selector with info updates
        setTimeout(() => {
            const selector = document.getElementById('year-selector');
            const yearInfo = document.getElementById('year-info');
            
            if (selector) {
                selector.addEventListener('change', (e) => {
                    this.showYearBoundary(e.target.value);
                    this.updateYearInfo(e.target.value, yearInfo);
                });
            }
        }, 100);
        
        // Enhanced layer control
        const baseMaps = {
            'Satellite View': this.layers.satellite,
            'Street Map': this.layers.osm
        };
        
        const overlayMaps = {
            '1999 Boundary': this.layers.boundary_1999,
            '2010 Boundary': this.layers.boundary_2010,
            '2024 Boundary': this.layers.boundary_2024
        };
        
        L.control.layers(baseMaps, overlayMaps, {
            position: 'topleft'
        }).addTo(this.map);
    }

    updateYearInfo(year, infoElement) {
        const info = {
            '1999': 'Full lake: 68,000 km² surface area',
            '2010': 'Major decline: ~40,000 km² remaining',
            '2024': 'Critical state: ~7,000 km² remaining'
        };
        
        if (infoElement) {
            infoElement.textContent = info[year] || '';
        }
    }

    showYearBoundary(year) {
        // Hide all boundary layers
        Object.keys(this.layers).forEach(key => {
            if (key.startsWith('boundary_')) {
                this.map.removeLayer(this.layers[key]);
            }
        });
        
        // Show selected year boundary
        const boundaryLayer = this.layers[`boundary_${year}`];
        if (boundaryLayer) {
            boundaryLayer.addTo(this.map);
        }
    }

    getYearColor(year) {
        const colors = {
            '1999': '#3498db',  // Blue - healthy water
            '2010': '#f39c12',  // Orange - warning
            '2024': '#e74c3c'   // Red - critical/disaster
        };
        return colors[year] || '#95a5a6';
    }

    // Public methods
    flyToLocation(coords, zoom = 12) {
        if (this.map) {
            this.map.flyTo(coords, zoom, {
                animate: true,
                duration: 1.5
            });
        }
    }

    highlightMarker(index) {
        if (this.markers[index]) {
            this.markers[index].openPopup();
            this.flyToLocation(this.markers[index].getLatLng(), 13);
        }
    }

    // Method to focus on Aral Sea from global map
    focusOnAralSea() {
        if (this.globalCrisisMap) {
            this.globalCrisisMap.flyTo([45.0, 60.0], 6, {
                animate: true,
                duration: 2.0
            });
            
            // Find and open Aral Sea popup
            setTimeout(() => {
                const aralMarker = this.globalCrisisMarkers?.find(marker => {
                    const popup = marker.getPopup();
                    return popup && popup.getContent().includes('Aral Sea');
                });
                if (aralMarker) {
                    aralMarker.openPopup();
                }
            }, 2000);
        }
    }

    // Initialize both maps when called
    initializeAllMaps() {
        this.initializeMap();
        this.initializeGlobalCrisisMap();
    }
}

// Enhanced CSS for both maps
const enhancedMapStyles = document.createElement('style');
enhancedMapStyles.textContent = `
    /* Aral Sea Map Styles */
    .year-selector-control.enhanced {
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        min-width: 200px;
    }
    
    .year-selector label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #2c3e50;
    }
    
    .year-selector select {
        width: 100%;
        padding: 8px;
        border: 2px solid #3498db;
        border-radius: 5px;
        font-size: 0.9rem;
        background: white;
    }
    
    .year-info {
        margin-top: 10px;
        padding: 8px;
        background: #ecf0f1;
        border-radius: 4px;
        font-size: 0.8rem;
        color: #34495e;
        text-align: center;
    }
    
    .custom-popup.enhanced {
        text-align: center;
        min-width: 250px;
        padding: 10px;
    }
    
    .popup-type {
        display: inline-block;
        background: #3498db;
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        margin-top: 5px;
    }
    
    .boundary-popup h4 {
        color: #2c3e50;
        margin: 0 0 10px 0;
    }
    
    /* Global Crisis Map Styles */
    .global-map-legend {
        background: rgba(255, 255, 255, 0.95);
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
    }
    
    .legend-content h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-size: 1rem;
    }
    
    .legend-items {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
    }
    
    .legend-marker {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        border: 1px solid rgba(0,0,0,0.2);
    }
    
    .global-crisis-popup {
        text-align: center;
        min-width: 280px;
        padding: 10px;
    }
    
    .crisis-icon {
        font-size: 2.5em;
        margin-bottom: 10px;
    }
    
    .global-crisis-popup h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-size: 1.2rem;
    }
    
    .global-crisis-popup p {
        margin: 5px 0;
        line-height: 1.4;
    }
    
    .crisis-description {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        margin: 10px 0;
        font-style: italic;
        color: #555;
    }
    
    .highlight {
        background: #3498db;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-weight: bold;
        margin: 10px 0;
    }
    
    .custom-crisis-popup .leaflet-popup-content {
        margin: 12px 15px;
    }
    
    /* Global crisis statistics styling */
    .crisis-stats {
        display: flex;
        justify-content: space-around;
        margin: 2rem 0;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .crisis-stat-item {
        text-align: center;
        flex: 1;
        min-width: 200px;
    }
    
    .crisis-number {
        display: block;
        font-size: 2.5rem;
        font-weight: bold;
        color: #e74c3c;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .crisis-label {
        display: block;
        font-size: 1rem;
        opacity: 0.9;
        margin-top: 0.5rem;
    }
    
    .global-message {
        text-align: center;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(231, 76, 60, 0.1);
        border-radius: 10px;
        border-left: 4px solid #e74c3c;
    }
    
    @media (max-width: 768px) {
        .crisis-stats {
            flex-direction: column;
        }
        
        .crisis-number {
            font-size: 2rem;
        }
        
        .global-crisis-popup {
            min-width: 250px;
        }
        
        .year-selector-control.enhanced {
            min-width: 180px;
            padding: 12px;
        }
    }
`;
document.head.appendChild(enhancedMapStyles);

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mapHandler = new MapHandler();
    
    // Initialize maps when their containers are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'interactive-map' && !window.mapHandler.isInitialized) {
                    setTimeout(() => window.mapHandler.initializeMap(), 100);
                }
                if (entry.target.id === 'global-crisis-map' && !window.mapHandler.globalMapInitialized) {
                    setTimeout(() => window.mapHandler.initializeGlobalCrisisMap(), 100);
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe both map containers
    const aralMap = document.getElementById('interactive-map');
    const globalMap = document.getElementById('global-crisis-map');
    
    if (aralMap) observer.observe(aralMap);
    if (globalMap) observer.observe(globalMap);
});

// Make available globally
window.MapHandler = MapHandler;
