// Password Strength Checker Module
const PasswordStrength = {
    // Check password strength and return score (0-5) with label
    check(password) {
        if (!password) {
            return { score: 0, label: 'Empty', color: 'var(--text-muted)' };
        }

        let score = 0;
        const checks = {
            length8: password.length >= 8,
            length12: password.length >= 12,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        if (checks.length8) score++;
        if (checks.length12) score++;
        if (checks.uppercase) score++;
        if (checks.lowercase) score++;
        if (checks.numbers) score++;
        if (checks.special) score++;

        const levels = [
            { min: 0, label: 'Very Weak', color: 'var(--danger)' },
            { min: 1, label: 'Weak', color: '#ef4444' },
            { min: 2, label: 'Fair', color: '#f59e0b' },
            { min: 3, label: 'Good', color: '#eab308' },
            { min: 4, label: 'Strong', color: '#22c55e' },
            { min: 5, label: 'Very Strong', color: 'var(--success)' }
        ];

        const level = levels.filter(l => score >= l.min).pop();

        return {
            score,
            maxScore: 6,
            label: level.label,
            color: level.color,
            checks
        };
    },

    // Render password strength meter
    render(container, password) {
        if (!container) return;

        const result = this.check(password);
        const percentage = (result.score / result.maxScore) * 100;

        container.innerHTML = `
            <div class="password-strength-meter">
                <div class="strength-bar-bg">
                    <div class="strength-bar" style="width: ${percentage}%; background: ${result.color};"></div>
                </div>
                <div class="strength-info">
                    <span class="strength-label" style="color: ${result.color};">${result.label}</span>
                    <span class="strength-score">${result.score}/${result.maxScore}</span>
                </div>
                ${password ? this.renderChecklist(result.checks) : ''}
            </div>
        `;
    },

    // Render password requirements checklist
    renderChecklist(checks) {
        const items = [
            { key: 'length8', label: 'At least 8 characters' },
            { key: 'length12', label: '12+ characters (bonus)' },
            { key: 'uppercase', label: 'Uppercase letter (A-Z)' },
            { key: 'lowercase', label: 'Lowercase letter (a-z)' },
            { key: 'numbers', label: 'Number (0-9)' },
            { key: 'special', label: 'Special character (!@#$...)' }
        ];

        return `
            <ul class="password-checklist" role="list">
                ${items.map(item => `
                    <li class="${checks[item.key] ? 'passed' : 'failed'}">
                        <span class="check-icon">${checks[item.key] ? '&#10003;' : '&#10007;'}</span>
                        ${item.label}
                    </li>
                `).join('')}
            </ul>
        `;
    },

    // Initialize password strength on an input field
    init(inputId, containerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);

        if (!input || !container) return;

        // Add CSS if not already present
        this.addStyles();

        // Initial render
        this.render(container, input.value);

        // Update on input
        input.addEventListener('input', () => {
            this.render(container, input.value);
        });
    },

    // Add necessary CSS styles
    addStyles() {
        if (document.getElementById('password-strength-styles')) return;

        const style = document.createElement('style');
        style.id = 'password-strength-styles';
        style.textContent = `
            .password-strength-meter {
                margin-top: var(--space-sm);
            }

            .strength-bar-bg {
                height: 6px;
                background: var(--bg-secondary);
                border-radius: var(--radius-full);
                overflow: hidden;
            }

            .strength-bar {
                height: 100%;
                border-radius: var(--radius-full);
                transition: all 0.3s ease;
            }

            .strength-info {
                display: flex;
                justify-content: space-between;
                margin-top: var(--space-xs);
                font-size: var(--text-sm);
            }

            .strength-label {
                font-weight: 600;
            }

            .strength-score {
                color: var(--text-muted);
            }

            .password-checklist {
                list-style: none;
                padding: 0;
                margin: var(--space-sm) 0 0 0;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-xs);
                font-size: var(--text-xs);
            }

            .password-checklist li {
                display: flex;
                align-items: center;
                gap: var(--space-xs);
                color: var(--text-muted);
            }

            .password-checklist li.passed {
                color: var(--success);
            }

            .password-checklist li.failed {
                color: var(--text-muted);
            }

            .check-icon {
                font-weight: bold;
            }

            @media (max-width: 480px) {
                .password-checklist {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }
};

// Export for use in other scripts
window.PasswordStrength = PasswordStrength;
