import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFJcSrPvrEq5lJVBtl2mhsQb84msmUb9s",
  authDomain: "bolg3-8e3a0.firebaseapp.com",
  projectId: "bolg3-8e3a0",
  storageBucket: "bolg3-8e3a0.firebasestorage.app",
  messagingSenderId: "1049434507094",
  appId: "1:1049434507094:web:e9fdb60cc3b6bd483278f7",
  measurementId: "G-81G7QJFT9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Redirect to the Write Blog page if already authenticated
    if (!window.location.pathname.includes("create.html")) {
      window.location.href = "create.html";
    }
  }
});

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");
    window.location.href = "create.html"; // Redirect to Write Blog page
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your credentials.");
  }
});