// blog.js
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

// Firebase config
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
const db = getFirestore(app);

// Extract blog ID from URL
const params = new URLSearchParams(window.location.search);
const blogId = params.get("id");
const blogPostDiv = document.getElementById("blog-post");

if (blogId && blogPostDiv) {
  const blogRef = doc(db, "blogs", blogId);
  getDoc(blogRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const blog = docSnap.data();
        const createdAt = blog.createdAt?.toDate().toLocaleDateString() || "Unknown date";

        // Create a wrapper element
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `
          <h2 class="text-2xl font-bold">${blog.title}</h2>
          <p class="text-sm text-gray-500 italic">${blog.category}</p>
          ${blog.imageUrl ? `<img src="${blog.imageUrl}" alt="Image" class="w-full my-4 rounded-lg">` : ''}
          ${blog.videoUrl ? `<iframe class="w-full aspect-video my-4 rounded-lg" src="https://www.youtube.com/embed/${blog.videoUrl.split("v=")[1]}" frameborder="0" allowfullscreen></iframe>` : ''}
        `;

        // Create a content div and inject blog content as HTML
        const contentDiv = document.createElement("div");
        contentDiv.className = "prose max-w-none";
        contentDiv.innerHTML = blog.content;

        wrapper.appendChild(contentDiv);
        blogPostDiv.innerHTML = "";
        blogPostDiv.appendChild(wrapper);
      } else {
        blogPostDiv.innerHTML = "<p>Blog not found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching blog:", error);
      blogPostDiv.innerHTML = "<p>Error loading blog post.</p>";
    });
} else {
  blogPostDiv.innerHTML = "<p>Invalid blog ID.</p>";
}