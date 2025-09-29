// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDQWiHqyxCmhMLANyoMFeeJCoxAv5BMTYc",
  authDomain: "cv-generator-45805.firebaseapp.com",
  databaseURL: "https://cv-generator-45805-default-rtdb.firebaseio.com",
  projectId: "cv-generator-45805",
  storageBucket: "cv-generator-45805.firebasestorage.app",
  messagingSenderId: "408295452782",
  appId: "1:408295452782:web:54125da803bbe11f02367f",
  measurementId: "G-SR1DG0MBCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Configure Google Auth Provider
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  include_granted_scopes: 'true'
});

// Set language code
auth.languageCode = 'en';

export default app;