class DocumentChatApp {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.conversationHistory = [];
        this.isConnected = false;
        this.currentStreamingMessage = null;
        this.currentEditMessage = null;
        this.enableLiveEditPreview = true; // Enabled by default
        this.originalDocumentContent = null;
        this.selectedText = null;
        this.streamedEditContent = '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.connect();
    }
    
    initializeElements() {
        this.documentEditor = document.getElementById('documentEditor');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendChatBtn = document.getElementById('sendChat');
        this.clearChatBtn = document.getElementById('clearChat');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.aiCommentary = document.getElementById('aiCommentary');
        this.commentaryText = document.getElementById('commentaryText');
        this.editInstruction = document.getElementById('editInstruction');
        this.requestEditBtn = document.getElementById('requestEdit');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.livePreviewToggle = document.getElementById('livePreviewToggle');
    }
    
    setupEventListeners() {
        // Document editor events
        this.documentEditor.addEventListener('input', (e) => {
            this.handleDocumentChange();
        });
        
        // Chat events
        this.sendChatBtn.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        this.clearChatBtn.addEventListener('click', () => {
            this.clearChat();
        });
        
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
        
        // AI edit request
        this.requestEditBtn.addEventListener('click', () => {
            this.requestAIEdit();
        });
        
        this.editInstruction.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.requestAIEdit();
            }
        });
        
        // Live preview toggle
        this.livePreviewToggle.addEventListener('change', (e) => {
            this.enableLiveEditPreview = e.target.checked;
            console.log('Live preview:', this.enableLiveEditPreview ? 'enabled' : 'disabled');
        });
        
        // Set live preview toggle to checked by default
        this.livePreviewToggle.checked = this.enableLiveEditPreview;
    }
    
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected', 'Connected');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            this.updateConnectionStatus('disconnected', 'Disconnected');
            this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateConnectionStatus('disconnected', 'Connection Error');
        };
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.updateConnectionStatus('disconnected', `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, 2000 * this.reconnectAttempts);
        } else {
            this.updateConnectionStatus('disconnected', 'Connection Failed');
        }
    }
    
    updateConnectionStatus(status, text) {
        this.connectionStatus.textContent = text;
        this.connectionStatus.className = `connection-status ${status}`;
    }
    
    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'document-sync':
                this.documentEditor.value = data.content;
                break;
                
            case 'document-update':
                // Handle document updates from other clients
                if (data.senderId !== this.clientId) {
                    this.documentEditor.value = data.content;
                }
                break;
                
            case 'ai-commentary':
                this.showAICommentary(data.commentary);
                break;
                
            case 'ai-edit-stream-start':
                this.showTypingIndicator();
                this.startAIEditStreaming();
                break;
                
            case 'ai-edit-stream-chunk':
                this.handleAIEditChunk(data.chunk);
                break;
                
            case 'ai-edit-stream-complete':
                this.completeAIEditStreaming(data.editedContent);
                this.hideTypingIndicator();
                break;
                
            case 'ai-edit-error':
                this.addMessage('assistant', 'Sorry, I encountered an error while editing the document.');
                this.hideTypingIndicator();
                break;
                
            case 'error':
                console.error('Server error:', data.message);
                break;
        }
    }
    
    handleDocumentChange() {
        if (!this.isConnected) return;
        
        const content = this.documentEditor.value;
        const cursorPosition = this.documentEditor.selectionStart;
        const selection = {
            start: this.documentEditor.selectionStart,
            end: this.documentEditor.selectionEnd
        };
        
        this.sendWebSocketMessage({
            type: 'document-update',
            content,
            cursorPosition,
            selection
        });
    }
    
    async sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addMessage('user', message);
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Clear input
        this.chatInput.value = '';
        
        // Show typing indicator and start streaming message
        this.showTypingIndicator();
        this.currentStreamingMessage = this.addMessage('assistant', '', true);
        
        try {
            // Send HTTP request with streaming
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversationHistory: this.conversationHistory.slice(-10)
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Read the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                
                // Update the streaming message
                if (this.currentStreamingMessage) {
                    const contentSpan = this.currentStreamingMessage.querySelector('.content');
                    if (contentSpan) {
                        contentSpan.textContent = fullResponse;
                        this.scrollChatToBottom();
                    }
                }
            }
            
            // Complete the streaming message
            if (this.currentStreamingMessage) {
                this.currentStreamingMessage.classList.remove('streaming');
                this.conversationHistory.push({ role: 'assistant', content: fullResponse });
            }
            
        } catch (error) {
            console.error('Error sending chat message:', error);
            this.addMessage('assistant', 'Sorry, I encountered an error processing your message.');
        } finally {
            this.hideTypingIndicator();
            this.currentStreamingMessage = null;
        }
    }
    
    requestAIEdit() {
        const instruction = this.editInstruction.value.trim();
        if (!instruction || !this.isConnected) return;
        
        const selectedText = this.getSelectedText();
        const documentContext = this.documentEditor.value;
        
        // Clear instruction input
        this.editInstruction.value = '';
        
        // Show that AI is working
        this.showTypingIndicator();
        this.addMessage('assistant', `🔄 Editing document based on: "${instruction}"`);
        
        // Send edit request
        this.sendWebSocketMessage({
            type: 'ai-document-edit-request',
            instruction,
            selectedText,
            documentContext
        });
    }
    
    getSelectedText() {
        const start = this.documentEditor.selectionStart;
        const end = this.documentEditor.selectionEnd;
        return this.documentEditor.value.substring(start, end);
    }
    
    startAIEditStreaming() {
        // Store the original document state for streaming
        this.originalDocumentContent = this.documentEditor.value;
        this.selectedText = this.getSelectedText();
        this.selectionStart = this.documentEditor.selectionStart;
        this.selectionEnd = this.documentEditor.selectionEnd;
        this.streamedEditContent = '';
        
        // Create a preview message for the streaming edit
        this.currentEditMessage = this.addMessage('assistant', '🔄 Streaming edit...', true);
    }
    
    handleAIEditChunk(chunk) {
        this.streamedEditContent += chunk;
        
        // Update the preview message with current content
        if (this.currentEditMessage) {
            const contentSpan = this.currentEditMessage.querySelector('.content');
            if (contentSpan) {
                contentSpan.textContent = `🔄 Streaming edit: "${this.streamedEditContent.substring(0, 100)}${this.streamedEditContent.length > 100 ? '...' : ''}"`;
            }
        }
        
        // Optionally show live preview in document (can be toggled)
        if (this.enableLiveEditPreview) {
            this.showLiveEditPreview();
        }
    }
    
    showLiveEditPreview() {
        if (this.selectedText) {
            // Replace selected text with streamed content
            const currentValue = this.originalDocumentContent;
            const previewContent = currentValue.substring(0, this.selectionStart) + 
                                 this.streamedEditContent + 
                                 currentValue.substring(this.selectionEnd);
            this.documentEditor.value = previewContent;
        } else {
            // Replace entire document
            this.documentEditor.value = this.streamedEditContent;
        }
    }
    
    completeAIEditStreaming(editedContent) {
        // Apply the final edited content
        if (this.selectedText) {
            // Replace selected text
            const currentValue = this.originalDocumentContent;
            this.documentEditor.value = currentValue.substring(0, this.selectionStart) + 
                                       editedContent + 
                                       currentValue.substring(this.selectionEnd);
        } else {
            // Replace entire document
            this.documentEditor.value = editedContent;
        }
        
        // Update the message to show completion
        if (this.currentEditMessage) {
            this.currentEditMessage.classList.remove('streaming');
            const contentSpan = this.currentEditMessage.querySelector('.content');
            if (contentSpan) {
                contentSpan.textContent = '✅ Document edited successfully!';
            }
        }
        
        // Trigger document update via WebSocket
        this.handleDocumentChange();
        
        // Clean up
        this.currentEditMessage = null;
        this.originalDocumentContent = null;
        this.selectedText = null;
        this.streamedEditContent = '';
    }
    
    addMessage(sender, content, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}${isStreaming ? ' streaming' : ''}`;
        
        const senderLabel = sender === 'user' ? 'You' : 'AI Assistant';
        messageDiv.innerHTML = `
            <strong>${senderLabel}:</strong> 
            <span class="content">${content}</span>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollChatToBottom();
        
        return messageDiv;
    }
    
    showAICommentary(commentary) {
        this.commentaryText.textContent = commentary;
        this.aiCommentary.classList.add('show');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.aiCommentary.classList.remove('show');
        }, 10000);
    }
    
    showTypingIndicator() {
        this.typingIndicator.classList.add('show');
    }
    
    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }
    
    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message assistant">
                <strong>AI Assistant:</strong> Chat cleared! I'm here to help with your document.
            </div>
        `;
        this.conversationHistory = [];
    }
    
    scrollChatToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    sendWebSocketMessage(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DocumentChatApp();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app && window.app.ws) {
        window.app.ws.close();
    }
});
