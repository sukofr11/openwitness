// verification-system.js - Trust and Verification Logic

class VerificationSystem {
    constructor() {
        this.PROXIMITY_THRESHOLD_KM = 5; // Testimonies within 5km can corroborate
        this.TIME_WINDOW_HOURS = 48; // Testimonies within 48 hours can corroborate
        this.MIN_CORROBORATIONS_VERIFIED = 2; // Minimum corroborations for verified status
        this.MIN_REPUTATION_TRUSTED = 75; // Minimum reputation for trusted status
    }

    // ==================== VERIFICATION STATUS ====================
    calculateVerificationStatus(testimony, witness) {
        const corroborations = this.findCorroborations(testimony);
        const witnessReputation = witness ? witness.reputation : 0;

        if (corroborations.length >= this.MIN_CORROBORATIONS_VERIFIED) {
            return 'verified';
        }

        if (witnessReputation >= this.MIN_REPUTATION_TRUSTED) {
            return 'trusted';
        }

        return 'new';
    }

    // ==================== CORROBORATION ====================
    findCorroborations(testimony) {
        const allTestimonies = dataStore.getTestimonies();
        const corroborations = [];

        for (const other of allTestimonies) {
            if (other.id === testimony.id) continue;

            // Check spatial proximity
            const distance = calculateDistance(
                testimony.coordinates.lat,
                testimony.coordinates.lng,
                other.coordinates.lat,
                other.coordinates.lng
            );

            if (distance > this.PROXIMITY_THRESHOLD_KM) continue;

            // Check temporal proximity
            const timeDiff = Math.abs(
                new Date(testimony.timestamp) - new Date(other.timestamp)
            ) / (1000 * 60 * 60); // Convert to hours

            if (timeDiff > this.TIME_WINDOW_HOURS) continue;

            // Check category similarity
            if (testimony.category === other.category) {
                corroborations.push({
                    testimonyId: other.id,
                    witnessId: other.witnessId,
                    distance,
                    timeDiff,
                    similarity: this.calculateSimilarity(testimony, other)
                });
            }
        }

        return corroborations;
    }

    calculateSimilarity(testimony1, testimony2) {
        let score = 0;

        // Category match
        if (testimony1.category === testimony2.category) score += 30;

        // Location proximity (closer = higher score)
        const distance = calculateDistance(
            testimony1.coordinates.lat,
            testimony1.coordinates.lng,
            testimony2.coordinates.lat,
            testimony2.coordinates.lng
        );
        score += Math.max(0, 30 - distance * 6); // Max 30 points for same location

        // Time proximity (closer = higher score)
        const timeDiff = Math.abs(
            new Date(testimony1.timestamp) - new Date(testimony2.timestamp)
        ) / (1000 * 60 * 60);
        score += Math.max(0, 20 - timeDiff); // Max 20 points for same time

        // Description similarity (basic keyword matching)
        const keywords1 = this.extractKeywords(testimony1.description);
        const keywords2 = this.extractKeywords(testimony2.description);
        const commonKeywords = keywords1.filter(k => keywords2.includes(k));
        score += Math.min(20, commonKeywords.length * 4); // Max 20 points

        return Math.min(100, score);
    }

    extractKeywords(text) {
        // Remove common words and extract meaningful keywords
        const stopWords = ['el', 'la', 'de', 'en', 'y', 'a', 'los', 'las', 'un', 'una',
            'por', 'con', 'para', 'es', 'está', 'son', 'the', 'a', 'an',
            'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];

        return text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 10); // Top 10 keywords
    }

    // ==================== WITNESS REPUTATION ====================
    calculateWitnessReputation(witnessId) {
        const testimonies = dataStore.getTestimonies()
            .filter(t => t.witnessId === witnessId);

        if (testimonies.length === 0) return 0;

        let score = 50; // Base score

        // Points for verified testimonies
        const verified = testimonies.filter(t => t.verificationStatus === 'verified').length;
        score += verified * 10;

        // Points for corroborations received
        const totalCorroborations = testimonies.reduce(
            (sum, t) => sum + (t.corroborations?.length || 0), 0
        );
        score += totalCorroborations * 5;

        // Points for activity (testimonies submitted)
        score += Math.min(20, testimonies.length * 2);

        // Penalty for flagged testimonies
        const flagged = testimonies.filter(t => t.flagged).length;
        score -= flagged * 15;

        return Math.max(0, Math.min(100, score));
    }

    updateWitnessReputation(witnessId) {
        const reputation = this.calculateWitnessReputation(witnessId);
        const witness = dataStore.getWitness(witnessId) || {
            id: witnessId,
            joinDate: new Date().toISOString()
        };

        witness.reputation = reputation;
        witness.testimoniesSubmitted = dataStore.getTestimonies()
            .filter(t => t.witnessId === witnessId).length;
        witness.verifiedTestimonies = dataStore.getTestimonies()
            .filter(t => t.witnessId === witnessId && t.verificationStatus === 'verified').length;

        dataStore.saveWitness(witness);
        return witness;
    }

    // ==================== BADGES ====================
    getWitnessBadges(witnessId) {
        const witness = dataStore.getWitness(witnessId);
        if (!witness) return [];

        const badges = [];

        if (witness.reputation >= 90) {
            badges.push({ type: 'verified', label: 'Testigo Verificado', icon: '✓' });
        } else if (witness.reputation >= 75) {
            badges.push({ type: 'trusted', label: 'Testigo Confiable', icon: '★' });
        } else {
            badges.push({ type: 'new', label: 'Nuevo Testigo', icon: '◆' });
        }

        if (witness.verifiedTestimonies >= 10) {
            badges.push({ type: 'expert', label: 'Experto', icon: '🏆' });
        }

        // Monetization: Press Badge Logic
        if (witness.isPress || witness.subscriptionPlan === 'journo' || witness.subscriptionPlan === 'agency') {
            badges.push({ type: 'press', label: 'Prensa Verificada', icon: '📰' });
        }

        if (witness.testimoniesSubmitted >= 5) {
            badges.push({ type: 'active', label: 'Activo', icon: '🔥' });
        }

        return badges;
    }

    // ==================== FLAGGING & MODERATION ====================
    flagTestimony(testimonyId, reason, reporterId) {
        const testimony = dataStore.getTestimony(testimonyId);
        if (!testimony) return false;

        if (!testimony.flags) testimony.flags = [];

        testimony.flags.push({
            reason,
            reporterId,
            timestamp: new Date().toISOString()
        });

        // Auto-hide if too many flags
        if (testimony.flags.length >= 3) {
            testimony.hidden = true;
        }

        dataStore.updateTestimony(testimonyId, testimony);
        return true;
    }

    // ==================== CROSS-REFERENCE VALIDATION ====================
    validateCrossReferences(testimonyId) {
        const testimony = dataStore.getTestimony(testimonyId);
        if (!testimony) return null;

        const corroborations = this.findCorroborations(testimony);
        const witness = dataStore.getWitness(testimony.witnessId);

        // Update corroborations
        testimony.corroborations = corroborations.map(c => c.witnessId);

        // Update verification status
        testimony.verificationStatus = this.calculateVerificationStatus(testimony, witness);

        dataStore.updateTestimony(testimonyId, testimony);

        return {
            testimony,
            corroborations,
            verificationStatus: testimony.verificationStatus,
            witness
        };
    }

    // ==================== TRUST SCORE ====================
    calculateTrustScore(testimony) {
        let score = 0;

        // Witness reputation (0-40 points)
        const witness = dataStore.getWitness(testimony.witnessId);
        if (witness) {
            score += (witness.reputation / 100) * 40;
        }

        // Number of corroborations (0-30 points)
        const corroborations = testimony.corroborations?.length || 0;
        score += Math.min(30, corroborations * 10);

        // Media attachments (0-15 points)
        if (testimony.media && testimony.media.length > 0) {
            score += Math.min(15, testimony.media.length * 5);
        }

        // Detailed description (0-15 points)
        if (testimony.description && testimony.description.length > 100) {
            score += 15;
        } else if (testimony.description && testimony.description.length > 50) {
            score += 10;
        }

        return Math.min(100, Math.round(score));
    }
}

// Create global instance
const verificationSystem = new VerificationSystem();
