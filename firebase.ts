import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBQkgrumfwI49Crnhi9y7wImYzNF3D87sg",
    authDomain: "safaa-platform.firebaseapp.com",
    databaseURL: "https://safaa-platform-default-rtdb.firebaseio.com",
    projectId: "safaa-platform",
    storageBucket: "safaa-platform.firebasestorage.app",
    messagingSenderId: "393592099948",
    appId: "1:393592099948:web:4bf8cf070d411b124a3449",
    measurementId: "G-6WMNK2PL40"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
