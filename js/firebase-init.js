// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database-compat.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js";

const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://ВАШ_PROJECT_ID.firebaseio.com",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_PROJECT_ID.appspot.com",
  messagingSenderId: "ВАШ_SENDER_ID",
  appId: "ВАШ_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };
