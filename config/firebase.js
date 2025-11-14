import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyBgaVffUSp7_GnYeGmPVnMXb4MKHyiN3GQ",
  authDomain: "intranet-copvilla.firebaseapp.com",
  projectId: "intranet-copvilla",
  storageBucket: "intranet-copvilla.firebasestorage.app",
  messagingSenderId: "699054012985",
  appId: "1:699054012985:web:e17a1d5f766a44b97d2be8",
  measurementId: "G-HMPTQZFPJ5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Cloud Storage y obtener una referencia al servicio
const storage = getStorage(app);

export { storage };
export default app;