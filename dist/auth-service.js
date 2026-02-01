// auth-service.js - Handles Authentication (Local & Firebase)

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.trialDurationDays = 15;
        this.init();
    }

    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
            setTimeout(() => this.notifyAuthChange(), 100);
        }

        // Listen for Firebase auth state if available
        if (window.firebaseServices && window.firebaseServices.isAvailable) {
            window.firebaseServices.auth.onAuthStateChanged(user => {
                if (user) {
                    this.currentUser = {
                        id: user.uid,
                        email: user.email,
                        name: user.displayName || user.email.split('@')[0],
                        photoURL: user.photoURL,
                        isAnonymous: user.isAnonymous
                    };
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                } else {
                    this.currentUser = null;
                    localStorage.removeItem('currentUser');
                }
                this.updateUI();
                this.notifyAuthChange();
            });
        }
    }

    // ==================== AUTH ACTIONS ====================
    async login(email, password) {
        if (window.firebaseServices && window.firebaseServices.isAvailable) {
            try {
                await window.firebaseServices.auth.signInWithEmailAndPassword(email, password);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Local Simulation
            console.log('Simulating login for:', email);
            this.currentUser = {
                id: 'user-' + Date.now(),
                email: email,
                name: email.split('@')[0],
                photoURL: null,
                role: 'user'
            };
            // Hack for demo: Check if it's an agency email
            if (email.includes('agency') || email.includes('press')) {
                this.currentUser.role = 'agency';
                this.currentUser.subscription = 'agency';
            }

            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUI();
            this.notifyAuthChange();
            return { success: true };
        }
    }

    async loginWithGoogle() {
        if (window.firebaseServices && window.firebaseServices.isAvailable) {
            const provider = new firebase.auth.GoogleAuthProvider();
            try {
                await window.firebaseServices.auth.signInWithPopup(provider);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Local Simulation
            this.currentUser = {
                id: 'google-user-' + Date.now(),
                email: 'demo@gmail.com',
                name: 'Usuario Demo',
                photoURL: null,
                role: 'user'
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUI();
            this.notifyAuthChange();
            return { success: true };
        }
    }

    async register(email, password) {
        if (window.firebaseServices && window.firebaseServices.isAvailable) {
            try {
                const userCredential = await window.firebaseServices.auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Create user data in Firestore for new registrations
                const now = new Date().toISOString();
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    role: 'witness',
                    reputation: 100,
                    trialStartedAt: now,
                    subscriptionStatus: 'trialing'
                };
                await window.firebaseServices.db.collection('users').doc(user.uid).set(userData);

                this.currentUser = userData;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUI();
                this.notifyAuthChange();
                await this.checkSubscriptionStatus();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Local Simulation
            return this.login(email, password); // For demo, register = login
        }
    }

    async logout() {
        if (window.firebaseServices && window.firebaseServices.isAvailable) {
            await window.firebaseServices.auth.signOut();
        }
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.notifyAuthChange();
        window.location.href = 'index.html'; // Redirect to home
    }

    onAuthStateChanged(callback) {
        this.authCallbacks.push(callback);
        if (this.currentUser) callback(this.currentUser);
    }

    notifyAuthChange() {
        this.authCallbacks.forEach(cb => {
            try { cb(this.currentUser); } catch (e) { console.error(e); }
        });
    }

    async updateUserProfile(updates) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updates };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            if (window.firebaseServices && window.firebaseServices.isAvailable) {
                try {
                    await window.firebaseServices.db.collection('users').doc(this.currentUser.id).update(updates);
                } catch (error) {
                    console.error('Firestore update failed:', error);
                }
            }
            this.updateUI();
            this.notifyAuthChange();
            return { success: true };
        }
        return { success: false, error: 'No user logged in' };
    }

    async subscribe(plan) {
        let role = 'agency';
        if (plan === 'enterprise') role = 'enterprise';
        if (plan === 'journo' || plan === 'journalist' || plan === 'reporter') role = 'reporter';

        return this.updateUserProfile({
            role: role,
            subscription: plan,
            subscriptionStatus: 'active',
            isExpired: false
        });
    }

    // ==================== SUBSCRIPTION STATUS ====================
    async checkSubscriptionStatus() {
        if (!this.currentUser || !this.currentUser.trialStartedAt) return { active: true };

        const start = new Date(this.currentUser.trialStartedAt);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > this.trialDurationDays && this.currentUser.subscriptionStatus !== 'active') {
            this.currentUser.isExpired = true;
            this.showSubscriptionOverlay();
            return { active: false, daysLeft: 0 };
        }

        return { active: true, daysLeft: this.trialDurationDays - diffDays };
    }

    showSubscriptionOverlay() {
        if (document.getElementById('subscription-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'subscription-overlay';
        overlay.style = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(10px); color: white; text-align: center;
            padding: 2rem;
        `;

        overlay.innerHTML = `
            <div style="max-width: 500px; background: var(--color-bg-secondary); padding: 3rem; border-radius: 20px; border: 1px solid var(--color-accent-primary);">
                <span style="font-size: 4rem;">⏳</span>
                <h1 style="margin-top: 1.5rem;">Prueba Vencida</h1>
                <p style="color: var(--color-text-tertiary); margin: 1.5rem 0;">Tu periodo de prueba de ${this.trialDurationDays} días ha finalizado. Para seguir utilizando OpenWitness Intelligence y acceder al mapa satelital, por favor activa tu suscripción.</p>
                <button onclick="window.location.href='agency.html'" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
                    💳 Activar Suscripción con Tarjeta
                </button>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    // ==================== UI UPDATES ====================
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userMenu = document.getElementById('userMenu'); // We need to add this to HTML
        const profileBtn = document.getElementById('profileBtn');

        if (this.currentUser) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                userMenu.querySelector('.username').textContent = this.currentUser.name;
            }
            if (profileBtn) profileBtn.style.display = 'flex'; // Show profile button

            // Sync with DataStore witness ID
            // If we have a real user ID, use that as witness ID
            if (this.currentUser.id) {
                const existingWitnessId = localStorage.getItem('currentWitnessId');
                if (existingWitnessId !== this.currentUser.id) {
                    // Start using the real Auth ID as Witness ID
                    localStorage.setItem('currentWitnessId', this.currentUser.id);
                    // Copy reputation if exists? (Complex logic omitted for MVP)
                }
            }
        } else {
            // User is logged out
            if (loginBtn) loginBtn.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            // Don't hide profile button entirely in demo, maybe prompt login
        }
    }

    getUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Global instance
const authService = new AuthService();
