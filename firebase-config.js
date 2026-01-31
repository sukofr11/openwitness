// firebase-config.js
// TEMPLATE: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your Apps

const firebaseConfig = {
    apiKey: "AIzaSyDsnqxOUNpqoRtK0zi43xZwgPXyCEMzZ6I",
    authDomain: "openwitness-global.firebaseapp.com",
    projectId: "openwitness-global",
    storageBucket: "openwitness-global.firebasestorage.app",
    messagingSenderId: "629255495174",
    appId: "1:629255495174:web:b6735120af06ad6cfcad87",
    measurementId: "G-636MHBJ5QX"
};

// Check if Firebase is available (loaded via CDN)
const isFirebaseLoaded = typeof firebase !== 'undefined';

let app, auth, db, storage;

if (isFirebaseLoaded && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        storage = firebase.storage();
        console.log('🔥 Firebase connected successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
} else {
    console.log('⚠️ Firebase SDK not loaded or config missing. Running in LOCAL MODE.');
}

// Export for other modules (if using modules) or global access
window.firebaseServices = { auth, db, storage, isAvailable: !!app };
