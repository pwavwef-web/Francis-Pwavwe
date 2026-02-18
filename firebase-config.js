// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6lxgjNY4CRNHAe3pAgR5SYv1ohL8brOI",
  authDomain: "francis-pwavwe.firebaseapp.com",
  projectId: "francis-pwavwe",
  storageBucket: "francis-pwavwe.firebasestorage.app",
  messagingSenderId: "658069378543",
  appId: "1:658069378543:web:87b1dcb0dd27d3255bd21a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp };
