// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZUNUQvG-mLePJridVY_r1q9tW0xGRy00",
  authDomain: "appweb-sorteio-saas-3e7c7.firebaseapp.com",
  projectId: "appweb-sorteio-saas-3e7c7",
  storageBucket: "appweb-sorteio-saas-3e7c7.firebasestorage.app",
  messagingSenderId: "969938263965",
  appId: "1:969938263965:web:c605099e5ea9d02239d974",
  measurementId: "G-DL960DSWT4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
