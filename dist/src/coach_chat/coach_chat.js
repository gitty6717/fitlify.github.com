// FITLIFY AI Coach Chat JavaScript
class AICoachChat {
    constructor() {
        this.conversations = [];
        this.currentConversation = [];
        this.isTyping = false;
        this.userId = null;
        
        this.init();
    }
    
    init() {
        this.loadUserId();
        this.setupEventListeners();
        this.loadConversationHistory();
        this.autoResizeTextarea();
    }
    
    loadUserId() {
        this.userId = localStorage.getItem('fitlify_user_id') || 'demo_user';
    }
    
    setupEventListeners() {
        // Message input
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        messageInput.addEventListener('input', () => {
            this.updateSendButton();
            this.autoResizeTextarea();
        });
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Quick question buttons
        const questionBtns = document.querySelectorAll('.question-btn');
        questionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                messageInput.value = question;
                this.sendMessage();
            });
        });
        
        // Action buttons
        document.getElementById('voice-button').addEventListener('click', () => {
            this.openVoiceModal();
        });
        
        document.getElementById('attach-button').addEventListener('click', () => {
            this.handleFileAttachment();
        });
        
        document.getElementById('clear-button').addEventListener('click', () => {
            this.clearChat();
        });
        
        // New chat button
        document.getElementById('new-chat').addEventListener('click', () => {
            this.startNewChat();
        });
        
        // History items
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                this.loadConversation(item);
            });
        });
        
        // Modal setup
        this.setupModals();
    }
    
    autoResizeTextarea() {
        const textarea = document.getElementById('message-input');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateSendButton() {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        sendButton.disabled = !messageInput.value.trim();
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        messageInput.value = '';
        this.updateSendButton();
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to AI coach
            const response = await this.sendToAI(message);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'ai');
            
            // Save conversation
            this.saveConversation();
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }
    
    async sendToAI(message) {
        const response = await fetch('../src/backend/api/coach/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: this.userId,
                question: message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.response;
        } else {
            throw new Error(data.message || 'Failed to get response');
        }
    }
    
    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        const quickQuestions = messagesContainer.querySelector('.quick-questions');
        
        // Hide welcome elements after first message
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        if (quickQuestions) {
            quickQuestions.style.display = 'none';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${this.formatMessage(content)}</p>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to current conversation
        this.currentConversation.push({
            content,
            sender,
            timestamp: new Date().toISOString()
        });
        
        // Add rating option for AI messages
        if (sender === 'ai') {
            this.addRatingOption(messageElement);
        }
    }
    
    formatMessage(content) {
        // Convert URLs to links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');
        
        // Bold text between *asterisks*
        content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        
        return content;
    }
    
    addRatingOption(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'message-rating';
        ratingDiv.innerHTML = `
            <div class="rating-prompt">Was this helpful?</div>
            <div class="rating-buttons">
                <button class="rating-btn positive" data-rating="yes">👍</button>
                <button class="rating-btn negative" data-rating="no">👎</button>
            </div>
        `;
        
        messageContent.appendChild(ratingDiv);
        
        // Add rating listeners
        const ratingBtns = ratingDiv.querySelectorAll('.rating-btn');
        ratingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rateResponse(btn.dataset.rating);
                ratingDiv.style.display = 'none';
            });
        });
    }
    
    rateResponse(rating) {
        // Save rating (in a real implementation, this would be sent to backend)
        console.log(`Response rated: ${rating}`);
        this.showNotification('Thank you for your feedback!');
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.isTyping = true;
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }
    
    showTypingIndicator() {
        if (this.isTyping) return;
        
        const messagesContainer = document.getElementById('chat-messages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.isTyping = true;
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }
    
    setupModals() {
        // Voice modal
        const voiceModal = document.getElementById('voice-modal');
        const voiceCloseBtns = voiceModal.querySelectorAll('.modal-close');
        const voiceRecordBtn = document.getElementById('voice-record-btn');
        
        voiceCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                voiceModal.classList.remove('active');
                this.stopVoiceRecording();
            });
        });
        
        voiceModal.addEventListener('click', (e) => {
            if (e.target === voiceModal) {
                voiceModal.classList.remove('active');
                this.stopVoiceRecording();
            }
        });
        
        voiceRecordBtn.addEventListener('click', () => {
            if (voiceRecordBtn.classList.contains('recording')) {
                this.stopVoiceRecording();
            } else {
                this.startVoiceRecording();
            }
        });
        
        // Rating modal
        const ratingModal = document.getElementById('rating-modal');
        const ratingCloseBtns = ratingModal.querySelectorAll('.modal-close');
        const ratingStars = document.querySelectorAll('.star');
        const submitRatingBtn = document.getElementById('submit-rating');
        
        ratingCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ratingModal.classList.remove('active');
            });
        });
        
        ratingModal.addEventListener('click', (e) => {
            if (e.target === ratingModal) {
                ratingModal.classList.remove('active');
            }
        });
        
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });
        });
        
        submitRatingBtn.addEventListener('click', () => {
            this.submitRating();
        });
    }
    
    openVoiceModal() {
        const voiceModal = document.getElementById('voice-modal');
        voiceModal.classList.add('active');
    }
    
    startVoiceRecording() {
        const voiceRecordBtn = document.getElementById('voice-record-btn');
        const voiceStatus = document.getElementById('voice-status');
        const voiceAnimation = document.getElementById('voice-animation');
        
        voiceRecordBtn.classList.add('recording');
        voiceRecordBtn.querySelector('.record-text').textContent = 'Stop Recording';
        voiceStatus.textContent = 'Recording... Speak clearly';
        voiceAnimation.classList.add('recording');
        
        // In a real implementation, this would start actual voice recording
        console.log('Voice recording started');
        
        // Auto-stop after 30 seconds
        setTimeout(() => {
            if (voiceRecordBtn.classList.contains('recording')) {
                this.stopVoiceRecording();
            }
        }, 30000);
    }
    
    stopVoiceRecording() {
        const voiceRecordBtn = document.getElementById('voice-record-btn');
        const voiceStatus = document.getElementById('voice-status');
        const voiceAnimation = document.getElementById('voice-animation');
        const voiceModal = document.getElementById('voice-modal');
        
        if (voiceRecordBtn.classList.contains('recording')) {
            voiceRecordBtn.classList.remove('recording');
            voiceRecordBtn.querySelector('.record-text').textContent = 'Start Recording';
            voiceStatus.textContent = 'Processing your voice...';
            voiceAnimation.classList.remove('recording');
            
            // Simulate voice processing
            setTimeout(() => {
                const messageInput = document.getElementById('message-input');
                messageInput.value = 'How can I improve my running endurance?'; // Simulated voice result
                voiceModal.classList.remove('active');
                this.sendMessage();
            }, 2000);
            
            console.log('Voice recording stopped');
        }
    }
    
    handleFileAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf,.doc,.docx';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
        
        input.click();
    }
    
    handleFile(file) {
        // In a real implementation, this would upload the file
        console.log('File attached:', file.name);
        this.showNotification(`File "${file.name}" attached successfully!`);
        
        // Add file message to chat
        const messageInput = document.getElementById('message-input');
        messageInput.value = `I've attached a file: ${file.name}`;
        this.sendMessage();
    }
    
    clearChat() {
        if (confirm('Are you sure you want to clear this conversation?')) {
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="message ai-message">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            <p>Hello! I'm your AI Fitness Coach. How can I help you today?</p>
                        </div>
                        <div class="message-time">Just now</div>
                    </div>
                </div>
                <div class="quick-questions">
                    <p class="quick-questions-label">Quick Questions:</p>
                    <div class="question-buttons">
                        <button class="question-btn" data-question="How do I perform a squat safely?">
                            🏋️ How to squat safely?
                        </button>
                        <button class="question-btn" data-question="How can I improve my endurance?">
                            🏃 Improve endurance
                        </button>
                        <button class="question-btn" data-question="What should I eat before a workout?">
                            🥗 Pre-workout nutrition
                        </button>
                        <button class="question-btn" data-question="How do I prevent muscle soreness?">
                            💪 Prevent soreness
                        </button>
                        <button class="question-btn" data-question="What's the best way to lose weight?">
                            ⚖️ Weight loss tips
                        </button>
                        <button class="question-btn" data-question="How often should I work out?">
                            📅 Workout frequency
                        </button>
                    </div>
                </div>
            `;
            
            // Re-attach quick question listeners
            const questionBtns = document.querySelectorAll('.question-btn');
            questionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const question = btn.dataset.question;
                    messageInput.value = question;
                    this.sendMessage();
                });
            });
            
            this.currentConversation = [];
            this.saveConversation();
        }
    }
    
    startNewChat() {
        this.saveConversation();
        this.currentConversation = [];
        this.clearChat();
    }
    
    loadConversationHistory() {
        // Load conversation history from localStorage
        const saved = localStorage.getItem(`coach_conversations_${this.userId}`);
        if (saved) {
            this.conversations = JSON.parse(saved);
            this.updateHistoryList();
        }
    }
    
    saveConversation() {
        if (this.currentConversation.length === 0) return;
        
        const conversation = {
            id: Date.now().toString(),
            messages: this.currentConversation,
            timestamp: new Date().toISOString(),
            title: this.generateConversationTitle()
        };
        
        // Add to conversations list
        this.conversations.unshift(conversation);
        
        // Keep only last 10 conversations
        if (this.conversations.length > 10) {
            this.conversations = this.conversations.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem(`coach_conversations_${this.userId}`, JSON.stringify(this.conversations));
        
        this.updateHistoryList();
    }
    
    generateConversationTitle() {
        if (this.currentConversation.length === 0) return 'New Conversation';
        
        const firstUserMessage = this.currentConversation.find(msg => msg.sender === 'user');
        if (firstUserMessage) {
            const title = firstUserMessage.content.substring(0, 50);
            return title.length < 50 ? title : title + '...';
        }
        
        return 'New Conversation';
    }
    
    updateHistoryList() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        historyList.innerHTML = this.conversations.map((conv, index) => {
            const isActive = index === 0;
            const time = this.formatTimeAgo(new Date(conv.timestamp));
            
            return `
                <div class="history-item ${isActive ? 'active' : ''}" data-conversation-id="${conv.id}">
                    <div class="history-title">${conv.title}</div>
                    <div class="history-time">${time}</div>
                    <div class="history-preview">${conv.messages[0]?.content || ''}</div>
                </div>
            `;
        }).join('');
        
        // Re-attach history listeners
        const historyItems = historyList.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                this.loadConversation(item);
            });
        });
    }
    
    loadConversation(historyItem) {
        const conversationId = historyItem.dataset.conversationId;
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        
        if (!conversation) return;
        
        // Update active state
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        historyItem.classList.add('active');
        
        // Load messages
        this.currentConversation = conversation.messages;
        this.displayMessages();
    }
    
    displayMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        
        // Clear existing messages (except welcome)
        const existingMessages = messagesContainer.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Hide welcome elements
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        const quickQuestions = messagesContainer.querySelector('.quick-questions');
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        if (quickQuestions) quickQuestions.style.display = 'none';
        
        // Display conversation messages
        this.currentConversation.forEach(msg => {
            this.addMessage(msg.content, msg.sender);
        });
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }
    
    setRating(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    submitRating() {
        const rating = document.querySelectorAll('.star.active').length;
        const feedback = document.getElementById('rating-feedback').value;
        
        // In a real implementation, this would be sent to backend
        console.log('Rating submitted:', rating, feedback);
        
        const ratingModal = document.getElementById('rating-modal');
        ratingModal.classList.remove('active');
        
        this.showNotification('Thank you for your feedback!');
        
        // Reset rating
        this.setRating(0);
        document.getElementById('rating-feedback').value = '';
    }
    
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = notification.querySelector('.notification-message');
        
        messageElement.textContent = message;
        notification.style.background = type === 'success' ? 'var(--success)' : 'var(--error)';
        
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
}

// Initialize the AI Coach Chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AICoachChat();
});
