import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBBPg-BUd2mxq633iBRAULKQ0IX2RBtDxM',
    authDomain: 'twitter-clone-ouiza.firebaseapp.com',
    projectId: 'twitter-clone-ouiza',
    storageBucket: 'twitter-clone-ouiza.firebasestorage.app',
    messagingSenderId: '298397861061',
    appId: '1:298397861061:web:3002d0cfd07d8b4a4e5cac',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);