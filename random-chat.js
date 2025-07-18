// Random Stranger Chat System with Gemini AI Integration
class RandomChatManager {
  constructor() {
    this.chatId = null;
    this.isConnected = false;
    this.currentPartner = null;
    this.messageQueue = [];
    this.isAIChat = false;
    this.matchingTimeout = null;
    this.geminiApiKey = 'AIzaSyA2mpkbo__-7ucKrOPtGiF4KxqKyZ2AD4c'; // Replace with your actual Gemini API key
    this.userPreferences = this.loadUserPreferences();
    this.conversationHistory = [];
    this.initializeChat();
  }

  loadUserPreferences() {
    return JSON.parse(localStorage.getItem('chatPreferences') || '{}');
  }

  saveUserPreferences(preferences) {
    localStorage.setItem('chatPreferences', JSON.stringify(preferences));
    this.userPreferences = preferences;
  }

  initializeChat() {
    this.createChatButton();
    this.createChatModal();
    this.setupEventListeners();
  }

  createChatButton() {
    const chatButton = document.createElement('button');
    chatButton.className = 'random-chat-button';
    chatButton.innerHTML = `
      <div class="chat-button-inner">
        <span class="chat-icon">💬</span>
        <span class="chat-text">Random Chat</span>
      </div>
    `;
    
    chatButton.addEventListener('click', () => this.openChat());
    
    // Check if mobile view
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Always create floating button on mobile
      chatButton.classList.add('floating-chat-button');
      document.body.appendChild(chatButton);
      console.log('✅ Random chat button added as floating button (mobile)');
    } else {
      // Add to header on desktop
      const header = document.querySelector('header .header-content');
      if (header) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'chat-button-wrapper';
        buttonWrapper.appendChild(chatButton);
        header.appendChild(buttonWrapper);
        console.log('✅ Random chat button added to header (desktop)');
      } else {
        // Fallback to floating button
        chatButton.classList.add('floating-chat-button');
        document.body.appendChild(chatButton);
        console.log('⚠️ Header not found, created floating button');
      }
    }
  }

  createChatModal() {
    const chatModal = document.createElement('div');
    chatModal.className = 'random-chat-modal';
    chatModal.innerHTML = `
      <div class="chat-modal-content">
          <div class="chat-header">
            <div class="chat-status">
              <span class="status-indicator offline"></span>
              <span class="status-text">Disconnected</span>
            </div>
            <div class="chat-controls">
              <button class="new-chat-btn" onclick="randomChat.findNewPartner()">
                <span>🔄</span> New Chat
              </button>
              <button class="report-btn" onclick="randomChat.reportUser()" title="Report User">
                <span>🚫</span>
              </button>
              <button class="history-btn" onclick="randomChat.showChatHistory()" title="Chat History">
                <span>📜</span>
              </button>
              <button class="close-chat-btn" onclick="randomChat.closeChat()">
                <span>✕</span>
              </button>
            </div>
          </div>        <div class="chat-messages" id="chatMessages">
          <div class="welcome-message">
            <div class="welcome-content">
              <h3>🎭 Random Stranger Chat</h3>
              <p>Connect with random visitors or chat with our AI assistant!</p>
              <div class="preferences-section">
                <h4>Set Your Chat Preferences:</h4>
                <div class="preference-group">
                  <label>Topics you're interested in:</label>
                  <div class="topic-tags">
                    <span class="topic-tag" data-topic="technology">Technology</span>
                    <span class="topic-tag" data-topic="books">Books</span>
                    <span class="topic-tag" data-topic="travel">Travel</span>
                    <span class="topic-tag" data-topic="music">Music</span>
                    <span class="topic-tag" data-topic="movies">Movies</span>
                    <span class="topic-tag" data-topic="sports">Sports</span>
                    <span class="topic-tag" data-topic="food">Food</span>
                    <span class="topic-tag" data-topic="art">Art</span>
                  </div>
                </div>
                <div class="preference-group">
                  <label>Chat style preference:</label>
                  <select id="chatStyle">
                    <option value="casual">Casual & Friendly</option>
                    <option value="intellectual">Intellectual & Deep</option>
                    <option value="humorous">Humorous & Fun</option>
                    <option value="supportive">Supportive & Caring</option>
                  </select>
                </div>
              </div>
              <p class="chat-rules">
                <strong>How it works:</strong><br>
                • We'll try to find a human chat partner first<br>
                • If no match in 15 seconds, we'll offer AI chat<br>
                • AI chat adapts to your preferences above<br>
                • Be respectful and have fun!
              </p>
              <button class="start-chat-btn" onclick="randomChat.startChat()">
                Start Chatting
              </button>
            </div>
          </div>
        </div>
        
        <div class="chat-input-container">
          <div class="typing-indicator" id="typingIndicator">
            <span class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span class="typing-text">Stranger is typing...</span>
          </div>
          <div class="chat-input-wrapper">
            <input type="text" id="chatInput" placeholder="Type your message..." disabled>
            <button id="sendButton" onclick="randomChat.sendMessage()" disabled>
              <span>📤</span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatModal);
    this.chatModal = chatModal;
  }

  setupEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Typing indicator
    let typingTimer;
    chatInput.addEventListener('input', () => {
      if (this.isConnected) {
        this.sendTypingIndicator(true);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          this.sendTypingIndicator(false);
        }, 1000);
      }
    });

    // Close modal when clicking outside
    this.chatModal.addEventListener('click', (e) => {
      if (e.target === this.chatModal) {
        this.closeChat();
      }
    });

    // Setup preference selection
    this.setupPreferenceSelection();
  }

  setupPreferenceSelection() {
    // Topic tags selection
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('topic-tag')) {
        e.target.classList.toggle('selected');
        this.updatePreferences();
      }
    });

    // Chat style selection
    document.addEventListener('change', (e) => {
      if (e.target.id === 'chatStyle') {
        this.updatePreferences();
      }
    });

    // Load existing preferences
    this.loadPreferencesUI();
  }

  loadPreferencesUI() {
    // Load selected topics
    if (this.userPreferences.topics) {
      this.userPreferences.topics.forEach(topic => {
        const topicElement = document.querySelector(`[data-topic="${topic}"]`);
        if (topicElement) {
          topicElement.classList.add('selected');
        }
      });
    }

    // Load chat style
    if (this.userPreferences.style) {
      const styleSelect = document.getElementById('chatStyle');
      if (styleSelect) {
        styleSelect.value = this.userPreferences.style;
      }
    }
  }

  updatePreferences() {
    const selectedTopics = Array.from(document.querySelectorAll('.topic-tag.selected'))
      .map(tag => tag.dataset.topic);
    
    const chatStyle = document.getElementById('chatStyle')?.value || 'casual';

    this.saveUserPreferences({
      topics: selectedTopics,
      style: chatStyle
    });
  }

  openChat() {
    this.chatModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeChat() {
    this.chatModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    this.disconnect();
  }

  startChat() {
    this.updateStatus('connecting', 'Looking for a human chat partner...');
    this.clearMessages();
    this.isAIChat = false;
    this.conversationHistory = [];
    
    // Try to find human partner first
    this.matchingTimeout = setTimeout(() => {
      this.offerAIChat();
    }, 15000); // 15 seconds timeout
    
    // Simulate looking for human partner
    setTimeout(() => {
      // For demo purposes, we'll simulate no human match found
      // In real implementation, this would check for actual human users
      if (Math.random() < 0.1) { // 10% chance of finding human
        this.simulateHumanConnection();
      }
    }, 2000);
  }

  simulateHumanConnection() {
    if (this.matchingTimeout) {
      clearTimeout(this.matchingTimeout);
      this.matchingTimeout = null;
    }
    
    this.isConnected = true;
    this.isAIChat = false;
    this.currentPartner = {
      id: 'human_' + Math.random().toString(36).substr(2, 9),
      name: 'Human User',
      type: 'human'
    };
    
    this.updateStatus('connected', 'Connected to a human user');
    this.enableChatInput();
    this.addSystemMessage('Connected to a human user! Say hello!');
    
    // Start human chat simulation
    this.simulateHumanBehavior();
  }

  offerAIChat() {
    if (this.matchingTimeout) {
      clearTimeout(this.matchingTimeout);
      this.matchingTimeout = null;
    }
    
    this.addSystemMessage('No human users available right now. Would you like to chat with our AI assistant instead?');
    
    const aiOfferEl = document.createElement('div');
    aiOfferEl.className = 'ai-offer';
    aiOfferEl.innerHTML = `
      <div class="ai-offer-content">
        <p>🤖 Our AI assistant is trained to chat based on your preferences!</p>
        <div class="ai-offer-buttons">
          <button class="accept-ai-btn" onclick="randomChat.startAIChat()">
            Chat with AI
          </button>
          <button class="decline-ai-btn" onclick="randomChat.cancelChat()">
            Try Again Later
          </button>
        </div>
      </div>
    `;
    
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.appendChild(aiOfferEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  startAIChat() {
    this.isConnected = true;
    this.isAIChat = true;
    this.currentPartner = {
      id: 'ai_assistant',
      name: 'AI Assistant',
      type: 'ai'
    };
    
    this.updateStatus('connected', 'Connected to AI Assistant');
    this.enableChatInput();
    
    // Remove the AI offer
    const aiOffer = document.querySelector('.ai-offer');
    if (aiOffer) {
      aiOffer.remove();
    }
    
    this.addSystemMessage('Connected to AI Assistant! Chat adapted to your preferences.');
    
    // Start AI conversation
    this.startAIConversation();
  }

  cancelChat() {
    this.updateStatus('offline', 'Disconnected');
    this.addSystemMessage('Chat cancelled. Click "Start Chatting" to try again.');
    
    // Remove the AI offer
    const aiOffer = document.querySelector('.ai-offer');
    if (aiOffer) {
      aiOffer.remove();
    }
  }

  async startAIConversation() {
    try {
      // Test API connection first
      console.log('Testing Gemini API connection...');
      
      // Simple test request
      const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a connection test. Please respond with a friendly greeting.'
            }]
          }]
        })
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('API connection test failed:', testResponse.status, errorText);
        throw new Error(`API connection failed: ${testResponse.status}`);
      }
      
      const testData = await testResponse.json();
      console.log('API connection test successful:', testData);
      
      // Now generate the actual greeting
      const greeting = await this.generateAIResponse("Hello! I'm ready to chat with you based on your preferences. What would you like to talk about?", true);
      
      setTimeout(() => {
        this.receiveMessage(greeting);
      }, 1000);
    } catch (error) {
      console.error('Error starting AI conversation:', error);
      setTimeout(() => {
        this.receiveMessage("Hello! I'm your AI assistant. I'm ready to chat with you! What would you like to talk about?");
      }, 1000);
    }
  }

  simulateHumanBehavior() {
    const greetings = [
      "Hello! How are you doing today?",
      "Hi there! What brings you to this blog?",
      "Hey! Nice to meet you. What's your favorite topic here?",
      "Hello! I'm also browsing this blog. Pretty interesting stuff!",
      "Hi! What do you think about this website?",
      "Hey there! Are you enjoying the content here?",
      "Hello! Do you come here often?",
      "Hi! What's your favorite article on this blog?",
      "Greetings! I'm new here, any recommendations?",
      "Hello! This blog has some great content, don't you think?"
    ];
    
    const topics = [
      "Have you read any good books lately?",
      "What's your favorite programming language?",
      "Are you into technology or more of a creative person?",
      "What brings you joy in life?",
      "Do you have any hobbies you're passionate about?",
      "What's the most interesting thing you've learned recently?",
      "Are you a morning person or night owl?",
      "What's your go-to productivity tip?",
      "Do you enjoy traveling? Where's your favorite place?",
      "What's your opinion on remote work vs office work?"
    ];
    
    // Send initial greeting
    setTimeout(() => {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      this.receiveMessage(randomGreeting);
      
      // Sometimes ask a follow-up question
      if (Math.random() < 0.7) {
        setTimeout(() => {
          const randomTopic = topics[Math.floor(Math.random() * topics.length)];
          this.receiveMessage(randomTopic);
        }, 3000 + Math.random() * 4000);
      }
    }, 1000 + Math.random() * 2000);
  }

  async generateAIResponse(userMessage, isGreeting = false) {
    try {
      // Build context based on user preferences
      const preferences = this.userPreferences;
      const topics = preferences.topics || [];
      const style = preferences.style || 'casual';
      
      let systemPrompt = `You are a friendly chat assistant. Chat in a ${style} style. `;
      
      if (topics.length > 0) {
        systemPrompt += `The user is interested in: ${topics.join(', ')}. `;
      }
      
      systemPrompt += `Keep responses conversational, engaging, and under 100 words. `;
      systemPrompt += `Ask questions to keep the conversation flowing. `;
      systemPrompt += `Be helpful and show genuine interest in the conversation.`;
      
      if (isGreeting) {
        systemPrompt += ` This is your first message, so introduce yourself and ask about their interests.`;
      }
      
      console.log('Sending request to Gemini API...');
      console.log('API Key:', this.geminiApiKey.substring(0, 20) + '...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 200,
        }
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API request failed:', response.status, response.statusText, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response:', JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const aiResponse = data.candidates[0].content.parts[0].text.trim();
        
        // Update conversation history
        this.conversationHistory.push(`User: ${userMessage}`);
        this.conversationHistory.push(`Assistant: ${aiResponse}`);
        
        // Keep only last 10 exchanges
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        console.log('AI Response:', aiResponse);
        return aiResponse;
      } else {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid response from Gemini API');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  getFallbackResponse(userMessage) {
    const fallbackResponses = [
      "That's really interesting! Tell me more about that.",
      "I'd love to hear your thoughts on that topic.",
      "That sounds fascinating! What got you interested in that?",
      "Thanks for sharing that with me. What else would you like to discuss?",
      "I appreciate you telling me about that. What's been on your mind lately?",
      "That's a great perspective! I enjoy learning about different viewpoints.",
      "Interesting! What's your favorite thing about that?",
      "I can see why that would be important to you. Tell me more!",
      "That's really cool! How did you get into that?",
      "I'm curious to know more about your experience with that."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  findNewPartner() {
    if (this.isConnected) {
      this.addSystemMessage('Disconnected from current partner. Looking for a new one...');
    }
    this.disconnect();
    this.startChat();
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message && this.isConnected) {
      this.addMessage(message, 'sent');
      this.addMessageToQueue(message, 'sent');
      this.trackChatSession();
      input.value = '';
      
      if (this.isAIChat) {
        // AI response
        this.showTypingIndicator(true);
        
        try {
          const aiResponse = await this.generateAIResponse(message);
          
          // Simulate realistic typing delay
          const typingDelay = Math.min(aiResponse.length * 50, 4000) + Math.random() * 2000;
          
          setTimeout(() => {
            this.showTypingIndicator(false);
            this.receiveMessage(aiResponse);
          }, typingDelay);
        } catch (error) {
          setTimeout(() => {
            this.showTypingIndicator(false);
            this.receiveMessage("I'm having trouble processing that right now. Could you try rephrasing?");
          }, 2000);
        }
      } else {
        // Human response simulation
        setTimeout(() => {
          this.simulateHumanResponse(message);
        }, 500 + Math.random() * 2000);
      }
    }
  }

  simulateHumanResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Contextual responses based on user message
    let responses = [];
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      responses = [
        "Hey there! Great to meet you!",
        "Hello! How's your day going?",
        "Hi! Nice to chat with you!",
        "Hey! Thanks for saying hi!"
      ];
    } else if (message.includes('book') || message.includes('read')) {
      responses = [
        "I love reading too! What genre do you prefer?",
        "Books are amazing! Any recent favorites?",
        "That's cool! I'm always looking for book recommendations.",
        "Reading is such a great hobby! Fiction or non-fiction?"
      ];
    } else if (message.includes('programming') || message.includes('code') || message.includes('developer')) {
      responses = [
        "Programming is fascinating! What languages do you work with?",
        "Cool! Are you a professional developer or learning as a hobby?",
        "Nice! I find coding really rewarding. What's your favorite project?",
        "That's awesome! The tech world is always evolving."
      ];
    } else {
      // Generic responses for other messages
      responses = [
        "That's really interesting! Tell me more.",
        "I totally get what you mean!",
        "That's a great perspective!",
        "I never thought about it that way.",
        "That's so cool! Thanks for sharing.",
        "I can relate to that experience.",
        "That's fascinating! What made you think of that?",
        "You make a good point there.",
        "That's awesome! I'd love to hear more.",
        "Interesting take! What's your opinion on that?"
      ];
    }
    
    // Sometimes simulate partner leaving (3% chance)
    if (Math.random() < 0.03) {
      const farewells = [
        "It was great chatting with you! Have to go now.",
        "Really enjoyed our conversation! Talk to you later!",
        "Thanks for the chat! Hope you have a great day!",
        "This was fun! Catch you later!",
        "Nice talking to you! Take care!"
      ];
      
      const randomFarewell = farewells[Math.floor(Math.random() * farewells.length)];
      this.receiveMessage(randomFarewell);
      
      setTimeout(() => {
        this.addSystemMessage('Your chat partner disconnected.');
        this.disconnect();
      }, 2000);
      return;
    }
    
    // Show typing indicator
    this.showTypingIndicator(true);
    
    // Simulate natural typing delay
    const typingDelay = Math.min(userMessage.length * 50, 3000) + Math.random() * 2000;
    
    setTimeout(() => {
      this.showTypingIndicator(false);
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      this.receiveMessage(randomResponse);
    }, typingDelay);
  }

  receiveMessage(message) {
    this.addMessage(message, 'received');
    this.addMessageToQueue(message, 'received');
  }

  addMessage(message, type) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
      <div class="message-content">
        <div class="message-text">${this.escapeHtml(message)}</div>
        <div class="message-time">${timestamp}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addSystemMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.innerHTML = `
      <div class="system-content">
        <span class="system-icon">ℹ️</span>
        <span class="system-text">${this.escapeHtml(message)}</span>
      </div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator(show) {
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = show ? 'flex' : 'none';
  }

  sendTypingIndicator(isTyping) {
    // In a real implementation, this would send to the server
    // For simulation, we don't need to do anything
  }

  updateStatus(status, text) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
  }

  enableChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
  }

  disableChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.disabled = true;
    sendButton.disabled = true;
  }

  clearMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Analytics and additional features
  trackChatSession() {
    if (window.statsManager) {
      // Track chat usage
      const chatStats = JSON.parse(localStorage.getItem('chatStats') || '{}');
      chatStats.totalSessions = (chatStats.totalSessions || 0) + 1;
      chatStats.lastSession = new Date().toISOString();
      chatStats.totalMessages = (chatStats.totalMessages || 0) + 1;
      localStorage.setItem('chatStats', JSON.stringify(chatStats));
    }
  }

  // Save chat history
  saveChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const currentChat = {
      id: Date.now(),
      startTime: new Date().toISOString(),
      messages: this.messageQueue,
      partnerId: this.currentPartner?.id || 'unknown'
    };
    
    chatHistory.push(currentChat);
    
    // Keep only last 10 conversations
    if (chatHistory.length > 10) {
      chatHistory.shift();
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }

  // Add message to queue for history
  addMessageToQueue(message, type) {
    this.messageQueue.push({
      message: message,
      type: type,
      timestamp: new Date().toISOString()
    });
  }

  // Report user (placeholder for moderation)
  reportUser() {
    if (confirm('Are you sure you want to report this user for inappropriate behavior?')) {
      this.addSystemMessage('User reported. Thank you for helping keep our community safe.');
      this.disconnect();
    }
  }

  // Block user (placeholder)
  blockUser() {
    if (confirm('Are you sure you want to block this user?')) {
      this.addSystemMessage('User blocked. You will not be matched with them again.');
      this.disconnect();
    }
  }

  // Enhanced disconnect with history saving
  disconnect() {
    if (this.matchingTimeout) {
      clearTimeout(this.matchingTimeout);
      this.matchingTimeout = null;
    }
    
    if (this.isConnected && this.messageQueue.length > 0) {
      this.saveChatHistory();
    }
    
    this.isConnected = false;
    this.isAIChat = false;
    this.currentPartner = null;
    this.messageQueue = [];
    this.conversationHistory = [];
    this.updateStatus('offline', 'Disconnected');
    this.disableChatInput();
    this.showTypingIndicator(false);
    
    // Remove any AI offer elements
    const aiOffer = document.querySelector('.ai-offer');
    if (aiOffer) {
      aiOffer.remove();
    }
  }

  // Get chat statistics
  getChatStats() {
    return JSON.parse(localStorage.getItem('chatStats') || '{}');
  }

  // Get chat history
  getChatHistory() {
    return JSON.parse(localStorage.getItem('chatHistory') || '[]');
  }

  // Show chat history modal
  showChatHistory() {
    const history = this.getChatHistory();
    const stats = this.getChatStats();
    
    const historyModal = document.createElement('div');
    historyModal.className = 'chat-history-modal';
    historyModal.innerHTML = `
      <div class="history-modal-content">
        <div class="history-header">
          <h3>Chat History & Statistics</h3>
          <button onclick="this.closest('.chat-history-modal').remove()">✕</button>
        </div>
        <div class="history-stats">
          <div class="stat-item">
            <span class="stat-label">Total Sessions:</span>
            <span class="stat-value">${stats.totalSessions || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Messages:</span>
            <span class="stat-value">${stats.totalMessages || 0}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Session:</span>
            <span class="stat-value">${stats.lastSession ? new Date(stats.lastSession).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
        <div class="history-content">
          <h4>Recent Conversations</h4>
          ${history.length === 0 ? '<p class="no-history">No chat history yet.</p>' : 
            history.slice(-5).reverse().map(chat => `
              <div class="history-item">
                <div class="history-item-header">
                  <span class="history-date">${new Date(chat.startTime).toLocaleString()}</span>
                  <span class="history-messages">${chat.messages.length} messages</span>
                </div>
                <div class="history-preview">
                  ${chat.messages.slice(0, 3).map(msg => `
                    <div class="preview-message ${msg.type}">
                      ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
        </div>
        <div class="history-actions">
          <button onclick="randomChat.clearChatHistory(); this.closest('.chat-history-modal').remove();">
            Clear History
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(historyModal);
    
    // Close on background click
    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        historyModal.remove();
      }
    });
  }

  // Clear chat history
  clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('chatStats');
      this.addSystemMessage('Chat history cleared.');
    }
  }
}

// Initialize random chat
document.addEventListener('DOMContentLoaded', () => {
  window.randomChat = new RandomChatManager();
});
