// Dev Journal - Markdown Live Preview Module
const MarkdownPreview = {
    debounceTimer: null,

    // Simple markdown renderer (no external dependencies)
    renderMarkdown(text) {
        if (!text) return '';

        let html = this.escapeHtml(text);

        // Code blocks (``` ... ```)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
            return `<pre class="md-code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

        // Headers
        html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

        // Bold & italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Blockquotes
        html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

        // Unordered lists
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        return '<p>' + html + '</p>';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    init() {
        const textarea = document.getElementById('content');
        const preview = document.getElementById('markdownPreview');
        const toolbar = document.querySelector('.editor-toolbar');
        const container = document.querySelector('.editor-container');

        if (!textarea || !preview || !toolbar || !container) return;

        // Mode buttons
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.editor-mode-btn');
            if (!btn) return;

            const mode = btn.dataset.mode;
            toolbar.querySelectorAll('.editor-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            container.setAttribute('data-mode', mode);

            if (mode === 'preview' || mode === 'split') {
                preview.innerHTML = this.renderMarkdown(textarea.value);
            }
        });

        // Live preview on input (debounced)
        textarea.addEventListener('input', () => {
            const mode = container.getAttribute('data-mode');
            if (mode === 'split' || mode === 'preview') {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    preview.innerHTML = this.renderMarkdown(textarea.value);
                }, 300);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MarkdownPreview.init();
});
