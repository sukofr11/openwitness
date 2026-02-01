/**
 * news-service.js - OpenWitness Intelligence Real-Time News
 * Fetches real humanitarian and conflict reports from ReliefWeb API.
 */

class NewsService {
    constructor() {
        this.apiUrl = 'https://api.reliefweb.int/v1/reports?appname=openwitness&limit=50&sort[]=date:desc';
        this.nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=';
        this.isRunning = false;
        this.updateInterval = 1000 * 60 * 15; // 15 minutes
    }

    /**
     * Fetches real reports from ReliefWeb and geocodes them.
     */
    async fetchRecentIntelligence() {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log("Fetching real-time intelligence from ReliefWeb...");

        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();

            if (data && data.data) {
                for (const item of data.data) {
                    await this.processNewsItem(item);
                    // Add a small delay between geocoding requests to respect Nominatim usage policy
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error("❌ [NewsService] Error fetching news list:", error);
        } finally {
            console.log("🏁 [NewsService] Intelligence fetch cycle completed.");
            this.isRunning = false;
        }
    }

    async processNewsItem(item) {
        if (window.dataStore && window.dataStore.getTestimony('reliefweb_' + item.id)) {
            return;
        }

        try {
            const detailRes = await fetch(item.href);
            const detailData = await detailRes.json();
            const report = detailData.data[0].fields;

            const title = report.title;
            const primaryCountry = report.primary_country ? report.primary_country.name : 'Unknown';

            // Geocode location
            console.log(`🌍 [NewsService] Geocoding: ${primaryCountry}`);
            let coords = await this.geocodeLocation(primaryCountry);

            // Fallback for common countries if geocoding fails
            if (!coords) {
                console.log(`⚠️ [NewsService] Geocoding failed for ${primaryCountry}, checking fallbacks...`);
                const fallbacks = {
                    'Ukraine': { lat: 48.3794, lng: 31.1656 },
                    'Gaza Strip': { lat: 31.3547, lng: 34.3088 },
                    'Sudan': { lat: 12.8628, lng: 30.2176 },
                    'Yemen': { lat: 15.5527, lng: 48.5164 },
                    'Palestine': { lat: 31.9522, lng: 35.2332 },
                    'Syria': { lat: 34.8021, lng: 38.9968 },
                    'Ethiopia': { lat: 9.145, lng: 40.4897 },
                    'Myanmar': { lat: 21.9162, lng: 95.9560 },
                    'Democratic Republic of the Congo': { lat: -4.0383, lng: 21.7587 },
                    'Afghanistan': { lat: 33.9391, lng: 67.7100 },
                    'Somalia': { lat: 5.1521, lng: 46.1996 },
                    'Russia': { lat: 61.5240, lng: 105.3188 },
                    'Israel': { lat: 31.0461, lng: 34.8516 }
                };
                coords = fallbacks[primaryCountry];
            }

            if (coords) {
                console.log(`✅ [NewsService] Ingesting: ${title} at [${coords.lat}, ${coords.lng}]`);
                this.ingestAsTestimony({
                    id: 'reliefweb_' + item.id,
                    title: title,
                    description: `[REAL-TIME NEWS] ${title}. Fuente: ReliefWeb.`,
                    location: primaryCountry,
                    coords: coords,
                    source: 'ReliefWeb Intelligence'
                });
            } else {
                console.warn(`🛑 [NewsService] No geocoordinates for ${primaryCountry}. Skipping.`);
            }
        } catch (e) {
            console.error("Error processing news item:", e);
        }
    }

    async geocodeLocation(locationName) {
        try {
            // Respect Nominatim usage policy: no User-Agent header in browser, 
            // but we can try to be nice. Some proxies might require it.
            const response = await fetch(`${this.nominatimUrl}${encodeURIComponent(locationName)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (e) {
            console.error("Geocoding error:", e);
        }
        return null;
    }

    ingestAsTestimony(data) {
        const testimony = {
            id: data.id,
            title: data.title,
            description: data.description,
            category: this.inferCategory(data.title),
            location: data.location,
            coordinates: data.coords, // Corrected from data.coordinates to data.coords based on processNewsItem
            country: data.location,
            timestamp: new Date().toISOString(),
            witnessId: 'OW_AI_NEWS',
            witnessName: data.source,
            verificationStatus: 'verified',
            trustScore: 98,
            isNews: true
        };

        if (window.dataStore) {
            window.dataStore.saveTestimony(testimony);
            // Force immediate UI hydration
            window.dispatchEvent(new Event('data-updated'));
            console.log(`📡 [NewsService] Data-updated dispatched for ${testimony.id}`);
        }
    }

    inferCategory(title) {
        const t = title.toLowerCase();
        if (t.includes('bomb') || t.includes('attack') || t.includes('conflict') || t.includes('ataque') || t.includes('combate') || t.includes('war')) return 'security';
        if (t.includes('health') || t.includes('medical') || t.includes('hospital') || t.includes('médico')) return 'medical';
        if (t.includes('food') || t.includes('aid') || t.includes('humanitarian') || t.includes('ayuda')) return 'humanitarian';
        if (t.includes('displaced') || t.includes('refugee') || t.includes('desplazado')) return 'displacement';
        if (t.includes('safe') || t.includes('corridor') || t.includes('segura')) return 'safezone';
        return 'general';
    }

    startAutoUpdate() {
        this.fetchRecentIntelligence();
        setInterval(() => this.fetchRecentIntelligence(), this.updateInterval);
    }
}

// Global instance
window.newsService = new NewsService();
// startAutoUpdate moved to app.js for better sync

