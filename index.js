import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  startAt
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import "path/to/cool-cats-animation.css"; // Add path to your cool cats animation CSS/JS

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const blogList = document.getElementById("blog-list");

const pageSize = 5;
let lastVisible = null;
let firstVisible = null;
let prevStack = [];

// Create pagination buttons
const nextBtn = document.createElement("button");
const prevBtn = document.createElement("button");

nextBtn.textContent = "Next";
prevBtn.textContent = "Previous";

nextBtn.className = "mt-4 mx-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition";
prevBtn.className = "mt-4 mx-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition";
prevBtn.disabled = true;

const paginationDiv = document.createElement("div");
paginationDiv.className = "text-center";
paginationDiv.appendChild(prevBtn);
paginationDiv.appendChild(nextBtn);
blogList.insertAdjacentElement("afterend", paginationDiv);

async function loadBlogs(direction = "forward") {
  try {
    blogList.innerHTML = "<p class='text-indigo-300'>Loading blogs...</p>";

    let q = query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(pageSize));

    if (direction === "forward" && lastVisible) {
      q = query(collection(db, "blogs"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(pageSize));
    } else if (direction === "backward" && prevStack.length > 1) {
      prevStack.pop(); // remove current
      const prevCursor = prevStack[prevStack.length - 1];
      q = query(collection(db, "blogs"), orderBy("createdAt", "desc"), startAt(prevCursor), limit(pageSize));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      blogList.innerHTML = "<p class='text-gray-400'>No blogs available.</p>";
      return;
    }

    blogList.innerHTML = "";
    firstVisible = snapshot.docs[0];
    lastVisible = snapshot.docs[snapshot.docs.length - 1];

    if (direction === "forward") {
      prevStack.push(firstVisible);
    }

    snapshot.forEach(doc => {
      const blog = doc.data();
      const id = doc.id;

      const title = blog.title || "Untitled";
      const category = blog.category || "Uncategorized";
      const content = blog.content || "";
      const snippet = content.length > 150 ? content.slice(0, 150) + "..." : content;

      let createdAt = "Unknown date";
      if (blog.createdAt?.toDate) {
        createdAt = blog.createdAt.toDate().toLocaleDateString();
      }

      const blogCardContainer = document.createElement("div"); // Create a container for the blog card
      const blogCard = document.createElement("article");
      blogCard.classList.add("cat-wiggle"); // Add cat-wiggle class for animation

      blogCard.innerHTML = `
        <h3 class="text-2xl font-bold text-indigo-300 mb-2">${title}</h3>
        <div class="flex items-center justify-between text-sm text-gray-400 mb-3">
          <span class="italic">${category}</span>
          <span>🗓️ ${createdAt}</span>
        </div>
        <p class="text-gray-200 mb-4 leading-relaxed">${snippet}</p>
        <a href="blog.html?id=${id}" class="text-indigo-400 hover:text-white font-medium transition hover:underline">Read More →</a>
      `;

      blogCardContainer.appendChild(blogCard); // Append blogCard to the container
      blogList.appendChild(blogCardContainer); // Append the container to blogList
    });

    prevBtn.disabled = prevStack.length <= 1;
    nextBtn.disabled = snapshot.size < pageSize;

  } catch (error) {
    console.error("Error fetching blogs:", error);
    blogList.innerHTML = `<p class="text-red-500">❌ Failed to load blogs. Try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => loadBlogs());
nextBtn.addEventListener("click", () => loadBlogs("forward"));
prevBtn.addEventListener("click", () => loadBlogs("backward"));