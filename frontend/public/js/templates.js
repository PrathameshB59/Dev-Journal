// Dev Journal - Entry Templates per Category
const EntryTemplates = {
    templates: {
        'daily-learning': {
            label: 'Daily Learning',
            content: `## What I Learned

-

## Key Takeaways

-

## Resources

- `
        },
        'project-note': {
            label: 'Project Note',
            content: `## Overview



## Progress

-

## Next Steps

- `
        },
        'bug-fix': {
            label: 'Bug Fix',
            content: `## Problem



## Root Cause



## Solution



## Prevention

- `
        },
        'code-snippet': {
            label: 'Code Snippet',
            content: `## Description



## Code

\`\`\`

\`\`\`

## Usage

`
        },
        'concept': {
            label: 'Concept',
            content: `## Definition



## Key Points

-

## Examples



## Related Topics

- `
        }
    },

    init() {
        const categorySelect = document.getElementById('category');
        const contentTextarea = document.getElementById('content');

        if (!categorySelect || !contentTextarea) return;

        categorySelect.addEventListener('change', () => {
            const category = categorySelect.value;
            const template = this.templates[category];

            if (template && !contentTextarea.value.trim()) {
                contentTextarea.value = template.content;
                contentTextarea.dispatchEvent(new Event('input'));
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    EntryTemplates.init();
});
