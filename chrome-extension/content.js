// FluxAuth Content Script - Monitors typing behavior on all pages
console.log('FluxAuth: Content script loaded');

class BehaviorMonitor {
    constructor() {
        this.events = [];
        this.sessionId = null;
        this.userId = null;
        this.isMonitoring = false;
        this.lastKeypressTime = null;
        this.batchInterval = 30000; // Send data every 30 seconds
        this.batchTimer = null;

        this.init();
    }

    async init() {
        // Get user settings from storage
        const settings = await chrome.storage.local.get(['userId', 'apiKey', 'apiUrl', 'enabled']);

        if (!settings.enabled) {
            console.log('FluxAuth: Monitoring disabled');
            return;
        }

        this.userId = settings.userId;
        this.apiKey = settings.apiKey;
        this.apiUrl = settings.apiUrl || 'http://localhost:3001/api';

        if (!this.userId || !this.apiKey) {
            console.log('FluxAuth: Not configured. Please set up in extension popup.');
            return;
        }

        this.startMonitoring();
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.sessionId = `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('FluxAuth: Monitoring started', this.sessionId);

        // Listen for keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        document.addEventListener('keyup', this.handleKeyUp.bind(this), true);

        // Start batch sending
        this.startBatchSending();

        // Notify background script
        chrome.runtime.sendMessage({
            type: 'SESSION_STARTED',
            sessionId: this.sessionId,
            userId: this.userId
        });
    }

    handleKeyDown(event) {
        if (!this.isMonitoring) return;

        const timestamp = Date.now();
        const keyClass = this.classifyKey(event.key);

        this.events.push({
            type: 'keydown',
            timestamp,
            keyClass,
            isPassword: this.isPasswordField(event.target)
        });

        this.lastKeypressTime = timestamp;
    }

    handleKeyUp(event) {
        if (!this.isMonitoring) return;

        const timestamp = Date.now();
        const keyClass = this.classifyKey(event.key);

        this.events.push({
            type: 'keyup',
            timestamp,
            keyClass,
            isPassword: this.isPasswordField(event.target)
        });
    }

    classifyKey(key) {
        if (key.length === 1) {
            if (/[a-zA-Z]/.test(key)) return 'letter';
            if (/[0-9]/.test(key)) return 'number';
            if (key === ' ') return 'space';
            return 'special';
        }
        if (key === 'Backspace') return 'backspace';
        if (key === 'Enter') return 'enter';
        if (key === 'Tab') return 'tab';
        return 'other';
    }

    isPasswordField(element) {
        return element && element.type === 'password';
    }

    isLoginForm(element) {
        if (!element) return false;

        // Check if element is in a form with password field
        const form = element.closest('form');
        if (form) {
            const hasPassword = form.querySelector('input[type="password"]');
            const hasEmail = form.querySelector('input[type="email"], input[name*="email"], input[name*="username"]');
            return hasPassword && hasEmail;
        }

        return false;
    }

    startBatchSending() {
        this.batchTimer = setInterval(() => {
            if (this.events.length > 10) {
                this.sendBatch();
            }
        }, this.batchInterval);
    }

    async sendBatch() {
        if (this.events.length === 0) return;

        const batch = [...this.events];
        this.events = [];

        try {
            const response = await fetch(`${this.apiUrl}/session/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    userId: this.userId,
                    sessionId: this.sessionId,
                    events: batch
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('FluxAuth: Trust score:', result.trustScore);

                // Notify background script of score
                chrome.runtime.sendMessage({
                    type: 'TRUST_SCORE_UPDATE',
                    trustScore: result.trustScore,
                    isAnomaly: result.isAnomaly,
                    sessionId: this.sessionId
                });

                // Alert if suspicious
                if (result.trustScore < 50) {
                    this.showWarning(result);
                }
            }
        } catch (error) {
            console.error('FluxAuth: Error sending batch:', error);
        }
    }

    showWarning(result) {
        // Create warning banner
        const banner = document.createElement('div');
        banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
        banner.innerHTML = `
      <strong>⚠️ FluxAuth Security Alert</strong><br>
      Unusual typing pattern detected (Trust Score: ${result.trustScore})<br>
      <small>If this is you, you can ignore this message.</small>
    `;

        document.body.appendChild(banner);

        setTimeout(() => {
            banner.remove();
        }, 10000);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        if (this.batchTimer) {
            clearInterval(this.batchTimer);
        }

        // Send remaining events
        if (this.events.length > 0) {
            this.sendBatch();
        }
    }
}

// Initialize monitor
const monitor = new BehaviorMonitor();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_STATUS') {
        sendResponse({
            isMonitoring: monitor.isMonitoring,
            sessionId: monitor.sessionId,
            eventCount: monitor.events.length
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    monitor.stopMonitoring();
});
