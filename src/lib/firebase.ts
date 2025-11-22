// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "ace-the-interview-wim38",
  "appId": "1:437229662226:web:06f022cf3e5fc41cc528cb",
  "storageBucket": "ace-the-interview-wim38.firebasestorage.app",
  "apiKey": "AIzaSyBkV8lfH3YSoTFVOw7vzj4BHv6Ox_Lx-KE",
  "authDomain": "ace-the-interview-wim38.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "437229662226"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
