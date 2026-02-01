// utils.js - Helper Functions for Red de Testigos Confiables

// ==================== TRANSLATIONS ====================
const translations = {
    es: {
        'app-name': 'OpenWitness',
        'nav-map': 'Mapa',
        'nav-testimonies': 'Testimonios',
        'nav-about': 'Acerca de',
        'nav-profile': 'Mi Perfil',
        'btn-submit': 'Enviar Testimonio',
        'hero-title': 'OpenWitness Global',
        'hero-subtitle': 'Plataforma descentralizada para la validación de la verdad en zonas de conflicto. Vigilancia ciudadana 24/7.',
        'btn-submit-testimony': 'Reportar Incidente',
        'btn-view-map': 'Ver Mapa en Vivo',
        'stat-testimonies': 'Testimonios',
        'stat-verified': 'Verificados',
        'stat-witnesses': 'Testigos',
        'stat-countries': 'Zonas',
        'map-title': 'Monitoreo Global de Conflictos',
        'filter-category': 'Categoría:',
        'filter-all': 'Todas',
        'filter-medical': 'Emergencia Médica',
        'filter-security': 'Zona Crítica (Combate)',
        'filter-infrastructure': 'Daños Infraestructura',
        'filter-humanitarian': 'Ayuda Humanitaria',
        'filter-displacement': 'Desplazamiento',
        'filter-safezone': 'Zona Segura',
        'filter-logistics': 'Logística / Suministros',
        'filter-verification': 'Verificación:',
        'filter-verified-only': 'Solo Verificados',
        'filter-trusted': 'Fuentes Confiables',
        'testimonies-title': 'Últimos Reportes',
        'about-title': 'Protocolo de Verificación',
        'modal-title': 'Reportar Incidente Crítico',
        'form-category': 'Tipo de Alerta *',
        'form-select-category': 'Selecciona la naturaleza del incidente',
        'form-title': 'Título del Reporte *',
        'form-description': 'Detalles del Terreno *',
        'form-location': 'Ubicación Exacta *',
        'btn-use-location': 'Geolocalizarme',
        'form-witness-name': 'Identificador (Opcional)',
        'btn-cancel': 'Cancelar',
        'btn-submit-final': 'Enviar Alerta'
    },
    en: {
        'app-name': 'OpenWitness',
        'nav-map': 'Map',
        'nav-testimonies': 'Testimonies',
        'nav-about': 'About',
        'nav-profile': 'Profile',
        'btn-submit': 'Submit Testimony',
        'hero-title': 'OpenWitness Global',
        'hero-subtitle': 'Decentralized platform for truth validation in conflict zones. 24/7 citizen surveillance.',
        'btn-submit-testimony': 'Report Incident',
        'btn-view-map': 'View Live Map',
        'stat-testimonies': 'Testimonies',
        'stat-verified': 'Verified',
        'stat-witnesses': 'Witnesses',
        'stat-countries': 'Zones',
        'map-title': 'Global Conflict Monitoring',
        'filter-category': 'Category:',
        'filter-all': 'All',
        'filter-medical': 'Medical Emergency',
        'filter-security': 'Critical Zone (Combat)',
        'filter-infrastructure': 'Infra Damage',
        'filter-humanitarian': 'Humanitarian Aid',
        'filter-displacement': 'Displacement',
        'filter-safezone': 'Safe Zone',
        'filter-logistics': 'Logistics / Supplies',
        'filter-verification': 'Verification:',
        'filter-verified-only': 'Verified Only',
        'filter-trusted': 'Trusted Sources',
        'testimonies-title': 'Latest Reports',
        'about-title': 'Verification Protocol',
        'modal-title': 'Report Critical Incident',
        'form-category': 'Alert Type *',
        'form-select-category': 'Select incident nature',
        'form-title': 'Report Title *',
        'form-description': 'Field Details *',
        'form-location': 'Exact Location *',
        'btn-use-location': 'Geolocate Me',
        'form-witness-name': 'Identifier (Optional)',
        'btn-cancel': 'Cancel',
        'btn-submit-final': 'Submit Alert'
    },
    fr: {
        'app-name': 'OpenWitness',
        'nav-map': 'Carte',
        'nav-testimonies': 'Témoignages',
        'nav-about': 'À propos',
        'nav-profile': 'Profil',
        'btn-submit': 'Soumettre',
        'hero-title': 'OpenWitness Global',
        'hero-subtitle': 'Plateforme décentralisée pour la validation de la vérité en zone de conflit.',
        'btn-submit-testimony': 'Signaler un incident',
        'btn-view-map': 'Voir la carte',
        'stat-testimonies': 'Témoignages',
        'stat-verified': 'Vérifiés',
        'stat-witnesses': 'Témoins',
        'stat-countries': 'Zones',
        'map-title': 'Suivi Mondial des Conflits',
        'filter-category': 'Catégorie:',
        'filter-all': 'Tout',
        'filter-medical': 'Urgence Médicale',
        'filter-security': 'Zone Critique (Combat)',
        'filter-infrastructure': 'Dégâts Infrastr.',
        'filter-humanitarian': 'Aide Humanitaire',
        'filter-displacement': 'Déplacement',
        'filter-safezone': 'Zone Sécurisée',
        'filter-logistics': 'Logistique / Approvisionnement',
        'filter-verification': 'Vérification:',
        'filter-verified-only': 'Uniquement Vérifiés',
        'filter-trusted': 'Sources Fiables',
        'testimonies-title': 'Derniers Rapports',
        'about-title': 'Protocole de Vérification',
        'modal-title': 'Signaler un Incident Critique',
        'btn-cancel': 'Annuler',
        'btn-submit-final': 'Envoyer l\'alerte'
    },
    de: {
        'app-name': 'OpenWitness',
        'nav-map': 'Karte',
        'nav-testimonies': 'Berichte',
        'nav-about': 'Über uns',
        'nav-profile': 'Profil',
        'btn-submit': 'Einreichen',
        'hero-title': 'OpenWitness Global',
        'hero-subtitle': 'Dezentrale Plattform zur Wahrheitsvalidierung in Konfliktgebieten.',
        'btn-submit-testimony': 'Vorfall melden',
        'btn-view-map': 'Karte anzeigen',
        'stat-testimonies': 'Berichte',
        'stat-verified': 'Verifiziert',
        'stat-witnesses': 'Zeugen',
        'stat-countries': 'Zonen',
        'map-title': 'Globale Konfliktüberwachung',
        'filter-category': 'Kategorie:',
        'filter-all': 'Alle',
        'filter-medical': 'Medizinischer Notfall',
        'filter-security': 'Kritische Zone (Kampf)',
        'filter-infrastructure': 'Infrastrukturschäden',
        'filter-humanitarian': 'Humanitäre Hilfe',
        'filter-displacement': 'Vertreibung',
        'filter-safezone': 'Sicherheitszone',
        'filter-logistics': 'Logistik / Vorräte',
        'filter-verification': 'Verifizierung:',
        'filter-verified-only': 'Nur Verifiziert',
        'filter-trusted': 'Vertrauenswürdige Quellen',
        'testimonies-title': 'Neueste Berichte',
        'about-title': 'Verifizierungsprotokoll',
        'modal-title': 'Kritischen Vorfall melden',
        'btn-cancel': 'Abbrechen',
        'btn-submit-final': 'Alarm senden'
    },
    it: {
        'app-name': 'OpenWitness',
        'nav-map': 'Mappa',
        'nav-testimonies': 'Testimonianze',
        'nav-about': 'Informazioni',
        'nav-profile': 'Profilo',
        'btn-submit': 'Invia',
        'hero-title': 'OpenWitness Global',
        'hero-subtitle': 'Piattaforma decentralizzata per la convalida della verità nelle zone di conflitto.',
        'btn-submit-testimony': 'Segnala Incidente',
        'btn-view-map': 'Vedi Mappa',
        'stat-testimonies': 'Testimonianze',
        'stat-verified': 'Verificati',
        'stat-witnesses': 'Testimoni',
        'stat-countries': 'Zone',
        'map-title': 'Monitoraggio Globale dei Conflitti',
        'filter-category': 'Categoria:',
        'filter-all': 'Tutto',
        'filter-medical': 'Emergenza Medica',
        'filter-security': 'Zona Critica (Combattimento)',
        'filter-infrastructure': 'Danni Infrastrutture',
        'filter-humanitarian': 'Aiuto Umanitario',
        'filter-displacement': 'Spostamento',
        'filter-safezone': 'Zona Sicura',
        'filter-logistics': 'Logistica / Rifornimenti',
        'filter-verification': 'Verifica:',
        'filter-verified-only': 'Solo Verificati',
        'filter-trusted': 'Fonti Attendibili',
        'testimonies-title': 'Ultimi Rapporti',
        'about-title': 'Protocollo di Verifica',
        'modal-title': 'Segnala Incidente Critico',
        'btn-cancel': 'Annulla',
        'btn-submit-final': 'Invia Allerta'
    }
};

// ==================== DATE/TIME UTILITIES ====================
function formatDate(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;

    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== GEOLOCATION UTILITIES ====================
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)}km`;
    return `${Math.round(km)}km`;
}

async function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            }),
            error => reject(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Adjust location precision for privacy
function adjustLocationPrecision(lat, lng, precision = 0.01) {
    return {
        lat: Math.round(lat / precision) * precision,
        lng: Math.round(lng / precision) * precision
    };
}

// ==================== VALIDATION UTILITIES ====================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function validateTestimony(testimony) {
    const errors = [];

    if (!testimony.title || testimony.title.trim().length < 5) {
        errors.push('El título debe tener al menos 5 caracteres');
    }

    if (!testimony.description || testimony.description.trim().length < 20) {
        errors.push('La descripción debe tener al menos 20 caracteres');
    }

    if (!testimony.category) {
        errors.push('Debes seleccionar una categoría');
    }

    if (!testimony.location || !testimony.coordinates) {
        errors.push('Debes proporcionar una ubicación');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// ==================== MEDIA UTILITIES ====================
async function stripEXIF(file) {
    // In a real implementation, this would use a library like exif-js
    // For now, we'll simulate the process
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Simulate EXIF stripping
            resolve({
                data: e.target.result,
                name: file.name,
                type: file.type,
                size: file.size
            });
        };
        reader.readAsDataURL(file);
    });
}

async function processMediaFiles(files) {
    const processed = [];

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            console.warn(`File ${file.name} exceeds 10MB limit`);
            continue;
        }

        const stripped = await stripEXIF(file);
        processed.push(stripped);
    }

    return processed;
}

// ==================== ID GENERATION ====================
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateWitnessId() {
    return `witness-${generateId()}`;
}

// ==================== LANGUAGE UTILITIES ====================
function setLanguage(lang) {
    localStorage.setItem('language', lang);
    updatePageLanguage(lang);
}

function getLanguage() {
    return localStorage.getItem('language') || 'es';
}

function updatePageLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });
}

// ==================== ANIMATION UTILITIES ====================
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';

    let opacity = 0;
    const increment = 16 / duration;

    const timer = setInterval(() => {
        opacity += increment;
        if (opacity >= 1) {
            opacity = 1;
            clearInterval(timer);
        }
        element.style.opacity = opacity;
    }, 16);
}

function fadeOut(element, duration = 300) {
    let opacity = 1;
    const increment = 16 / duration;

    const timer = setInterval(() => {
        opacity -= increment;
        if (opacity <= 0) {
            opacity = 0;
            element.style.display = 'none';
            clearInterval(timer);
        }
        element.style.opacity = opacity;
    }, 16);
}

// ==================== NOTIFICATION UTILITIES ====================
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: var(--color-bg-glass);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        color: var(--color-text-primary);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.borderColor = 'var(--color-success)';
    } else if (type === 'error') {
        notification.style.borderColor = 'var(--color-danger)';
    } else if (type === 'warning') {
        notification.style.borderColor = 'var(--color-warning)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ==================== LOCAL STORAGE UTILITIES ====================
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

// ==================== EXPORT UTILITIES ====================
function exportToJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

function exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}

// ==================== DEBOUNCE & THROTTLE ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
