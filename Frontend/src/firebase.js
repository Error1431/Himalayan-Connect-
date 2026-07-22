import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 👈 1. Auth import kiya

const firebaseConfig = {
    apiKey: "AIzaSyA11ofyk31IHhF82nY0NCgXH_FT-FEoJvQ",
    authDomain: "himalayansconnect-651d1.firebaseapp.com",
    projectId: "himalayansconnect-651d1",
    storageBucket: "himalayansconnect-651d1.firebasestorage.app",
    messagingSenderId: "1065156229464",
    appId: "1:1065156229464:web:08e4d60e29009e0aa7cd2d",
    measurementId: "G-LQKDXXQEP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 👈 2. Auth initialize karke EXPORT kar diya
export const auth = getAuth(app);

export default app;