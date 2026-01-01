import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlW7zWL3oozFpOCZMQ3GDSw7Mn1oE-gag",
  authDomain: "firstproject-f83d3.firebaseapp.com",
  projectId: "firstproject-f83d3",
  storageBucket: "firstproject-f83d3.firebasestorage.app",
  messagingSenderId: "227224002082",
  appId: "1:227224002082:web:e9a563ca0c6bebdc5fb47b",
  measurementId: "G-Q1QFH2ZLGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication providers
const googleProvider = new GoogleAuthProvider();

// Set persistence
setPersistence(auth, browserLocalPersistence);

// Email verification functions
export const verifyUserEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true, message: 'Verification email sent!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Password reset functions
export const sendPasswordReset = async (email) => {
  try {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const verifyResetCode = async (code) => {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const resetPassword = async (code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true, message: 'Password reset successful!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Check email verification
export const checkEmailVerified = (user) => {
  return user.emailVerified;
};

// Export everything
export { 
  auth, 
  db, 
  storage, 
  googleProvider,
  sendEmailVerification,
  applyActionCode 
};

export default app;