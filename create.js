import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  const blogForm = document.getElementById("blog-form");
  const uploadButton = document.getElementById("upload-widget");
  const mediaUrlInput = document.getElementById("media-url");
  const uploadStatus = document.getElementById("upload-status");

  // Cloudinary upload widget config
  const uploadWidget = cloudinary.createUploadWidget({
    cloudName: "dzegjqt9e",
    uploadPreset: "blog_site",
    sources: ["local", "url", "camera"],
    multiple: false,
    folder: "blog_media",
    unsigned: true,
  }, (error, result) => {
    if (!error && result && result.event === "success") {
      mediaUrlInput.value = result.info.secure_url;
      uploadStatus.textContent = "✅ Upload successful!";
      uploadStatus.className = "text-green-400 mt-2";
    } else if (error) {
      console.error("Upload error:", error);
      uploadStatus.textContent = "❌ Upload failed.";
      uploadStatus.className = "text-red-400 mt-2";
    }
  });

  uploadButton.addEventListener("click", () => uploadWidget.open());

  blogForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value.trim();
    const content = document.getElementById("content").innerHTML.trim();
    const mediaUrl = mediaUrlInput.value;
    const youtubeUrl = document.getElementById("youtube-url").value.trim();
    const imageUrl = document.getElementById("image-url").value.trim();

    if (!title || !category || !content) {
      alert("🚫 Title, category, and content are required!");
      return;
    }

    try {
      await addDoc(collection(db, "blogs"), {
        title,
        category,
        content,
        mediaUrl: mediaUrl || "",
        youtubeUrl: youtubeUrl || "",
        imageUrl: imageUrl || "",
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      });

      alert("🎉 Blog created successfully!");
      blogForm.reset();
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("❌ Failed to create blog. Try again.");
    }
  });
});
