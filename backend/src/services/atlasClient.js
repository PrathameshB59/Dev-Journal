/**
 * Atlas AI Client
 *
 * Thin HTTP client for calling the Atlas AI microservice.
 * Dev Journal is just a CLIENT — all AI logic lives in Atlas AI.
 *
 * Atlas AI API: POST /ai/:action { userId, prompt } → { provider, action, content }
 */

const ATLAS_AI_URL = process.env.ATLAS_AI_URL || 'http://localhost:9000';
const ATLAS_AI_KEY = process.env.ATLAS_AI_KEY || '';

/**
 * Call Atlas AI with an action and prompt.
 * @param {string} action - The AI action (e.g. 'summarize', 'explain', 'quick', 'embed', 'search')
 * @param {string} userId - The user's ID (for Atlas AI budget tracking)
 * @param {string} prompt - The prompt text to send
 * @returns {Promise<{provider: string, action: string, content: string}>}
 */
async function callAtlasAI(action, userId, prompt) {
    const url = `${ATLAS_AI_URL}/ai/${action}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(ATLAS_AI_KEY && { 'x-api-key': ATLAS_AI_KEY })
        },
        body: JSON.stringify({ userId: userId.toString(), prompt })
    });

    if (!res.ok) {
        let errorMsg = 'Atlas AI request failed';
        try {
            const err = await res.json();
            errorMsg = err.error || errorMsg;
        } catch {
            // Response wasn't JSON
        }
        throw new Error(errorMsg);
    }

    return res.json();
}

/**
 * Check if Atlas AI service is healthy.
 * @returns {Promise<boolean>}
 */
async function isAtlasHealthy() {
    try {
        const res = await fetch(`${ATLAS_AI_URL}/health`);
        const data = await res.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Call Atlas Agent — context-aware, memory-backed AI agent.
 * @param {string} userId - The user's ID
 * @param {string} message - The message to send
 * @param {string|null} sessionId - Optional session ID for conversation continuity
 * @param {object} context - Optional context (project, source)
 * @returns {Promise<{sessionId: string, provider: string, content: string, reasoning: object}>}
 */
async function callAtlasAgent(userId, message, sessionId = null, context = {}) {
    const url = `${ATLAS_AI_URL}/ai/agent`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(ATLAS_AI_KEY && { 'x-api-key': ATLAS_AI_KEY })
        },
        body: JSON.stringify({
            userId: userId.toString(),
            message,
            ...(sessionId && { sessionId }),
            context
        })
    });

    if (!res.ok) {
        let errorMsg = 'Atlas Agent request failed';
        try {
            const err = await res.json();
            errorMsg = err.error || errorMsg;
        } catch {
            // Response wasn't JSON
        }
        throw new Error(errorMsg);
    }

    return res.json();
}

module.exports = { callAtlasAI, callAtlasAgent, isAtlasHealthy };
