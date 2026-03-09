// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCh8bTCe2UwLUThgHUdSinQCGBXTrvswHA",
    authDomain: "morukochats.firebaseapp.com",
    projectId: "morukochats",
    storageBucket: "morukochats.firebasestorage.app",
    databaseURL: "https://morukochats-default-rtdb.asia-southeast1.firebasedatabase.app",
    messagingSenderId: "1086829411607",
    appId: "1:1086829411607:web:27aaad9ba31b5dfa714b52",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
/*<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCh8bTCe2UwLUThgHUdSinQCGBXTrvswHA",
    authDomain: "morukochats.firebaseapp.com",
    projectId: "morukochats",
    storageBucket: "morukochats.firebasestorage.app",
    messagingSenderId: "1086829411607",
    appId: "1:1086829411607:web:27aaad9ba31b5dfa714b52",
    measurementId: "G-RTHFSVFB28"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>*/


////////////////////////////////////////////////////////////////////////////////////////////////


import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
export const rtdb = getDatabase(app);
