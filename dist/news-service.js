/**
 * news-service.js - OpenWitness Intelligence Real-Time News
 * Fetches real humanitarian and conflict reports from ReliefWeb API.
 */

class NewsService {
    constructor() {
        this.apiUrl = 'https://api.reliefweb.int/v1/reports?appname=openwitness&limit=5&sort[]=date:desc';
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
            console.error("Error fetching news:", error);
        } finally {
            this.isRunning = false;
        }
    }

    async processNewsItem(item) {
        // Fetch full fields for each item
        try {
            const detailRes = await fetch(item.href);
            const detailData = await detailRes.json();
            const report = detailData.data[0].fields;

            const title = report.title;
            const primaryCountry = report.primary_country ? report.primary_country.name : 'Unknown';
            const locationString = `${primaryCountry}`; // Could try to extract city from title/body in future

            // Geocode location
            const coords = await this.geocodeLocation(locationString);

            if (coords) {
                this.ingestAsTestimony({
                    id: 'reliefweb_' + item.id,
                    title: title,
                    description: `[REAL-TIME NEWS] ${title}. Fuente: ReliefWeb. Ver reporte original en: ${report.url}`,
                    location: primaryCountry,
                    coords: coords,
                    source: 'ReliefWeb Intelligence'
                });
            }
        } catch (e) {
            console.error("Error processing news item:", e);
        }
    }

    async geocodeLocation(locationName) {
        try {
            const response = await fetch(this.nominatimUrl + encodeURIComponent(locationName));
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
            coordinates: data.coords,
            timestamp: new Date().toISOString(),
            witnessId: 'OW_AI_NEWS',
            witnessName: data.source,
            verificationStatus: 'verified',
            trustScore: 95,
            isNews: true
        };

        if (window.dataStore) {
            window.dataStore.addTestimony(testimony);
            // Trigger UI update if App instance is available
            if (window.appInstance && window.appInstance.loadTestimonies) {
                window.appInstance.loadTestimonies();
            }
        }
    }

    inferCategory(title) {
        const t = title.toLowerCase();
        if (t.includes('bomb') || t.includes('attack') || t.includes('conflict') || t.includes('ataque') || t.includes('combate')) return 'security';
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
window.newsService.startAutoUpdate();
