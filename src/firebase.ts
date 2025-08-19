import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB64fgF3WtGmd0f1r3pysbMgWdpaYdAtXc",
  authDomain: "mybills-50d6a.firebaseapp.com",
  projectId: "mybills-50d6a",
  storageBucket: "mybills-50d6a.firebasestorage.app",
  messagingSenderId: "1021248096578",
  appId: "1:1021248096578:web:64ab7e9a9bf7cf54a820db",
  measurementId: "G-LXPHBRF1QV"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta Firestore
export const db = getFirestore(app);