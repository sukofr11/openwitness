// app.js - Main Application Logic

class App {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null;
        this.currentFilters = {
            category: 'all',
            verification: 'all'
        };
        this.init();
    }

    // ==================== INITIALIZATION ====================
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log("App setup started...");

        // 1. Initialize language
        try {
            const lang = getLanguage();
            updatePageLanguage(lang);
        } catch (e) { console.error("Language init failed", e); }

        // 2. Initialize map
        try {
            this.initMap();
        } catch (e) {
            console.error("Map init failed", e);
            showNotification("Error cargando el mapa. Revise su conexión.", "error");
        }

        // 3. Load testimonies
        try {
            this.loadTestimonies();
        } catch (e) { console.error("Testimonies load failed", e); }

        // 4. Update statistics
        try {
            this.updateStatistics();
        } catch (e) { console.error("Stats update failed", e); }

        // 5. Setup event listeners
        try {
            this.setupEventListeners();
        } catch (e) { console.error("Event listeners failed", e); }

        // 6. Animate statistics on scroll
        try {
            this.setupScrollAnimations();
        } catch (e) { console.error("Animations failed", e); }

        console.log("App setup finished.");
    }

    // ==================== MAP INITIALIZATION ====================
    initMap() {
        if (!document.getElementById('map')) return; // Exit if no map container

        if (typeof L === 'undefined') {
            console.error("Leaflet (L) is not defined. Map cannot load.");
            alert("Error crítico: No se pudo cargar el motor de mapas. Verifique su conexión a internet.");
            return;
        }

        // Initialize Leaflet map with a wider view (Global/Europe focus initially, or world)
        // Set to world view: [20, 0], zoom 2
        this.map = L.map('map').setView([20, 0], 2);

        // Add OpenStreetMap tiles (Global coverage)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 2
        }).addTo(this.map);

        // Add "Conflict Zones" Quick Jump Control
        this.addZoneSelector();

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true
        });

        this.map.addLayer(this.markerClusterGroup);

        // Add testimonies to map
        this.addTestimoniesToMap();

        // Attempt to auto-locate user for better initial experience
        this.attemptAutoLocation();

        // Add manual location control
        this.addLocateControl();
    }

    addLocateControl() {
        const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'leaflet-control-locate', controlDiv);
        button.href = '#';
        button.title = 'Usar mi ubicación';
        button.innerHTML = '📍';
        button.style.fontSize = '18px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        button.style.cursor = 'pointer';
        button.style.textDecoration = 'none';

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.on(button, 'click', (e) => {
            L.DomEvent.stop(e);
            this.handleManualLocation();
        });

        const Control = L.Control.extend({
            onAdd: () => controlDiv,
            onRemove: () => { }
        });

        new Control({ position: 'topleft' }).addTo(this.map);
    }

    handleManualLocation() {
        if (!("geolocation" in navigator)) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        if (confirm("¿Quieres centrar el mapa en tu ubicación actual?")) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.map.flyTo([latitude, longitude], 12);

                    // Add a temporary marker for "You"
                    L.circleMarker([latitude, longitude], {
                        radius: 8,
                        fillColor: "#3388ff",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(this.map).bindPopup("Tu ubicación actual").openPopup();
                },
                (error) => {
                    console.error("Geo Error:", error);
                    let msg = "No pudimos obtener tu ubicación.";
                    if (error.code === 1) msg += " Permiso denegado. Revisa la configuración del navegador.";
                    else if (error.code === 2) msg += " Ubicación no disponible.";
                    else if (error.code === 3) msg += " Tiempo de espera agotado.";
                    alert(msg);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }

    attemptAutoLocation() {
        // Try to locate user, but don't force it (passive)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Only zoom in if we are still at default zoom
                    if (this.map.getZoom() === 2) {
                        this.map.flyTo([position.coords.latitude, position.coords.longitude], 5);
                    }
                },
                (err) => { console.log('Auto-location denied or failed', err); },
                { timeout: 10000 }
            );
        }
    }

    addZoneSelector() {
        const zones = {
            'world': { coords: [20, 0], zoom: 2, label: '🌍 Vista Global' },
            'ukraine': { coords: [48.3794, 31.1656], zoom: 6, label: '🇺🇦 Ucrania' },
            'gaza': { coords: [31.5, 34.4667], zoom: 11, label: '🇵🇸 Gaza / Israel' },
            'sudan': { coords: [12.8628, 30.2176], zoom: 6, label: '🇸🇩 Sudán' },
            'yemen': { coords: [15.5527, 48.5164], zoom: 6, label: '🇾🇪 Yemen' },
            'valencia': { coords: [39.4699, -0.3763], zoom: 10, label: '🇪🇸 Valencia (Demo)' }
        };

        const controlDiv = L.DomUtil.create('div', 'leaflet-bar leaflet-control zone-selector');
        controlDiv.style.backgroundColor = 'var(--color-bg-secondary)';
        controlDiv.style.padding = '5px';
        controlDiv.style.borderRadius = 'var(--radius-sm)';
        controlDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';

        const select = document.createElement('select');
        select.style.background = 'transparent';
        select.style.color = 'var(--color-text-primary)';
        select.style.border = 'none';
        select.style.fontSize = '12px';
        select.style.cursor = 'pointer';
        select.style.outline = 'none';

        Object.keys(zones).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.innerText = zones[key].label;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const zone = zones[e.target.value];
            if (zone) {
                this.map.setView(zone.coords, zone.zoom);
            }
        });

        controlDiv.appendChild(select);

        // Add to map top-right
        const Control = L.Control.extend({
            onAdd: () => controlDiv,
            onRemove: () => { }
        });

        new Control({ position: 'topright' }).addTo(this.map);
    }

    attemptAutoLocation() {
        // Try to locate user, but don't force it (passive)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Only zoom in if we are still at default zoom
                    if (this.map.getZoom() === 2) {
                        // Add a "You are here" marker or just view? Just view for now implies context
                        // Actually, let's just center closer but not super close
                        this.map.flyTo([position.coords.latitude, position.coords.longitude], 5);
                    }
                },
                () => { }, // Error/Deny - do nothing, stay global
                { timeout: 10000 }
            );
        }
    }

    addTestimoniesToMap() {
        // Clear existing markers
        this.markerClusterGroup.clearLayers();
        this.markers = [];

        // Get filtered testimonies
        const testimonies = dataStore.filterTestimonies(this.currentFilters);

        // Add markers for each testimony
        testimonies.forEach(testimony => {
            const icon = createMapMarker(testimony);
            const marker = L.marker(
                [testimony.coordinates.lat, testimony.coordinates.lng],
                { icon }
            );

            marker.bindPopup(createMapPopup(testimony));
            this.markerClusterGroup.addLayer(marker);
            this.markers.push(marker);
        });
    }

    // ==================== LOAD TESTIMONIES ====================
    loadTestimonies() {
        const testimonies = dataStore.filterTestimonies(this.currentFilters);

        // Render Grid
        const grid = document.getElementById('testimoniesGrid');
        if (grid) {
            grid.innerHTML = '';
            testimonies.slice(0, 9).forEach(testimony => {
                const card = createTestimonyCard(testimony);
                grid.appendChild(card);
            });
        }

        // Render Timeline
        const timeline = document.getElementById('testimoniesTimeline');
        if (timeline) {
            timeline.innerHTML = '';

            // Group by date
            const grouped = {};
            testimonies.forEach(t => {
                const date = new Date(t.timestamp).toLocaleDateString();
                if (!grouped[date]) grouped[date] = [];
                grouped[date].push(t);
            });

            Object.entries(grouped).forEach(([date, items]) => {
                const groupDiv = document.createElement('div');
                groupDiv.style.marginBottom = '2rem';
                groupDiv.innerHTML = `<h3 style="font-size: 1rem; opacity: 0.7; margin-bottom: 1rem; padding-left: 1rem; border-left: 2px solid var(--color-accent-primary);">${date}</h3>`;

                items.forEach(t => {
                    const item = document.createElement('div');
                    item.style.cssText = `
                        background: var(--color-bg-glass);
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border-radius: var(--radius-md);
                        border-left: 2px solid var(--color-bg-tertiary);
                        margin-left: 1rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    `;
                    item.innerHTML = `
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${t.title}</strong>
                            <span class="tag tag-${t.category}">${getCategoryLabel(t.category)}</span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 0.5rem;">${t.location} • ${formatDateTime(t.timestamp)}</div>
                    `;
                    item.onclick = () => showTestimonyDetails(t.id);
                    item.onmouseenter = () => { item.style.background = 'var(--color-bg-tertiary)'; item.style.paddingLeft = '1.5rem'; };
                    item.onmouseleave = () => { item.style.background = 'var(--color-bg-glass)'; item.style.paddingLeft = '1rem'; };

                    groupDiv.appendChild(item);
                });

                timeline.appendChild(groupDiv);
            });
        }

        if (testimonies.length === 0 && grid) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-text-tertiary);">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor" style="opacity: 0.3; margin-bottom: 1rem;">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" fill="none" stroke-width="2"/>
                        <path d="M32 20v16M32 44v4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                    <p style="font-size: 1.125rem;">No se encontraron testimonios con los filtros seleccionados</p>
                </div>
            `;
        }
    }

    // ==================== UPDATE STATISTICS ====================
    updateStatistics() {
        const stats = dataStore.getStatistics();

        // Animate counters
        animateValue(document.getElementById('totalTestimonies'), 0, stats.total, 1000);
        animateValue(document.getElementById('verifiedTestimonies'), 0, stats.verified, 1000);
        animateValue(document.getElementById('activeWitnesses'), 0, stats.witnesses, 1000);
        animateValue(document.getElementById('countriesCovered'), 0, stats.countries, 1000);
    }

    // ==================== EVENT LISTENERS ====================
    setupEventListeners() {
        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                setLanguage(lang);

                // Update active state
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Submit testimony buttons
        const submitBtns = [
            document.getElementById('submitTestimonyBtn'),
            document.getElementById('heroSubmitBtn')
        ];

        submitBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.openSubmitModal());
            }
        });

        // View map button
        const viewMapBtn = document.getElementById('viewMapBtn');
        if (viewMapBtn) {
            viewMapBtn.addEventListener('click', () => {
                document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Profile button
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                window.location.href = 'profile.html';
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authService.logout();
            });
        }

        // Listen for DataStore events (from Cloud Sync)
        window.addEventListener('data-updated', () => {
            this.loadTestimonies();
            this.addTestimoniesToMap();
            showNotification('🔄 Datos actualizados de la nube', 'info');
        });

        // Verification nav link
        const navVerification = document.getElementById('navVerification');
        if (navVerification) {
            navVerification.addEventListener('click', (e) => {
                e.preventDefault();
                showVerificationCenter();
            });

            // Show verification link if user has reputation > 50 (simulated check)
            // In real app this would be based on actual user data
            const witnessId = localStorage.getItem('currentWitnessId');
            if (witnessId) {
                const witness = dataStore.getWitness(witnessId);
                // For demo purposes, we show it if they have joined or just for anyone to try
                navVerification.style.display = 'block';
            } else {
                // Auto-create identity for demo if none exists so they can see features
                navVerification.style.display = 'block';
            }
        }

        // Modal controls
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeSubmitModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeSubmitModal());

        // Submit form
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTestimony());
        }

        // Use current location button
        const useLocationBtn = document.getElementById('useCurrentLocation');
        if (useLocationBtn) {
            useLocationBtn.addEventListener('click', () => this.useCurrentLocation());
        }

        // Category filters
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter
                this.currentFilters.category = btn.dataset.filter;
                this.applyFilters();
            });
        });

        // Verification filters
        document.querySelectorAll('[data-filter-verification]').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('[data-filter-verification]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter
                this.currentFilters.verification = btn.dataset.filterVerification;
                this.applyFilters();
            });
        });

        // View Toggle
        const viewGridBtn = document.getElementById('viewGridBtn');
        const viewTimelineBtn = document.getElementById('viewTimelineBtn');
        const gridView = document.getElementById('testimoniesGrid');
        const timelineView = document.getElementById('testimoniesTimeline');

        if (viewGridBtn && viewTimelineBtn) {
            viewGridBtn.addEventListener('click', () => {
                viewGridBtn.classList.add('active');
                viewGridBtn.style.color = 'var(--color-accent-primary)';
                viewTimelineBtn.classList.remove('active');
                viewTimelineBtn.style.color = 'var(--color-text-secondary)';

                gridView.classList.remove('hidden');
                gridView.style.display = 'grid';
                timelineView.classList.add('hidden');
                timelineView.style.display = 'none';
            });

            viewTimelineBtn.addEventListener('click', () => {
                viewTimelineBtn.classList.add('active');
                viewTimelineBtn.style.color = 'var(--color-accent-primary)';
                viewGridBtn.classList.remove('active');
                viewGridBtn.style.color = 'var(--color-text-secondary)';

                timelineView.classList.remove('hidden');
                timelineView.style.display = 'block';
                gridView.classList.add('hidden');
                gridView.style.display = 'none';
            });

            // Set initial state style
            viewGridBtn.style.color = 'var(--color-accent-primary)';
        }

        // Start Real-time simulation
        this.startRealTimeSimulation();
    }

    // ==================== FILTERS ====================
    applyFilters() {
        this.loadTestimonies();
        this.addTestimoniesToMap();
    }

    // ==================== MODAL CONTROLS ====================
    openSubmitModal() {
        const modal = document.getElementById('submitModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeSubmitModal() {
        const modal = document.getElementById('submitModal');
        if (modal) {
            modal.classList.remove('active');
            this.resetForm();
        }
    }

    resetForm() {
        const form = document.getElementById('testimonyForm');
        if (form) form.reset();
    }

    // ==================== SUBMIT TESTIMONY ====================
    async submitTestimony() {
        const form = document.getElementById('testimonyForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        try {
            // Get form data
            const category = document.getElementById('category').value;
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const location = document.getElementById('location').value;
            const witnessName = document.getElementById('witnessName').value || 'Anónimo';
            const mediaFiles = document.getElementById('media').files;

            // Get or create witness ID
            let witnessId = localStorage.getItem('currentWitnessId');
            if (!witnessId) {
                witnessId = generateWitnessId();
                localStorage.setItem('currentWitnessId', witnessId);
            }

            // Get coordinates (use stored or default)
            let coordinates = JSON.parse(localStorage.getItem('currentCoordinates') || 'null');
            if (!coordinates) {
                // Default to Valencia if no coordinates
                coordinates = { lat: 39.4699, lng: -0.3763 };
            }

            // Create testimony
            const testimony = await testimonyManager.createTestimony({
                category,
                title,
                description,
                location,
                witnessName,
                witnessId,
                coordinates,
                mediaFiles: Array.from(mediaFiles),
                country: 'España'
            });

            // Show success message
            showNotification('¡Testimonio enviado exitosamente!', 'success');

            // Close modal
            this.closeSubmitModal();

            // Refresh displays
            this.loadTestimonies();
            this.addTestimoniesToMap();
            this.updateStatistics();

            // Clear stored coordinates
            localStorage.removeItem('currentCoordinates');

        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    }

    // ==================== GEOLOCATION ====================
    async useCurrentLocation() {
        const btn = document.getElementById('useCurrentLocation');
        const locationInput = document.getElementById('location');

        try {
            btn.disabled = true;
            btn.textContent = 'Obteniendo ubicación...';

            const position = await getCurrentPosition();

            // Store coordinates
            localStorage.setItem('currentCoordinates', JSON.stringify({
                lat: position.lat,
                lng: position.lng
            }));

            // Reverse geocode to get location name (simplified)
            locationInput.value = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;

            showNotification('Ubicación obtenida exitosamente', 'success');

        } catch (error) {
            showNotification('No se pudo obtener la ubicación. Por favor, ingrésala manualmente.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="8" r="2" fill="currentColor"/>
                    <path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span data-i18n="btn-use-location">Usar mi ubicación actual</span>
            `;
        }
    }

    // ==================== SCROLL ANIMATIONS ====================
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.card, .testimony-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ==================== REFRESH ====================
    refresh() {
        this.loadTestimonies();
        this.addTestimoniesToMap();
        this.updateStatistics();
    }
}

// Initialize app when DOM is ready
const app = new App();

// Make refresh function globally available
window.refreshTestimonies = () => app.refresh();

// Add some custom CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .custom-marker {
        background: transparent !important;
        border: none !important;
    }
    
    .leaflet-popup-content-wrapper {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
    }
    
    .leaflet-popup-tip {
        background: var(--color-bg-secondary);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
        background: rgba(0, 212, 255, 0.2) !important;
        border: 2px solid var(--color-accent-primary) !important;
    }
    
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
        background: var(--color-accent-primary) !important;
        color: white !important;
        font-weight: 700 !important;
    }
`;
document.head.appendChild(style);

console.log('🌍 Red de Testigos Confiables initialized successfully!');
console.log('📊 Statistics:', dataStore.getStatistics());
