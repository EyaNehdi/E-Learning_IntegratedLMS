import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";  // Importer la méthode pour accéder à la base de données Firebase

// Ta configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrijvp0hHPlJZST5qHd5FvKgfjaGUejqk",
  authDomain: "trelixchat.firebaseapp.com",
  projectId: "trelixchat",
  storageBucket: "trelixchat.firebasestorage.app",
  messagingSenderId: "791611321395",
  appId: "1:791611321395:web:354201acb628d65c834746"
};

// Vérifie si une instance Firebase existe déjà
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exporter la base de données Firebase pour l'utiliser dans le reste de l'application
export const db = getDatabase(app);
