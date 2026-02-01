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

            // Sync with DataStore witness record
            const witnessId = localStorage.getItem('currentWitnessId');
            if (witnessId && window.dataStore) {
                const witness = window.dataStore.getWitness(witnessId);
                if (witness) {
                    window.dataStore.saveWitness({
                        ...witness,
                        name: this.currentUser.name,
                        bio: this.currentUser.bio || this.currentUser.specialty
                    });
                }
            }

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
        const loginBtns = document.querySelectorAll('#loginBtn, .login-btn');
        const userMenus = document.querySelectorAll('#userMenu, .user-menu');
        const profileBtns = document.querySelectorAll('#profileBtn, .profile-btn');

        if (this.currentUser) {
            // User is logged in
            loginBtns.forEach(btn => btn.style.display = 'none');

            userMenus.forEach(menu => {
                menu.style.display = 'flex';
                // Update all username instances
                menu.querySelectorAll('.username').forEach(el => {
                    el.textContent = this.currentUser.name || 'Usuario';
                });
                // Update all user initials
                menu.querySelectorAll('.user-initial').forEach(el => {
                    el.textContent = (this.currentUser.name || 'U').charAt(0).toUpperCase();
                });
                // Update role labels
                menu.querySelectorAll('.user-role').forEach(el => {
                    if (this.currentUser.role === 'agency') el.textContent = 'Suscripción Agency';
                    else if (this.currentUser.role === 'enterprise') el.textContent = 'Suscripción Enterprise';
                    else el.textContent = 'Plan Gratuito';
                });
            });

            profileBtns.forEach(btn => btn.style.display = 'flex');

            // Sync with DataStore witness ID
            if (this.currentUser.id) {
                const existingWitnessId = localStorage.getItem('currentWitnessId');
                if (existingWitnessId !== this.currentUser.id) {
                    localStorage.setItem('currentWitnessId', this.currentUser.id);
                }
            }
        } else {
            // User is logged out
            loginBtns.forEach(btn => btn.style.display = 'block');
            userMenus.forEach(menu => menu.style.display = 'none');
            profileBtns.forEach(btn => {
                if (!btn.classList.contains('demo-allowed')) {
                    btn.style.display = 'none';
                }
            });
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
