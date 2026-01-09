// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCISHqvqHdYnnvDuGACjOnk8Dr896Ur6Ig",
  authDomain: "angpao-app.firebaseapp.com",
  projectId: "angpao-app",
  storageBucket: "angpao-app.firebasestorage.app",
  messagingSenderId: "1020582362356",
  appId: "1:1020582362356:web:d4bec02bbc827e5d7732a1",
  measurementId: "G-D5M2LNZ57Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth, RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
