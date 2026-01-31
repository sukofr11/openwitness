// utils.js - Helper Functions for Red de Testigos Confiables

// ==================== TRANSLATIONS ====================
const translations = {
    es: {
        'app-name': 'Red de Testigos',
        'nav-map': 'Mapa',
        'nav-testimonies': 'Testimonios',
        'nav-about': 'Acerca de',
        'btn-submit': 'Enviar Testimonio',
        'hero-title': 'Red de Testigos Confiables',
        'hero-subtitle': 'Una plataforma descentralizada para validar y compartir testimonios geolocalizados durante crisis humanitarias. Como Waze, pero para la verdad en el terreno.',
        'btn-submit-testimony': 'Enviar Testimonio',
        'btn-view-map': 'Ver Mapa en Vivo',
        'stat-testimonies': 'Testimonios',
        'stat-verified': 'Verificados',
        'stat-witnesses': 'Testigos Activos',
        'stat-countries': 'Países',
        'map-title': 'Mapa de Testimonios en Tiempo Real',
        'filter-category': 'Categoría:',
        'filter-all': 'Todos',
        'filter-medical': 'Médico',
        'filter-security': 'Seguridad',
        'filter-infrastructure': 'Infraestructura',
        'filter-humanitarian': 'Humanitario',
        'filter-displacement': 'Desplazamiento',
        'filter-general': 'General',
        'filter-verification': 'Verificación:',
        'filter-verified-only': 'Verificados',
        'filter-trusted': 'Confiables',
        'testimonies-title': 'Testimonios Recientes',
        'about-title': '¿Cómo Funciona?',
        'about-step1-title': '1. Envía tu Testimonio',
        'about-step1-desc': 'Comparte lo que estás viendo en el terreno con ubicación, fotos y detalles. Tu identidad puede permanecer anónima.',
        'about-step2-title': '2. Verificación Comunitaria',
        'about-step2-desc': 'Otros testigos en la misma área pueden corroborar tu testimonio, aumentando su credibilidad.',
        'about-step3-title': '3. Difusión Global',
        'about-step3-desc': 'Los testimonios verificados se publican en el mapa para que el mundo conozca la verdad.',
        'modal-title': 'Enviar Testimonio',
        'form-category': 'Categoría *',
        'form-select-category': 'Selecciona una categoría',
        'form-title': 'Título *',
        'form-description': 'Descripción Detallada *',
        'form-location': 'Ubicación *',
        'btn-use-location': 'Usar mi ubicación actual',
        'form-witness-name': 'Nombre del Testigo (Opcional)',
        'form-anonymous-note': 'Puedes permanecer anónimo. Tu identidad estará protegida.',
        'form-media': 'Fotos/Videos (Opcional)',
        'form-media-note': 'Los datos EXIF serán eliminados automáticamente para proteger tu privacidad.',
        'btn-cancel': 'Cancelar',
        'btn-submit-final': 'Enviar Testimonio'
    },
    en: {
        'app-name': 'Trusted Witnesses Network',
        'nav-map': 'Map',
        'nav-testimonies': 'Testimonies',
        'nav-about': 'About',
        'btn-submit': 'Submit Testimony',
        'hero-title': 'Trusted Witnesses Network',
        'hero-subtitle': 'A decentralized platform to validate and share geolocated testimonies during humanitarian crises. Like Waze, but for truth on the ground.',
        'btn-submit-testimony': 'Submit Testimony',
        'btn-view-map': 'View Live Map',
        'stat-testimonies': 'Testimonies',
        'stat-verified': 'Verified',
        'stat-witnesses': 'Active Witnesses',
        'stat-countries': 'Countries',
        'map-title': 'Real-Time Testimony Map',
        'filter-category': 'Category:',
        'filter-all': 'All',
        'filter-medical': 'Medical',
        'filter-security': 'Security',
        'filter-infrastructure': 'Infrastructure',
        'filter-humanitarian': 'Humanitarian',
        'filter-displacement': 'Displacement',
        'filter-general': 'General',
        'filter-verification': 'Verification:',
        'filter-verified-only': 'Verified',
        'filter-trusted': 'Trusted',
        'testimonies-title': 'Recent Testimonies',
        'about-title': 'How It Works?',
        'about-step1-title': '1. Submit Your Testimony',
        'about-step1-desc': 'Share what you are seeing on the ground with location, photos and details. Your identity can remain anonymous.',
        'about-step2-title': '2. Community Verification',
        'about-step2-desc': 'Other witnesses in the same area can corroborate your testimony, increasing its credibility.',
        'about-step3-title': '3. Global Dissemination',
        'about-step3-desc': 'Verified testimonies are published on the map so the world knows the truth.',
        'modal-title': 'Submit Testimony',
        'form-category': 'Category *',
        'form-select-category': 'Select a category',
        'form-title': 'Title *',
        'form-description': 'Detailed Description *',
        'form-location': 'Location *',
        'btn-use-location': 'Use my current location',
        'form-witness-name': 'Witness Name (Optional)',
        'form-anonymous-note': 'You can remain anonymous. Your identity will be protected.',
        'form-media': 'Photos/Videos (Optional)',
        'form-media-note': 'EXIF data will be automatically removed to protect your privacy.',
        'btn-cancel': 'Cancel',
        'btn-submit-final': 'Submit Testimony'
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
