// Related Posts Feature
class RelatedPostsManager {
  constructor() {
    this.initializeRelatedPosts();
  }

  initializeRelatedPosts() {
    if (window.location.pathname.includes('blog.html')) {
      setTimeout(() => {
        this.loadRelatedPosts();
      }, 1500);
    }
  }

  async loadRelatedPosts() {
    const blogId = new URLSearchParams(window.location.search).get('id');
    if (!blogId) return;

    try {
      // Get current blog data
      const currentBlogDoc = await firebase.firestore().collection('blogs').doc(blogId).get();
      if (!currentBlogDoc.exists) return;

      const currentBlog = currentBlogDoc.data();
      
      // Get all blogs to find related ones
      const allBlogsSnapshot = await firebase.firestore().collection('blogs').get();
      const allBlogs = allBlogsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(blog => blog.id !== blogId); // Exclude current blog

      // Find related posts
      const relatedPosts = this.findRelatedPosts(currentBlog, allBlogs);
      
      if (relatedPosts.length > 0) {
        this.displayRelatedPosts(relatedPosts);
      }
    } catch (error) {
      console.error('Error loading related posts:', error);
    }
  }

  findRelatedPosts(currentBlog, allBlogs) {
    // Calculate similarity scores
    const scoredPosts = allBlogs.map(blog => {
      let score = 0;
      
      // Same category gets highest score
      if (blog.category === currentBlog.category) {
        score += 10;
      }
      
      // Check title word similarity
      const currentWords = this.extractWords(currentBlog.title);
      const blogWords = this.extractWords(blog.title);
      const titleSimilarity = this.calculateWordSimilarity(currentWords, blogWords);
      score += titleSimilarity * 5;
      
      // Check content similarity
      const currentContentWords = this.extractWords(currentBlog.content);
      const blogContentWords = this.extractWords(blog.content);
      const contentSimilarity = this.calculateWordSimilarity(currentContentWords, blogContentWords);
      score += contentSimilarity * 2;
      
      // Boost popular posts slightly
      score += Math.min((blog.likes || 0) * 0.1, 2);
      
      return { ...blog, similarityScore: score };
    });

    // Sort by similarity score and return top 4
    return scoredPosts
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 4)
      .filter(post => post.similarityScore > 0);
  }

  extractWords(text) {
    if (!text) return [];
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !this.isStopWord(word));
  }

  isStopWord(word) {
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'with', 'have', 'this', 'will', 'his', 'they', 'that', 'she', 'been', 'him', 'from', 'what', 'were', 'said', 'each', 'which', 'their', 'time', 'into', 'has', 'more', 'her', 'two', 'like', 'him', 'see', 'now', 'way', 'who', 'could', 'did', 'get', 'may', 'come', 'made', 'when', 'make', 'many', 'then', 'them', 'these', 'use', 'work', 'than', 'such', 'very', 'back', 'only', 'know', 'just', 'say', 'take', 'year', 'your', 'good', 'some', 'most', 'over', 'think', 'also', 'day', 'after', 'same', 'where', 'why', 'how', 'every', 'before', 'between', 'because', 'while', 'about', 'being', 'through', 'during', 'without', 'under', 'within', 'upon', 'across', 'above', 'below', 'beside', 'beyond', 'among', 'around', 'against', 'toward', 'towards', 'throughout', 'underneath', 'alongside', 'despite', 'regarding', 'concerning', 'according', 'considering', 'including', 'excluding', 'following', 'preceding', 'assuming', 'providing', 'supposing', 'unless', 'until', 'since', 'although', 'though', 'whereas', 'whenever', 'wherever', 'however', 'whatever', 'whoever', 'whichever', 'whether', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'nonetheless', 'otherwise', 'meanwhile', 'consequently', 'subsequently', 'eventually', 'recently', 'currently', 'previously', 'formerly', 'originally', 'basically', 'generally', 'specifically', 'particularly', 'especially', 'mainly', 'primarily', 'essentially', 'actually', 'really', 'truly', 'certainly', 'definitely', 'probably', 'possibly', 'likely', 'unlikely', 'perhaps', 'maybe', 'obviously', 'clearly', 'apparently', 'seemingly', 'supposedly', 'allegedly', 'reportedly', 'presumably', 'undoubtedly', 'certainly', 'definitely', 'absolutely', 'completely', 'entirely', 'totally', 'wholly', 'partially', 'slightly', 'somewhat', 'rather', 'quite', 'pretty', 'fairly', 'relatively', 'extremely', 'incredibly', 'remarkably', 'surprisingly', 'amazingly', 'unfortunately', 'fortunately', 'hopefully', 'thankfully', 'interestingly', 'importantly', 'significantly', 'notably', 'particularly', 'especially', 'mainly', 'primarily', 'basically', 'essentially', 'actually', 'really', 'truly', 'certainly', 'definitely', 'probably', 'possibly', 'likely', 'unlikely', 'perhaps', 'maybe', 'obviously', 'clearly', 'apparently', 'seemingly', 'supposedly', 'allegedly', 'reportedly', 'presumably', 'undoubtedly'];
    return stopWords.includes(word);
  }

  calculateWordSimilarity(words1, words2) {
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  displayRelatedPosts(relatedPosts) {
    const blogContainer = document.querySelector('#blog');
    if (!blogContainer) return;

    const relatedSection = document.createElement('div');
    relatedSection.className = 'related-posts-section';
    relatedSection.innerHTML = `
      <div class="related-posts-header">
        <h3 class="text-2xl font-bold mb-6 text-white">📚 Related Articles</h3>
      </div>
      <div class="related-posts-grid">
        ${relatedPosts.map(post => this.createRelatedPostCard(post)).join('')}
      </div>
    `;

    blogContainer.appendChild(relatedSection);
  }

  createRelatedPostCard(post) {
    const createdAt = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Unknown date";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    const snippet = plainText.substring(0, 120);
    const animals = ['🐱', '🐶', '🦊', '🐻', '🐯', '🦁', '🐵', '🐰', '🐼', '🐸', '🦋', '🐺', '🐨', '🦘', '🦔'];
    const animalEmoji = animals[Math.floor(Math.random() * animals.length)];

    return `
      <div class="related-post-card">
        <div class="related-post-emoji">${animalEmoji}</div>
        <div class="related-post-content">
          <div class="related-post-meta">
            <span class="related-post-category">${post.category}</span>
            <span class="related-post-date">${createdAt}</span>
          </div>
          <h4 class="related-post-title">
            <a href="blog.html?id=${post.id}">${post.title}</a>
          </h4>
          <p class="related-post-snippet">${snippet}...</p>
          <div class="related-post-stats">
            <span class="likes">❤️ ${post.likes || 0}</span>
            <a href="blog.html?id=${post.id}" class="read-more">Read More →</a>
          </div>
        </div>
      </div>
    `;
  }
}

// Initialize related posts manager
document.addEventListener('DOMContentLoaded', () => {
  window.relatedPostsManager = new RelatedPostsManager();
});
