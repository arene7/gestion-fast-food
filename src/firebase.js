// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Importar Firestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0LjywjmnZwGpyd3v6HdiGmUCe_RSFerU",
  authDomain: "gestionfastfood-137d9.firebaseapp.com",
  projectId: "gestionfastfood-137d9",
  storageBucket: "gestionfastfood-137d9.firebasestorage.app",
  messagingSenderId: "184176197509",
  appId: "1:184176197509:web:1eb12040595def304e4eec",
  measurementId: "G-X6ZLNV12E1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializar Firebase Authentication
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);  // Inicialización de Firestore

// Exportar
export { app, analytics, auth, db };  // Asegúrate de exportar db
