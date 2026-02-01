// data-store.js - Data Persistence Layer (Hybrid: LocalStorage + Firestore)
class DataStore {
    constructor() {
        this.STORAGE_KEY = 'crisis_testimonies';
        this.WITNESS_KEY = 'crisis_witnesses';
        this.init();
    }

    init() {
        // Initialize local storage if empty
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            this.loadSampleData(); // Load sample data if fresh start
        }
        if (!localStorage.getItem(this.WITNESS_KEY)) {
            localStorage.setItem(this.WITNESS_KEY, JSON.stringify([]));
        }

        // Listen for Firestore updates if available
        if (this.isFirestoreAvailable()) {
            this.syncFromCloud();
        }
    }

    isFirestoreAvailable() {
        return window.firebaseServices && window.firebaseServices.isAvailable && window.firebaseServices.db;
    }

    syncFromCloud() {
        try {
            // Simple one-way sync listener for demo
            window.firebaseServices.db.collection('testimonies').orderBy('timestamp', 'desc').limit(50)
                .onSnapshot(snapshot => {
                    const cloudTestimonies = [];
                    snapshot.forEach(doc => {
                        cloudTestimonies.push({ id: doc.id, ...doc.data() });
                    });

                    if (cloudTestimonies.length === 0) {
                        // If cloud is empty (fresh project), load sample data so user sees SOMETHING
                        console.log('Cloud empty, loading sample data for demo purpose...');
                        this.loadSampleData();
                        // And upload them to cloud? Maybe not to avoid spamming user's DB. 
                        // Just use local sample data for display but keep cloud sync active for new inputs.
                        // Actually, let's just use what we have in local if cloud is empty
                        if (this.getTestimonies().length === 0) {
                            this.loadSampleData();
                        }
                    } else {
                        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudTestimonies));
                    }

                    window.dispatchEvent(new Event('data-updated'));
                });
        } catch (e) {
            console.error('Firestore sync error:', e);
        }
    }

    // ==================== MEDIA HANDLING ====================
    async uploadMedia(file) {
        if (!this.isFirestoreAvailable()) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        try {
            const ref = window.firebaseServices.storage.ref();
            const fileRef = ref.child(`evidence/${Date.now()}_${file.name}`);
            const snapshot = await fileRef.put(file);
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error('Upload failed:', error);
            return null;
        }
    }

    // ==================== TESTIMONIES ====================
    saveTestimony(testimony) {
        // 1. Save to Local
        const testimonies = this.getTestimonies();
        testimonies.unshift(testimony);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(testimonies));

        // 2. Save to Cloud
        if (this.isFirestoreAvailable()) {
            const { id, ...data } = testimony;
            window.firebaseServices.db.collection('testimonies').doc(id).set(data)
                .then(() => console.log('Testimony synced to Cloud'))
                .catch(err => console.error('Sync failed', err));
        }

        window.dispatchEvent(new Event('data-updated'));
        return testimony;
    }

    getTestimonies() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    }

    filterTestimonies(filters) {
        let testimonies = this.getTestimonies();

        // Category Filter
        if (filters.category && filters.category !== 'all') {
            testimonies = testimonies.filter(t => t.category === filters.category);
        }

        // Verification Filter
        if (filters.verification && filters.verification !== 'all') {
            if (filters.verification === 'verified') {
                testimonies = testimonies.filter(t => t.verificationStatus === 'verified');
            } else if (filters.verification === 'pending') {
                testimonies = testimonies.filter(t => t.verificationStatus === 'pending');
            }
        }

        // Date Filters
        if (filters.dateFrom) {
            testimonies = testimonies.filter(t => new Date(t.timestamp) >= new Date(filters.dateFrom));
        }
        if (filters.dateTo) {
            testimonies = testimonies.filter(t => new Date(t.timestamp) <= new Date(filters.dateTo));
        }

        // Location Text Filter
        if (filters.location) {
            testimonies = testimonies.filter(t =>
                t.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Geo Radius Filter
        if (filters.radius && filters.center) {
            // Assumes calculateDistance is in utils.js
            if (typeof calculateDistance === 'function') {
                testimonies = testimonies.filter(t => {
                    const distance = calculateDistance(
                        filters.center.lat,
                        filters.center.lng,
                        t.coordinates.lat,
                        t.coordinates.lng
                    );
                    return distance <= filters.radius;
                });
            }
        }

        return testimonies;
    }

    getTestimony(id) {
        return this.getTestimonies().find(t => t.id === id);
    }

    updateTestimony(id, updates) {
        const testimonies = this.getTestimonies();
        const index = testimonies.findIndex(t => t.id === id);

        if (index !== -1) {
            testimonies[index] = { ...testimonies[index], ...updates };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(testimonies));

            // Sync Update
            if (this.isFirestoreAvailable()) {
                window.firebaseServices.db.collection('testimonies').doc(id).update(updates);
            }

            window.dispatchEvent(new Event('data-updated'));
            return testimonies[index];
        }
        return null;
    }

    // ==================== WITNESSES ====================
    saveWitness(witness) {
        let witnesses = this.getWitnesses();
        const existingIndex = witnesses.findIndex(w => w.id === witness.id);

        if (existingIndex !== -1) {
            witnesses[existingIndex] = witness;
        } else {
            witnesses.push(witness);
        }

        localStorage.setItem(this.WITNESS_KEY, JSON.stringify(witnesses));

        // Sync Witness
        if (this.isFirestoreAvailable()) {
            const { id, ...data } = witness;
            window.firebaseServices.db.collection('users').doc(id).set(data);
        }

        return witness;
    }

    getWitness(id) {
        return this.getWitnesses().find(w => w.id === id);
    }

    getWitnesses() {
        return JSON.parse(localStorage.getItem(this.WITNESS_KEY)) || [];
    }

    // ==================== STATISTICS ====================
    getStatistics() {
        const testimonies = this.getTestimonies();
        const witnesses = this.getWitnesses();
        const verified = testimonies.filter(t => t.verificationStatus === 'verified').length;
        const countries = new Set(testimonies.map(t => t.country || 'Unknown')).size;

        return {
            total: testimonies.length,
            verified,
            witnesses: witnesses.length,
            countries,
        };
    }

    // ==================== SAMPLE DATA ====================
    loadSampleData() {
        // Need to ensure utils.js is loaded for generateId, or provide fallback
        const genId = (typeof generateId === 'function') ? generateId : () => 'id-' + Math.random().toString(36).substr(2, 9);

        const sampleTestimonies = [
            {
                id: genId(),
                title: 'Distribución de ayuda humanitaria',
                description: 'Llegó un convoy de ayuda humanitaria con alimentos y medicinas. Distribución organizada por voluntarios.',
                category: 'humanitarian',
                location: 'Valencia, España',
                coordinates: { lat: 39.4699, lng: -0.3763 },
                country: 'España',
                witnessName: 'María G.',
                witnessId: 'witness-001',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                verificationStatus: 'verified',
                corroborations: ['witness-002', 'witness-003'],
                views: 145,
                media: []
            },
            {
                id: genId(),
                title: 'Daños severos en carreteras',
                description: 'Carretera principal bloqueada por escombros. Equipos de rescate trabajando.',
                category: 'infrastructure',
                location: 'Paiporta, Valencia',
                coordinates: { lat: 39.4267, lng: -0.4167 },
                country: 'España',
                witnessName: 'Anónimo',
                witnessId: 'witness-004',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                verificationStatus: 'verified',
                corroborations: ['witness-005'],
                views: 89,
                media: []
            },
            {
                id: genId(),
                title: 'Centro médico temporal operativo',
                description: 'Establecido en el polideportivo municipal. Se necesitan más suministros médicos.',
                category: 'medical',
                location: 'Catarroja, Valencia',
                coordinates: { lat: 39.4000, lng: -0.4000 },
                country: 'España',
                witnessName: 'Dr. Carlos R.',
                witnessId: 'witness-006',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                verificationStatus: 'verified',
                corroborations: ['witness-007'],
                views: 234,
                media: []
            },
            {
                id: genId(),
                title: 'Evacuación de familias',
                description: 'Evacuación preventiva en zonas bajas por riesgo de inundación.',
                category: 'displacement',
                location: 'Torrent, Valencia',
                coordinates: { lat: 39.4370, lng: -0.4664 },
                country: 'España',
                witnessName: 'Anónimo',
                witnessId: 'witness-010',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                verificationStatus: 'trusted',
                corroborations: [],
                views: 178,
                media: []
            },
            {
                id: genId(),
                title: 'Búsqueda y rescate en curso',
                description: 'Operaciones activas con perros de búsqueda en edificios colapsados.',
                category: 'security',
                location: 'Massanassa, Valencia',
                coordinates: { lat: 39.4100, lng: -0.4100 },
                country: 'España',
                witnessName: 'Bombero Voluntario',
                witnessId: 'witness-017',
                timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
                verificationStatus: 'verified',
                corroborations: ['witness-018'],
                views: 312,
                media: []
            }
        ];

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleTestimonies));

        // Create sample witnesses
        const sampleWitnesses = [];
        for (let i = 1; i <= 21; i++) {
            sampleWitnesses.push({
                id: `witness-${String(i).padStart(3, '0')}`,
                reputation: Math.floor(Math.random() * 100) + 50,
                testimoniesSubmitted: Math.floor(Math.random() * 10) + 1,
                verifiedTestimonies: Math.floor(Math.random() * 5),
                joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        localStorage.setItem(this.WITNESS_KEY, JSON.stringify(sampleWitnesses));
    }
}

// Create global instance
const dataStore = new DataStore();
