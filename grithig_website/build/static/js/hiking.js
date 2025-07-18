// Hiking/Running Page - Map and GPX functionality

let map;
let gpxLayers = [];

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('map') && window.tracksData) {
        initializeMap();
    }
});

function initializeMap() {
    // Create map centered on Wales/Brecon Beacons area
    // Default center - will be updated based on actual track data
    let defaultCenter = [51.8, -3.67];
    let defaultZoom = 12;
    
    // If we have track data, calculate center from first track
    if (window.tracksData && window.tracksData.length > 0) {
        const firstTrack = window.tracksData[0];
        if (firstTrack.center_lat && firstTrack.center_lon) {
            defaultCenter = [firstTrack.center_lat, firstTrack.center_lon];
        }
    }
    
    // Initialize Leaflet map
    map = L.map('map').setView(defaultCenter, defaultZoom);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add Ordnance Survey layer as alternative (good for UK hiking)
    const osLayer = L.tileLayer('https://api.os.uk/maps/raster/v1/zxy/Outdoor_3857/{z}/{x}/{y}.png?key=YOUR_OS_API_KEY', {
        attribution: '© <a href="https://www.ordnancesurvey.co.uk/">Ordnance Survey</a>',
        maxZoom: 16
    });
    
    // Layer control
    const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }),
        "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap contributors'
        })
    };
    
    L.control.layers(baseMaps).addTo(map);
    
    // Load and display GPX tracks
    if (window.tracksData) {
        loadGPXTracks();
    }
    
    // Add scale control
    L.control.scale().addTo(map);
}

function loadGPXTracks() {
    console.log('Loading GPX tracks...', window.tracksData);
    const colors = ['#2c5530', '#4a7c59', '#6b8e23', '#8fbc8f', '#2e8b57'];
    let allBounds = [];
    
    if (!window.tracksData || window.tracksData.length === 0) {
        console.warn('No tracks data available');
        return;
    }
    
    window.tracksData.forEach((track, index) => {
        const color = colors[index % colors.length];
        console.log(`Loading GPX file: ${track.filename}`);
        
        // Load GPX file
        fetch(`gpx/${track.filename}`)
            .then(response => {
                console.log(`GPX file response status: ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(gpxText => {
                console.log(`GPX text length: ${gpxText.length}`);
                const gpxLayer = parseAndDisplayGPX(gpxText, track, color, index);
                if (gpxLayer) {
                    gpxLayers.push(gpxLayer);
                    console.log(`Successfully added GPX layer for ${track.name}`);
                    
                    // Collect bounds for fitting map
                    if (gpxLayer.getBounds) {
                        allBounds.push(gpxLayer.getBounds());
                    }
                    
                    // After loading all tracks, fit map to show all routes
                    if (gpxLayers.length === window.tracksData.length) {
                        fitMapToAllTracks(allBounds);
                    }
                } else {
                    console.error(`Failed to create GPX layer for ${track.name}`);
                }
            })
            .catch(error => {
                console.error(`Error loading GPX file ${track.filename}:`, error);
            });
    });
}

function parseAndDisplayGPX(gpxText, trackData, color, index) {
    try {
        console.log(`Parsing GPX for ${trackData.name}...`);
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
        
        // Check for parsing errors
        const parserError = gpxDoc.querySelector('parsererror');
        if (parserError) {
            console.error('XML parsing error:', parserError.textContent);
            return null;
        }
        
        // Extract track points
        const trackPoints = [];
        const trkpts = gpxDoc.querySelectorAll('trkpt');
        console.log(`Found ${trkpts.length} track points in GPX file`);
        
        trkpts.forEach(trkpt => {
            const lat = parseFloat(trkpt.getAttribute('lat'));
            const lon = parseFloat(trkpt.getAttribute('lon'));
            if (!isNaN(lat) && !isNaN(lon)) {
                trackPoints.push([lat, lon]);
            }
        });
        
        console.log(`Processed ${trackPoints.length} valid track points`);
        
        if (trackPoints.length === 0) {
            console.warn(`No track points found in ${trackData.filename}`);
            return null;
        }
        
        // Create polyline
        const polyline = L.polyline(trackPoints, {
            color: color,
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(map);
        
        // Create popup content
        const popupContent = createTrackPopup(trackData, index);
        polyline.bindPopup(popupContent);
        
        // Add hover effects
        polyline.on('mouseover', function(e) {
            this.setStyle({
                weight: 6,
                opacity: 1
            });
            
            // Highlight corresponding track card
            const trackCard = document.querySelector(`.track-card[data-track="${index}"]`);
            if (trackCard) {
                trackCard.style.backgroundColor = '#e8f5e8';
                trackCard.style.borderLeftColor = color;
                trackCard.style.borderLeftWidth = '6px';
            }
        });
        
        polyline.on('mouseout', function(e) {
            this.setStyle({
                weight: 4,
                opacity: 0.8
            });
            
            // Reset track card highlight
            const trackCard = document.querySelector(`.track-card[data-track="${index}"]`);
            if (trackCard) {
                trackCard.style.backgroundColor = '#f8f9fa';
                trackCard.style.borderLeftColor = '#4a7c59';
                trackCard.style.borderLeftWidth = '4px';
            }
        });
        
        // Add click handler to open popup
        polyline.on('click', function(e) {
            this.openPopup();
        });
        
        // Add start and end markers
        if (trackPoints.length > 0) {
            const startIcon = L.divIcon({
                className: 'start-marker',
                html: '<div style="background-color: ' + color + '; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">S</div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const endIcon = L.divIcon({
                className: 'end-marker',
                html: '<div style="background-color: ' + color + '; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">E</div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            L.marker(trackPoints[0], { icon: startIcon }).addTo(map)
                .bindPopup(`Start: ${trackData.name}`);
            
            L.marker(trackPoints[trackPoints.length - 1], { icon: endIcon }).addTo(map)
                .bindPopup(`End: ${trackData.name}`);
        }
        
        return polyline;
        
    } catch (error) {
        console.error(`Error parsing GPX file ${trackData.filename}:`, error);
        return null;
    }
}

function createTrackPopup(trackData, index) {
    return `
        <div class="track-popup">
            <h4>${trackData.name}</h4>
            <div class="popup-details">
                <span class="popup-type">${trackData.type || 'Route'}</span>
                ${trackData.distance ? `<span class="popup-distance">${trackData.distance}</span>` : ''}
                ${trackData.elevation_gain ? `<span class="popup-elevation">⬆ ${trackData.elevation_gain}</span>` : ''}
            </div>
            ${trackData.description ? `<p class="popup-description">${trackData.description}</p>` : ''}
            <div class="popup-actions">
                <a href="gpx/${trackData.filename}" download class="popup-download-btn">Download GPX</a>
                <button onclick="focusOnTrack(${index})" class="popup-focus-btn">Focus on Route</button>
            </div>
        </div>
    `;
}

function fitMapToAllTracks(bounds) {
    if (bounds.length > 0) {
        // Create a group to get overall bounds
        const group = new L.featureGroup();
        bounds.forEach(bound => {
            if (bound.isValid()) {
                group.addLayer(L.rectangle(bound, { opacity: 0 }));
            }
        });
        
        if (group.getBounds().isValid()) {
            map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }
}

function focusOnTrack(index) {
    if (gpxLayers[index]) {
        map.fitBounds(gpxLayers[index].getBounds(), { padding: [20, 20] });
        
        // Highlight the track temporarily
        const originalStyle = {
            weight: gpxLayers[index].options.weight,
            opacity: gpxLayers[index].options.opacity
        };
        
        gpxLayers[index].setStyle({
            weight: 8,
            opacity: 1
        });
        
        setTimeout(() => {
            gpxLayers[index].setStyle(originalStyle);
        }, 2000);
    }
}

// Add interaction between track cards and map
document.addEventListener('DOMContentLoaded', function() {
    const trackCards = document.querySelectorAll('.track-card');
    
    trackCards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            if (gpxLayers[index]) {
                gpxLayers[index].setStyle({
                    weight: 6,
                    opacity: 1
                });
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (gpxLayers[index]) {
                gpxLayers[index].setStyle({
                    weight: 4,
                    opacity: 0.8
                });
            }
        });
        
        card.addEventListener('click', function() {
            focusOnTrack(index);
            
            // Scroll to map
            const mapElement = document.getElementById('map');
            if (mapElement) {
                mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
});

// Add CSS for popup styling
const popupStyles = `
<style>
.track-popup {
    min-width: 250px;
}

.track-popup h4 {
    margin: 0 0 0.5rem 0;
    color: #2c5530;
}

.popup-details {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
}

.popup-type,
.popup-distance,
.popup-elevation {
    background: #e8f5e8;
    color: #2c5530;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.popup-description {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    line-height: 1.4;
}

.popup-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.popup-download-btn,
.popup-focus-btn {
    background: #4a7c59;
    color: white;
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 15px;
    text-decoration: none;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.3s ease;
}

.popup-download-btn:hover,
.popup-focus-btn:hover {
    background: #2c5530;
}

.start-marker,
.end-marker {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
</style>
`;

// Inject popup styles
document.head.insertAdjacentHTML('beforeend', popupStyles); 