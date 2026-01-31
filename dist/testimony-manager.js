// testimony-manager.js - Testimony Lifecycle Management

class TestimonyManager {
    constructor() {
        this.currentTestimony = null;
    }

    // ==================== CREATE TESTIMONY ====================
    async createTestimony(formData) {
        // Validate testimony data
        const validation = validateTestimony(formData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Process media files if any
        let processedMedia = [];
        if (formData.mediaFiles && formData.mediaFiles.length > 0) {
            processedMedia = await processMediaFiles(formData.mediaFiles);
        }

        // Create witness if new
        const witnessId = formData.witnessId || generateWitnessId();

        // Adjust location precision for privacy
        const adjustedCoords = adjustLocationPrecision(
            formData.coordinates.lat,
            formData.coordinates.lng,
            0.01 // ~1km precision
        );

        // Create testimony object
        const testimony = {
            title: sanitizeInput(formData.title),
            description: sanitizeInput(formData.description),
            category: formData.category,
            location: sanitizeInput(formData.location),
            coordinates: adjustedCoords,
            country: formData.country || 'Unknown',
            witnessName: formData.witnessName ? sanitizeInput(formData.witnessName) : 'Anónimo',
            witnessId,
            media: processedMedia
        };

        // Save testimony
        const savedTestimony = dataStore.saveTestimony(testimony);

        // Update witness reputation
        verificationSystem.updateWitnessReputation(witnessId);

        // Validate cross-references
        setTimeout(() => {
            verificationSystem.validateCrossReferences(savedTestimony.id);
        }, 1000);

        return savedTestimony;
    }

    // ==================== UPDATE TESTIMONY ====================
    updateTestimony(id, updates) {
        const testimony = dataStore.getTestimony(id);
        if (!testimony) {
            throw new Error('Testimony not found');
        }

        // Sanitize updates
        if (updates.title) updates.title = sanitizeInput(updates.title);
        if (updates.description) updates.description = sanitizeInput(updates.description);
        if (updates.location) updates.location = sanitizeInput(updates.location);

        return dataStore.updateTestimony(id, updates);
    }

    // ==================== DELETE TESTIMONY ====================
    deleteTestimony(id) {
        dataStore.deleteTestimony(id);
    }

    // ==================== VIEW TESTIMONY ====================
    viewTestimony(id) {
        const testimony = dataStore.getTestimony(id);
        if (!testimony) return null;

        // Increment view count
        testimony.views = (testimony.views || 0) + 1;
        dataStore.updateTestimony(id, { views: testimony.views });

        // Get witness info
        const witness = dataStore.getWitness(testimony.witnessId);

        // Get corroborations
        const corroborations = verificationSystem.findCorroborations(testimony);

        // Calculate trust score
        const trustScore = verificationSystem.calculateTrustScore(testimony);

        return {
            ...testimony,
            witness,
            corroborations,
            trustScore
        };
    }

    // ==================== CORROBORATE TESTIMONY ====================
    corroborateTestimony(testimonyId, witnessId) {
        const testimony = dataStore.getTestimony(testimonyId);
        if (!testimony) {
            throw new Error('Testimony not found');
        }

        // Check if witness already corroborated
        if (testimony.corroborations && testimony.corroborations.includes(witnessId)) {
            throw new Error('You have already corroborated this testimony');
        }

        // Add corroboration
        const corroborations = testimony.corroborations || [];
        corroborations.push(witnessId);

        dataStore.updateTestimony(testimonyId, { corroborations });

        // Re-validate cross-references
        verificationSystem.validateCrossReferences(testimonyId);

        return dataStore.getTestimony(testimonyId);
    }

    // ==================== FLAG TESTIMONY ====================
    flagTestimony(testimonyId, reason, reporterId) {
        return verificationSystem.flagTestimony(testimonyId, reason, reporterId);
    }

    // ==================== SEARCH TESTIMONIES ====================
    searchTestimonies(query, filters = {}) {
        let testimonies = dataStore.filterTestimonies(filters);

        if (query && query.trim()) {
            const lowerQuery = query.toLowerCase();
            testimonies = testimonies.filter(t =>
                t.title.toLowerCase().includes(lowerQuery) ||
                t.description.toLowerCase().includes(lowerQuery) ||
                t.location.toLowerCase().includes(lowerQuery)
            );
        }

        return testimonies;
    }

    // ==================== GET NEARBY TESTIMONIES ====================
    getNearbyTestimonies(lat, lng, radiusKm = 10) {
        const testimonies = dataStore.getTestimonies();

        return testimonies
            .map(t => ({
                ...t,
                distance: calculateDistance(lat, lng, t.coordinates.lat, t.coordinates.lng)
            }))
            .filter(t => t.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
    }

    // ==================== GET TIMELINE ====================
    getTimeline(filters = {}) {
        const testimonies = dataStore.filterTestimonies(filters);

        // Group by date
        const timeline = {};

        testimonies.forEach(t => {
            const date = new Date(t.timestamp).toLocaleDateString('es-ES');
            if (!timeline[date]) {
                timeline[date] = [];
            }
            timeline[date].push(t);
        });

        return timeline;
    }

    // ==================== EXPORT TESTIMONIES ====================
    exportTestimonies(format = 'json') {
        const data = dataStore.exportData();
        const filename = `testimonies-export-${Date.now()}.${format}`;

        if (format === 'json') {
            exportToJSON(data, filename);
        } else if (format === 'csv') {
            exportToCSV(data.testimonies, filename);
        }
    }
}

// Create global instance
const testimonyManager = new TestimonyManager();
