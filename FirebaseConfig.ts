// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYuH3cPw4gQ_70TI7B9EeHkWOYx2mXReI",
  authDomain: "todo-app-b8167.firebaseapp.com",
  projectId: "todo-app-b8167",
  storageBucket: "todo-app-b8167.firebasestorage.app",
  messagingSenderId: "350782365284",
  appId: "1:350782365284:web:4f5ce7324b12cf795fc971",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

