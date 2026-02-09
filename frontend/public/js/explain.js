// ========================================
// EXPLAIN PAGE - AI Explanation Interface
// ========================================

// Ensure Auth is available
if (typeof Auth === 'undefined') {
    console.error('Auth module not loaded');
    window.location.href = '/login.html';
}

// Constants
const API_BASE = '/api';
const EXPLORER_API = `${API_BASE}/explorer`;
const AI_API = `${API_BASE}/ai`;

// Utility: Escape HTML
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Utility: Auto-detect and render code blocks
const detectAndRenderCode = (content) => {
    // Detect ```language code blocks (fenced code blocks)
    content = content.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'code';
        const escapedCode = escapeHtml(code.trim());
        return `<div class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-language">${language}</span>
                <button class="copy-code-btn" onclick="copyCodeBlock(this)">
                    <span class="copy-icon">&#128203;</span>
                    <span class="copy-text">Copy</span>
                </button>
            </div>
            <pre><code class="language-${language}">${escapedCode}</code></pre>
        </div>`;
    });

    // Detect inline code blocks with single backticks
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');

    return content;
};

// Utility: Copy code block to clipboard
window.copyCodeBlock = function(btn) {
    const codeBlock = btn.closest('.code-block-wrapper').querySelector('code');
    const text = codeBlock.textContent;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.querySelector('.copy-text').textContent;
        btn.querySelector('.copy-text').textContent = 'Copied!';
        btn.querySelector('.copy-icon').textContent = '✓';

        setTimeout(() => {
            btn.querySelector('.copy-text').textContent = originalText;
            btn.querySelector('.copy-icon').textContent = '📋';
        }, 2000);
    });
};

// Utility: Format AI response with markdown-like styling
const formatAiResponse = (content) => {
    // First handle code blocks
    let formatted = detectAndRenderCode(content);

    // Convert markdown headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert lists
    formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in ul
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Convert paragraphs (split by double newlines)
    const lines = formatted.split('\n');
    let result = '';
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Track if we're inside a code block
        if (line.includes('code-block-wrapper')) {
            inCodeBlock = true;
        }

        if (inCodeBlock) {
            result += lines[i] + '\n';
            if (line.includes('</pre>') || line.includes('</div>')) {
                inCodeBlock = false;
            }
            continue;
        }

        // Skip empty lines and already formatted elements
        if (!line || line.startsWith('<')) {
            result += lines[i] + '\n';
            continue;
        }

        // Wrap text in paragraphs
        result += `<p>${line}</p>\n`;
    }

    return result;
};

// Main Explain Page Class
class ExplainPage {
    constructor() {
        this.entryId = null;
        this.entry = null;
        this.conversation = [];
        this.isLoading = false;
    }

    async init() {
        // Check authentication
        Auth.requireAuth();

        // Extract entry ID from URL
        const pathParts = window.location.pathname.split('/');
        this.entryId = pathParts[pathParts.length - 1];

        if (!this.entryId) {
            alert('Invalid entry ID');
            window.history.back();
            return;
        }

        // Setup event listeners
        this.setupEventListeners();

        // Load entry and explanation
        await this.loadEntry();
        await this.fetchExplanation();
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.back();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            Auth.logout();
        });

        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send (Shift+Enter for new line)
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        document.getElementById('chatInput').addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });

        // Display user info
        const user = Auth.getUser();
        if (user) {
            document.getElementById('userDisplay').textContent = `👤 ${user.username}`;
        }
    }

    async loadEntry() {
        try {
            const res = await fetch(`${EXPLORER_API}/${this.entryId}`, {
                headers: Auth.getAuthHeader()
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load entry');
            }

            this.entry = data.entry;

            // Update page title
            document.getElementById('entryTitle').textContent = this.entry.title || 'Untitled';
            document.getElementById('entryMeta').textContent =
                `${this.entry.isFolder ? 'Folder' : 'File'} - ${new Date(this.entry.createdAt).toLocaleDateString()}`;

            // Update reference content
            const referenceContent = document.getElementById('referenceContent');
            if (this.entry.isFolder) {
                referenceContent.innerHTML = '<p style="color: #999; font-style: italic;">This is a folder entry.</p>';
            } else {
                referenceContent.innerHTML = formatAiResponse(this.entry.content || 'No content');
            }

        } catch (error) {
            console.error('Failed to load entry:', error);
            alert('Failed to load entry: ' + error.message);
            window.history.back();
        }
    }

    async fetchExplanation() {
        try {
            this.isLoading = true;

            const res = await fetch(`${AI_API}/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...Auth.getAuthHeader()
                },
                body: JSON.stringify({ entryId: this.entryId })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get explanation');
            }

            // Add AI response to conversation
            this.conversation.push({
                role: 'ai',
                content: data.data.content,
                timestamp: new Date()
            });

            this.renderConversation();
            this.enableChat();

        } catch (error) {
            console.error('Failed to get explanation:', error);
            this.showError('Failed to get explanation: ' + error.message);
            this.enableChat();
        } finally {
            this.isLoading = false;
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const question = input.value.trim();

        if (!question || this.isLoading) return;

        // Add user message to conversation
        this.conversation.push({
            role: 'user',
            content: question,
            timestamp: new Date()
        });

        // Clear input and render
        input.value = '';
        input.style.height = 'auto';
        this.renderConversation();

        // Disable input while loading
        this.isLoading = true;
        input.disabled = true;
        document.getElementById('sendBtn').disabled = true;

        try {
            const res = await fetch(`${AI_API}/quick-help`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...Auth.getAuthHeader()
                },
                body: JSON.stringify({
                    question,
                    entryId: this.entryId
                })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get response');
            }

            // Add AI response to conversation
            this.conversation.push({
                role: 'ai',
                content: data.data.content,
                timestamp: new Date()
            });

            this.renderConversation();

        } catch (error) {
            console.error('Failed to send message:', error);
            this.conversation.push({
                role: 'ai',
                content: `Sorry, I encountered an error: ${error.message}`,
                timestamp: new Date()
            });
            this.renderConversation();
        } finally {
            this.isLoading = false;
            input.disabled = false;
            document.getElementById('sendBtn').disabled = false;
            input.focus();
        }
    }

    renderConversation() {
        const container = document.getElementById('conversationArea');
        container.innerHTML = '';

        this.conversation.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${msg.role}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = msg.role === 'ai' ? '🤖' : '👤';

            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = msg.role === 'ai'
                ? formatAiResponse(msg.content)
                : escapeHtml(msg.content).replace(/\n/g, '<br>');

            if (msg.role === 'user') {
                messageEl.appendChild(content);
                messageEl.appendChild(avatar);
            } else {
                messageEl.appendChild(avatar);
                messageEl.appendChild(content);
            }

            container.appendChild(messageEl);
        });

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    showError(message) {
        const container = document.getElementById('conversationArea');
        container.innerHTML = `
            <div class="message ai">
                <div class="message-avatar">⚠️</div>
                <div class="message-content" style="border-color: #ff6b6b; background: #fff5f5;">
                    <p><strong>Error:</strong> ${escapeHtml(message)}</p>
                    <p style="margin-top: 12px; font-size: 14px; color: #666;">
                        Please try again or <a href="javascript:history.back()" style="color: #0066cc;">go back</a>.
                    </p>
                </div>
            </div>
        `;
    }

    enableChat() {
        document.getElementById('chatInput').disabled = false;
        document.getElementById('sendBtn').disabled = false;
        document.getElementById('chatInput').focus();
    }
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const explainPage = new ExplainPage();
    explainPage.init();
});
