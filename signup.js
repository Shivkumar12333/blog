import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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

// Handle sign-up form submission
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Sign-up successful! You can now log in.");
    window.location.href = "login.html"; // Redirect to login page
  } catch (error) {
    console.error("Sign-up error:", error);
    alert(`Error: ${error.message}`);
  }
});

