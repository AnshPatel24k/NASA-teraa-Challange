// AI Q&A Assistant
class AIAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.quickButtons = document.querySelectorAll('.quick-btn');
        this.clearButton = document.getElementById('clear-chat');
        this.voiceButton = document.getElementById('voice-toggle');
        
        this.isTyping = false;
        this.voiceEnabled = false;
        
        this.knowledgeBase = {
            // Main causes and timeline
            'cause': [
                'what caused', 'why did', 'main cause', 'reason for', 'what happened'
            ],
            'timeline': [
                'when did', 'timeline', 'how long', 'what year', 'time period'
            ],
            'water_loss': [
                'how much water', 'water lost', 'volume', 'size', 'area'
            ],
            'human_impact': [
                'human impact', 'people affected', 'communities', 'health', 'population'
            ],
            'restoration': [
                'can it be restored', 'bring back', 'fix', 'recovery', 'solution'
            ],
            'global_cases': [
                'similar cases', 'other lakes', 'worldwide', 'global', 'other examples'
            ],
            'irrigation': [
                'irrigation', 'agriculture', 'cotton', 'farming', 'crops'
            ],
            'satellite': [
                'satellite', 'nasa', 'terra', 'modis', 'imagery', 'data'
            ]
        };
        
        this.responses = {
            'cause': `The Aral Sea disaster was primarily caused by massive Soviet irrigation projects starting in the 1960s. The Amu Darya and Syr Darya rivers, which fed the sea, were diverted to irrigate cotton and rice fields in the desert. This reduced the water inflow by 90%, causing the sea to gradually disappear.`,
            
            'timeline': `The disaster unfolded over several decades:
• 1960s: Soviet irrigation projects begin
• 1970s-1980s: Water levels start dropping noticeably  
• 1990s: Sea splits into smaller sections
• 2000s: Dramatic acceleration of shrinkage
• 2014: Eastern basin completely dried up
• 2025: Only 10% of original volume remains`,
            
            'water_loss': `The numbers are staggering:
• Original area: 68,000 km² (26,300 sq miles)
• Current area: ~7,000 km² (2,700 sq miles)  
• Volume lost: Over 90% of original water
• Water level drop: More than 20 meters (66 feet)
• This makes it one of the most severe environmental disasters in history.`,
            
            'human_impact': `The human consequences have been devastating:
• 60+ million people affected across the region
• Fishing industry collapsed (40,000+ jobs lost)
• Toxic salt storms causing respiratory diseases
• Climate became more extreme (hotter summers, colder winters)
• Millions displaced from coastal communities
• Economic losses in billions of dollars`,
            
            'restoration': `Restoration efforts are ongoing but challenging:
• North Aral Sea: Partial recovery thanks to the Kok-Aral Dam (Kazakhstan)
• South Aral Sea: Likely permanently lost due to continued irrigation
• Requires international cooperation and reduced water usage
• Some success with drought-resistant crops and efficient irrigation
• Complete restoration would need 20+ years and massive investment`,
            
            'global_cases': `Similar disasters are happening worldwide:
• Lake Chad (Africa): 90% shrinkage since 1960s
• Great Salt Lake (USA): Historic low levels
• Lake Urmia (Iran): 80% volume loss
• Dead Sea: Dropping 1 meter per year
• Colorado River: Record low reservoir levels
Climate change and human activity threaten many water bodies globally.`,
            
            'irrigation': `Cotton cultivation was the main driver:
• Soviet Union wanted to be cotton self-sufficient
• Massive irrigation canals built in 1960s
• Cotton production increased 5x, but at enormous environmental cost
• Poor irrigation efficiency wasted 60% of water
• Monoculture farming depleted soil quality`,
            
            'satellite': `NASA satellite data reveals the full scope:
• Terra/MODIS satellites provide continuous monitoring since 1999
• Landsat imagery shows changes from 1970s onwards
• Satellite data shows seasonal variations and long-term trends
• Color changes indicate increasing salinity and pollution
• This data helps scientists understand and predict similar disasters`
        };
        
        this.defaultResponse = `That's an interesting question! Based on NASA satellite data and environmental research, I can tell you about the Aral Sea's transformation from one of the world's largest lakes to mostly desert in just 50 years. 

Try asking about:
• The main causes of the disaster
• Timeline and key events  
• Water loss statistics
• Human and environmental impact
• Restoration possibilities
• Similar cases worldwide

What would you like to know more about?`;
        
        this.init();
    }
    
    init() {
        if (!this.chatInput) return;
        
        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.simulateUserMessage(question);
            });
        });
        
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => this.clearChat());
        }
        
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.toggleVoice());
        }
        
        // Auto-suggestions
        this.chatInput.addEventListener('input', () => this.showSuggestions());
    }
    
    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.respondToMessage(message);
    }
    
    simulateUserMessage(message) {
        this.addMessage(message, 'user');
        this.respondToMessage(message);
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = type === 'user' ? '👤' : '🌍';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (content.includes('•')) {
            // Format bullet points
            const lines = content.split('\n');
            let html = '';
            for (const line of lines) {
                if (line.trim().startsWith('•')) {
                    html += `<li>${line.trim().substring(1).trim()}</li>`;
                } else if (html.includes('<li>') && !line.trim()) {
                    html = `<ul>${html}</ul>`;
                } else {
                    if (html.includes('<li>')) {
                        html = `<ul>${html}</ul>`;
                    }
                    html += `<p>${line}</p>`;
                }
            }
            if (html.includes('<li>')) {
                html = html.replace(/<li>/g, '<li>').replace(/<\/li>/g, '</li>');
                html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
            }
            contentDiv.innerHTML = html;
        } else {
            contentDiv.innerHTML = content.replace(/\n/g, '<br>');
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    respondToMessage(message) {
        this.showTypingIndicator();
        
        // Simulate thinking time
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const response = this.generateResponse(message.toLowerCase());
            this.addMessage(response, 'ai');
            
            // Speak response if voice is enabled
            if (this.voiceEnabled) {
                this.speak(response);
            }
        }, Math.random() * 2000 + 1000); // 1-3 second delay
    }
    
    generateResponse(message) {
        // Find matching category
        for (const [category, keywords] of Object.entries(this.knowledgeBase)) {
            for (const keyword of keywords) {
                if (message.includes(keyword)) {
                    return this.responses[category];
                }
            }
        }
        
        return this.defaultResponse;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-message';
        typingDiv.innerHTML = `
            <div class="message-avatar">🌍</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span>Dr. Terra is thinking</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingMessage = this.chatMessages.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
        
        this.isTyping = false;
        this.sendButton.disabled = false;
    }
    
    clearChat() {
        // Keep only the initial AI message
        const messages = this.chatMessages.querySelectorAll('.message');
        for (let i = 1; i < messages.length; i++) {
            messages[i].remove();
        }
    }
    
    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.voiceButton.textContent = this.voiceEnabled ? '🔇 Voice Off' : '🎤 Voice';
        this.voiceButton.style.background = this.voiceEnabled ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255,255,255,0.2)';
    }
    
    speak(text) {
        if ('speechSynthesis' in window) {
            // Remove bullet points and formatting for speech
            const cleanText = text.replace(/•/g, '').replace(/\n/g, ' ').replace(/<[^>]*>/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }
    
    showSuggestions() {
        const input = this.chatInput.value.toLowerCase();
        const suggestions = document.getElementById('input-suggestions');
        
        if (!suggestions) return;
        
        if (input.length < 3) {
            suggestions.innerHTML = '';
            return;
        }
        
        const matchingSuggestions = [
            'What caused the Aral Sea to disappear?',
            'How much water was lost over time?',
            'When did the disaster begin?',
            'Can the sea be restored?',
            'What was the human impact?',
            'Are there similar cases worldwide?'
        ].filter(s => s.toLowerCase().includes(input));
        
        suggestions.innerHTML = matchingSuggestions
            .slice(0, 3)
            .map(s => `<span class="suggestion">${s}</span>`)
            .join('');
        
        // Add click handlers to suggestions
        suggestions.querySelectorAll('.suggestion').forEach(span => {
            span.addEventListener('click', () => {
                this.chatInput.value = span.textContent;
                suggestions.innerHTML = '';
                this.sendMessage();
            });
        });
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});

// Make available globally
window.AIAssistant = AIAssistant;
