// components.js - Reusable UI Components

// ==================== TESTIMONY CARD ====================
function createTestimonyCard(testimony) {
    const witness = dataStore.getWitness(testimony.witnessId);
    const trustScore = verificationSystem.calculateTrustScore(testimony);
    const badges = witness ? verificationSystem.getWitnessBadges(testimony.witnessId) : [];

    const card = document.createElement('div');
    card.className = 'testimony-card';
    card.dataset.testimonyId = testimony.id;

    // Get category color
    const categoryColors = {
        medical: 'var(--color-medical)',
        security: 'var(--color-security)',
        infrastructure: 'var(--color-infrastructure)',
        humanitarian: 'var(--color-humanitarian)',
        displacement: 'var(--color-displacement)',
        general: 'var(--color-general)'
    };

    const categoryColor = categoryColors[testimony.category] || 'var(--color-general)';

    card.innerHTML = `
        <div class="testimony-header">
            <div class="testimony-avatar" style="background: ${categoryColor};">
                ${testimony.witnessName.charAt(0).toUpperCase()}
            </div>
            <div class="testimony-meta">
                <div class="testimony-author">
                    ${testimony.witnessName}
                    ${badges.map(b => `<span class="badge badge-${b.type}">${b.icon} ${b.label}</span>`).join('')}
                </div>
                <div class="testimony-date">${formatDate(testimony.timestamp)}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">Confianza</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: ${trustScore >= 70 ? 'var(--color-success)' : trustScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'};">
                    ${trustScore}%
                </div>
            </div>
        </div>
        
        <div class="testimony-body">
            <h3 style="margin-bottom: 0.5rem; color: var(--color-text-primary);">${testimony.title}</h3>
            <p class="testimony-content">${testimony.description}</p>
            
            <div class="testimony-location">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0C5.2 0 3 2.2 3 5c0 3.5 5 11 5 11s5-7.5 5-11c0-2.8-2.2-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
                ${testimony.location}
            </div>
            
            <div class="testimony-tags">
                <span class="tag tag-${testimony.category}">${getCategoryLabel(testimony.category)}</span>
                ${testimony.corroborations && testimony.corroborations.length > 0 ?
            `<span class="tag" style="background: rgba(16, 185, 129, 0.2); color: var(--color-success);">
                        ${testimony.corroborations.length} corroboraciones
                    </span>` : ''}
                ${testimony.views ? `<span class="tag">${testimony.views} vistas</span>` : ''}
            </div>
        </div>
    `;

    // Add click event to view details
    card.addEventListener('click', () => {
        showTestimonyDetails(testimony.id);
    });

    return card;
}

// ==================== MAP MARKER ====================
function createMapMarker(testimony) {
    const categoryIcons = {
        medical: '🏥',
        security: '⚠️',
        infrastructure: '🏗️',
        humanitarian: '❤️',
        displacement: '👥',
        general: '📍'
    };

    const categoryColors = {
        medical: '#ef4444',
        security: '#f59e0b',
        infrastructure: '#fb923c',
        humanitarian: '#3b82f6',
        displacement: '#8b5cf6',
        general: '#10b981'
    };

    const icon = categoryIcons[testimony.category] || '📍';
    const color = categoryColors[testimony.category] || '#10b981';

    const markerHtml = `
        <div style="
            background: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
            <span style="transform: rotate(45deg); font-size: 20px;">${icon}</span>
        </div>
    `;

    const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });

    return customIcon;
}

// ==================== MAP POPUP ====================
function createMapPopup(testimony) {
    const trustScore = verificationSystem.calculateTrustScore(testimony);

    return `
        <div style="min-width: 250px;">
            <h4 style="margin: 0 0 0.5rem 0; color: var(--color-text-primary);">${testimony.title}</h4>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: var(--color-text-secondary);">
                ${testimony.description.substring(0, 100)}${testimony.description.length > 100 ? '...' : ''}
            </p>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <span class="tag tag-${testimony.category}">${getCategoryLabel(testimony.category)}</span>
                <span class="badge badge-${testimony.verificationStatus}">${getVerificationLabel(testimony.verificationStatus)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span style="font-size: 0.75rem; color: var(--color-text-tertiary);">${formatDate(testimony.timestamp)}</span>
                <span style="font-weight: 700; color: ${trustScore >= 70 ? 'var(--color-success)' : 'var(--color-warning)'};">
                    ${trustScore}% confianza
                </span>
            </div>
            <button onclick="showTestimonyDetails('${testimony.id}')" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; font-size: 0.875rem;">
                Ver Detalles
            </button>
        </div>
    `;
}

// ==================== TESTIMONY DETAILS MODAL ====================
function showTestimonyDetails(testimonyId) {
    const testimony = testimonyManager.viewTestimony(testimonyId);
    if (!testimony) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3 class="modal-title">${testimony.title}</h3>
                <button class="btn btn-icon btn-secondary" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <div class="testimony-avatar" style="width: 64px; height: 64px; font-size: 2rem;">
                        ${testimony.witnessName.charAt(0).toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 1.125rem; margin-bottom: 0.25rem;">
                            ${testimony.witnessName}
                        </div>
                        <div style="color: var(--color-text-tertiary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                            ${formatDateTime(testimony.timestamp)}
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${testimony.witness ? verificationSystem.getWitnessBadges(testimony.witnessId)
            .map(b => `<span class="badge badge-${b.type}">${b.icon} ${b.label}</span>`).join('') : ''}
                        </div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--color-bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-size: 2rem; font-weight: 700; color: ${testimony.trustScore >= 70 ? 'var(--color-success)' : 'var(--color-warning)'};">
                            ${testimony.trustScore}%
                        </div>
                        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">Confianza</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="tag tag-${testimony.category}">${getCategoryLabel(testimony.category)}</span>
                        <span class="badge badge-${testimony.verificationStatus}">${getVerificationLabel(testimony.verificationStatus)}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Descripción</h4>
                    <p style="line-height: 1.6;">${testimony.description}</p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Ubicación</h4>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary);">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C5.2 0 3 2.2 3 5c0 3.5 5 11 5 11s5-7.5 5-11c0-2.8-2.2-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                        </svg>
                        ${testimony.location}
                    </div>
                </div>
                
                ${testimony.corroborations && testimony.corroborations.length > 0 ? `
                    <div style="margin-bottom: 1rem;">
                        <h4 style="margin-bottom: 0.5rem;">Corroboraciones (${testimony.corroborations.length})</h4>
                        <div style="background: var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-md);">
                            <p style="color: var(--color-text-secondary); margin: 0;">
                                Este testimonio ha sido corroborado por ${testimony.corroborations.length} 
                                testigo${testimony.corroborations.length > 1 ? 's' : ''} en la misma área.
                            </p>
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 0.5rem; color: var(--color-text-tertiary); font-size: 0.875rem;">
                    <span>${testimony.views || 0} vistas</span>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button class="btn btn-primary" onclick="corroborateTestimonyAction('${testimony.id}')">
                    ✓ Corroborar Testimonio
                </button>
            </div>
        </div>
                <button class="btn btn-secondary" style="background: var(--color-danger); color: white;" onclick="showReportModal('${testimony.id}')">
                    🚩 Reportar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ==================== PROFILE MODAL ====================
function showUserProfile() {
    const witnessId = localStorage.getItem('currentWitnessId');
    if (!witnessId) {
        showNotification('Aún no tienes un perfil. Envía un testimonio para crear uno.', 'info');
        return;
    }

    const witness = dataStore.getWitness(witnessId);
    if (!witness) {
        showNotification('Perfil no encontrado.', 'error');
        return;
    }

    const badges = verificationSystem.getWitnessBadges(witnessId);
    const myTestimonies = dataStore.getTestimonies().filter(t => t.witnessId === witnessId);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">Mi Perfil de Testigo</h3>
                <button class="btn btn-icon btn-secondary" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="profile-header" style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: var(--gradient-primary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-weight: bold;">
                        ${witnessId.substr(-1).toUpperCase()}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--color-text-tertiary);">ID: ${witnessId}</div>
                    <div style="margin-top: 0.5rem; display: flex; justify-content: center; gap: 0.5rem;">
                        ${badges.map(b => `<span class="badge badge-${b.type}">${b.icon} ${b.label}</span>`).join('')}
                    </div>
                </div>
                
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-accent-primary);">${witness.reputation}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">Reputación</div>
                    </div>
                    <div style="background: var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-success);">${witness.verifiedTestimonies}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">Verificados</div>
                    </div>
                    <div style="background: var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-text-primary);">${witness.testimoniesSubmitted}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">Enviados</div>
                    </div>
                </div>
                
                <h4 style="margin-bottom: 1rem;">Mis Testimonios Recientes</h4>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${myTestimonies.length > 0 ? myTestimonies.slice(0, 5).map(t => `
                        <div style="padding: 1rem; background: var(--color-bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 500;">${t.title}</div>
                                <div style="font-size: 0.75rem; color: var(--color-text-tertiary);">${formatDate(t.timestamp)}</div>
                            </div>
                            <span class="badge badge-${t.verificationStatus}">${getVerificationLabel(t.verificationStatus)}</span>
                        </div>
                    `).join('') : '<p style="color: var(--color-text-tertiary); text-align: center;">No has enviado testimonios aún.</p>'}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==================== VERIFICATION CENTER MODAL ====================
function showVerificationCenter() {
    // Get unverified testimonies sorted by date
    const pendingTestimonies = dataStore.getTestimonies()
        .filter(t => t.verificationStatus !== 'verified')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; height: 80vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <div>
                    <h3 class="modal-title">Centro de Verificación</h3>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--color-text-secondary);">
                        Ayuda a validar testimonios para mantener la red confiable.
                    </p>
                </div>
                <button class="btn btn-icon btn-secondary" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 0;">
                <div style="display: grid; grid-template-columns: 300px 1fr; height: 100%;">
                    <!-- List -->
                    <div style="border-right: 1px solid rgba(255,255,255,0.1); overflow-y: auto; padding: 1rem;">
                        ${pendingTestimonies.map(t => `
                            <div class="verification-item" onclick="loadVerificationDetail('${t.id}', this)" style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;">
                                <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${t.title}</div>
                                <div style="display: flex; gap: 0.5rem; font-size: 0.75rem;">
                                    <span class="tag tag-${t.category}">${getCategoryLabel(t.category)}</span>
                                    <span style="color: var(--color-text-tertiary);">${formatDate(t.timestamp)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Detail View -->
                    <div id="verificationDetail" style="padding: 2rem; overflow-y: auto; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--color-text-tertiary);">
                        <div>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <p>Selecciona un testimonio para verificar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add styles for active item
    const style = document.createElement('style');
    style.textContent = `
        .verification-item:hover { background: rgba(255,255,255,0.05); }
        .verification-item.active { background: rgba(0, 212, 255, 0.1); border-left: 3px solid var(--color-accent-primary); }
    `;
    modal.appendChild(style);
}

// Load detail for verification center
window.loadVerificationDetail = function (id, element) {
    // Update active state
    document.querySelectorAll('.verification-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const testimony = dataStore.getTestimony(id);
    const detailContainer = document.getElementById('verificationDetail');

    if (!testimony) return;

    detailContainer.style.display = 'block';
    detailContainer.style.textAlign = 'left';
    detailContainer.style.color = 'var(--color-text-primary)';

    detailContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <span class="tag tag-${testimony.category}" style="margin-bottom: 0.5rem; display: inline-block;">${getCategoryLabel(testimony.category)}</span>
            <h2 style="margin-bottom: 0.5rem;">${testimony.title}</h2>
            <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: var(--color-text-secondary);">
                <span>📍 ${testimony.location}</span>
                <span>📅 ${formatDateTime(testimony.timestamp)}</span>
                <span>👤 ${testimony.witnessName}</span>
            </div>
        </div>
        
        <div style="background: var(--color-bg-tertiary); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
            <p style="line-height: 1.6; white-space: pre-wrap;">${testimony.description}</p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="corroborateTestimonyAction('${testimony.id}')" style="flex: 1;">
                ✅ Corroborar (Es Verdad)
            </button>
            <button class="btn btn-secondary" onclick="showReportModal('${testimony.id}')" style="flex: 1; border-color: var(--color-danger); color: var(--color-danger);">
                🚩 Reportar (Es Falso/Inapropiado)
            </button>
        </div>
    `;
}

// ==================== REPORT MODAL ====================
function showReportModal(testimonyId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3 class="modal-title">Reportar Testimonio</h3>
                <button class="btn btn-icon btn-secondary" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">¿Por qué quieres reportar este testimonio?</p>
                <div class="form-group">
                    <select id="reportReason" class="form-select">
                        <option value="spam">Es spam o publicidad</option>
                        <option value="fake">Es información falsa</option>
                        <option value="inappropriate">Contenido inapropiado / ofensivo</option>
                        <option value="wrong_location">Ubicación incorrecta</option>
                        <option value="outdated">Información desactualizada</option>
                    </select>
                </div>
                <div class="form-group">
                    <textarea id="reportDetails" class="form-textarea" placeholder="Detalles adicionales (opcional)" style="min-height: 80px;"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                <button class="btn btn-primary" style="background: var(--color-danger);" onclick="submitReport('${testimonyId}')">Enviar Reporte</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function submitReport(testimonyId) {
    const reason = document.getElementById('reportReason').value;
    const details = document.getElementById('reportDetails').value;
    const reporterId = localStorage.getItem('currentWitnessId') || 'anonymous';

    testimonyManager.flagTestimony(testimonyId, `${reason}: ${details}`, reporterId);

    showNotification('Reporte enviado. Gracias por ayudar a mantener la comunidad segura.', 'success');
    document.querySelectorAll('.modal').forEach(m => m.remove());
}

// ==================== HELPER FUNCTIONS ====================
function getCategoryLabel(category) {
    const labels = {
        medical: 'Médico',
        security: 'Seguridad',
        infrastructure: 'Infraestructura',
        humanitarian: 'Humanitario',
        displacement: 'Desplazamiento',
        general: 'General'
    };
    return labels[category] || category;
}

function getVerificationLabel(status) {
    const labels = {
        verified: '✓ Verificado',
        trusted: '★ Confiable',
        new: '◆ Nuevo'
    };
    return labels[status] || status;
}

// ==================== ACTIONS ====================
function corroborateTestimonyAction(testimonyId) {
    try {
        const witnessId = localStorage.getItem('currentWitnessId') || generateWitnessId();
        localStorage.setItem('currentWitnessId', witnessId);

        testimonyManager.corroborateTestimony(testimonyId, witnessId);
        showNotification('¡Gracias por corroborar este testimonio!', 'success');

        // Close modal and refresh
        document.querySelectorAll('.modal').forEach(m => m.remove());
        if (window.refreshTestimonies) window.refreshTestimonies();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}
