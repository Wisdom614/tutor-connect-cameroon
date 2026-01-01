import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.warn('Running in development mode with mock Firebase');
  
  // Mock Firebase for development
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      console.log('Mock auth state changed');
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: async () => ({ user: { uid: 'mock-user' } }),
    createUserWithEmailAndPassword: async () => ({ user: { uid: 'mock-user' } }),
    signOut: async () => {}
  };
  
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: () => true, data: () => ({}) }),
        set: async () => {},
        update: async () => {}
      }),
      where: () => ({
        get: async () => ({ docs: [] })
      }),
      get: async () => ({ docs: [] })
    })
  };
  
  storage = {};
  googleProvider = {};
}

export { auth, db, storage, googleProvider };
export default app;