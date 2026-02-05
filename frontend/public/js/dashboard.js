// Dashboard Module for Dev-Journal
const Dashboard = {
    chart: null,

    async init() {
        // Check authentication
        if (!Auth.requireAuth()) return;

        // Setup UI
        this.setupUserDisplay();
        this.setupLogout();
        this.setupMobileMenu();

        // Load dashboard data
        await Promise.all([
            this.loadStats(),
            this.loadStreaks()
        ]);
    },

    setupUserDisplay() {
        const user = Auth.getUser();
        const userDisplay = document.getElementById('userDisplay');
        if (user && userDisplay) {
            userDisplay.textContent = user.name || user.email;
        }
    },

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
    },

    setupMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navContent = document.querySelector('.nav-content');

        if (menuBtn && navContent) {
            menuBtn.addEventListener('click', () => {
                const isOpen = navContent.classList.toggle('open');
                menuBtn.setAttribute('aria-expanded', isOpen);
            });
        }
    },

    async loadStats() {
        try {
            const response = await fetch('/api/stats/dashboard', {
                headers: Auth.getAuthHeader()
            });
            const result = await response.json();

            if (result.success) {
                this.renderStats(result.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    },

    async loadStreaks() {
        try {
            const response = await fetch('/api/stats/streaks', {
                headers: Auth.getAuthHeader()
            });
            const result = await response.json();

            if (result.success) {
                this.renderStreaks(result.data);
            }
        } catch (error) {
            console.error('Failed to load streaks:', error);
        }
    },

    renderStats(data) {
        const { overview, entriesByCategory, recentEntries, tagCloud, activityData } = data;

        // Update stat cards
        document.getElementById('totalEntries').textContent = overview.totalEntries.toLocaleString();
        document.getElementById('totalWords').textContent = overview.totalWords.toLocaleString();
        document.getElementById('thisWeekEntries').textContent = overview.thisWeekEntries;
        document.getElementById('avgWords').textContent = overview.averageWordsPerEntry;

        // Render categories
        this.renderCategories(entriesByCategory, overview.totalEntries);

        // Render tag cloud
        this.renderTagCloud(tagCloud);

        // Render recent entries
        this.renderRecentEntries(recentEntries);

        // Render activity chart
        this.renderActivityChart(activityData);
    },

    renderStreaks(data) {
        document.getElementById('currentStreak').textContent = data.currentStreak;
        document.getElementById('longestStreak').textContent = data.longestStreak;
        document.getElementById('totalDays').textContent = data.totalDaysWithEntries;
    },

    renderCategories(categories, total) {
        const container = document.getElementById('categoryList');
        if (!container) return;

        const categoryIcons = {
            'daily-learning': '&#128218;',
            'project-note': '&#128193;',
            'bug-fix': '&#128027;',
            'code-snippet': '&#128187;',
            'concept': '&#128161;'
        };

        const categoryNames = {
            'daily-learning': 'Daily Learning',
            'project-note': 'Project Notes',
            'bug-fix': 'Bug Fixes',
            'code-snippet': 'Code Snippets',
            'concept': 'Concepts'
        };

        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);

        container.innerHTML = sortedCategories.map(([category, count]) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
            return `
                <a href="/?category=${category}" class="category-item">
                    <span class="category-name">
                        <span>${categoryIcons[category] || '&#128196;'}</span>
                        ${categoryNames[category] || category}
                    </span>
                    <span class="category-count">${count}</span>
                </a>
                <div class="category-bar" style="width: ${percentage}%"></div>
            `;
        }).join('');
    },

    renderTagCloud(tags) {
        const container = document.getElementById('tagCloud');
        if (!container || !tags.length) {
            container.innerHTML = '<p style="color: var(--text-muted)">No tags yet</p>';
            return;
        }

        const maxCount = Math.max(...tags.map(t => t.count));

        container.innerHTML = tags.map(({ tag, count }) => {
            const ratio = count / maxCount;
            let sizeClass = 'size-sm';
            if (ratio > 0.7) sizeClass = 'size-lg';
            else if (ratio > 0.4) sizeClass = 'size-md';

            return `<a href="/?search=${encodeURIComponent(tag)}" class="tag ${sizeClass}" role="listitem">${tag}</a>`;
        }).join('');
    },

    renderRecentEntries(entries) {
        const container = document.getElementById('recentEntries');
        if (!container) return;

        if (!entries.length) {
            container.innerHTML = '<p style="color: var(--text-muted)">No entries yet. <a href="/new">Create your first entry!</a></p>';
            return;
        }

        const categoryIcons = {
            'daily-learning': '&#128218;',
            'project-note': '&#128193;',
            'bug-fix': '&#128027;',
            'code-snippet': '&#128187;',
            'concept': '&#128161;'
        };

        container.innerHTML = entries.map(entry => {
            const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            return `
                <a href="/entry/${entry._id}" class="recent-entry">
                    <span class="entry-title">
                        ${categoryIcons[entry.category] || '&#128196;'} ${entry.title}
                    </span>
                    <span class="entry-meta">${date}</span>
                </a>
            `;
        }).join('');
    },

    renderActivityChart(activityData) {
        const canvas = document.getElementById('activityChart');
        if (!canvas) return;

        // Generate last 30 days
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            const dayData = activityData.find(d => d._id === dateStr);
            data.push(dayData ? dayData.count : 0);
        }

        // Destroy existing chart if any
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Entries',
                    data,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgb(99, 102, 241)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9ca3af',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
};

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
