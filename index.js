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

const nextBtn = document.createElement("button");
const prevBtn = document.createElement("button");

nextBtn.textContent = "Next";
prevBtn.textContent = "Previous";
nextBtn.className = "read-more m-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700";
prevBtn.className = "read-more m-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700";
prevBtn.disabled = true;

const paginationDiv = document.createElement("div");
paginationDiv.className = "text-center mt-6";
paginationDiv.appendChild(prevBtn);
paginationDiv.appendChild(nextBtn);
blogList.insertAdjacentElement("afterend", paginationDiv);

async function loadBlogs(direction = "forward") {
  try {
    blogList.innerHTML = "<p class='text-gray-400'>Loading blogs...</p>";

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
      const snippet = content.length > 100 ? content.slice(0, 100) + "..." : content;

      let createdAt = "Unknown date";
      if (blog.createdAt?.toDate) {
        createdAt = blog.createdAt.toDate().toLocaleDateString();
      }

      const blogCard = document.createElement("div");
      blogCard.className = "bg-white p-6 rounded-lg shadow-md";

      blogCard.innerHTML = `
        <h3 class="text-xl font-bold text-indigo-600">${title}</h3>
        <p class="text-sm italic text-gray-500">${category}</p>
        <p class="text-sm text-gray-400 mb-2">Published on: ${createdAt}</p>
        <p class="text-gray-700 mb-2">${snippet}</p>
        <a href="blog.html?id=${id}" class="text-blue-500 hover:underline">Read More</a>
      `;

      blogList.appendChild(blogCard);
    });

    prevBtn.disabled = prevStack.length <= 1;
    nextBtn.disabled = snapshot.size < pageSize;

  } catch (error) {
    console.error("Error fetching blogs:", error);
    blogList.innerHTML = `<p class="text-red-500">Failed to load blogs. Try again later.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => loadBlogs());
nextBtn.addEventListener("click", () => loadBlogs("forward"));
prevBtn.addEventListener("click", () => loadBlogs("backward"));