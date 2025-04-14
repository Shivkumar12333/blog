import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user); // Debugging log
  if (!user) {
    console.log("User not authenticated. Redirecting to login page."); // Debugging log
    if (!window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
    }
  } else {
    console.log("User authenticated:", user); // Debugging log
  }
});