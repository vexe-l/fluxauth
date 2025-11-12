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
        this.trustScore = 100;
        this.isAnomaly = false;
        this.blockingOverlay = null;
        this.isBlocked = false;
        this.suspiciousActivityCount = 0;
        this.lastScoreUpdate = null;

        this.injectDetectionScript();
        this.init();
    }

    injectDetectionScript() {
        // Inject script into page context
        const inject = () => {
            // Check if already injected
            if (window.fluxAuthExtension) {
                return;
            }

            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('injected.js');
            script.onload = function() {
                this.remove();
            };
            script.onerror = function() {
                console.error('FluxAuth: Failed to load injected script');
            };
            (document.head || document.documentElement).appendChild(script);
        };

        // Inject immediately if DOM is ready, otherwise wait
        if (document.head || document.documentElement) {
            inject();
        } else {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', inject);
            } else {
                inject();
            }
        }
    }

    async init() {
        // Get user settings from storage
        const settings = await chrome.storage.local.get(['userId', 'apiKey', 'apiUrl', 'enabled']);

        // Default to enabled if not set
        const isEnabled = settings.enabled !== undefined ? settings.enabled : true;

        if (!isEnabled) {
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

        // Update injected script
        this.updateInjectedScript();
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

                this.trustScore = result.trustScore;
                this.isAnomaly = result.isAnomaly;
                this.lastScoreUpdate = Date.now();

                // Update injected script
                this.updateInjectedScript();

                // Notify background script of score
                chrome.runtime.sendMessage({
                    type: 'TRUST_SCORE_UPDATE',
                    trustScore: result.trustScore,
                    isAnomaly: result.isAnomaly,
                    sessionId: this.sessionId
                });

                // Handle suspicious activity
                if (result.isAnomaly || result.trustScore < 50) {
                    this.suspiciousActivityCount++;
                    this.handleSuspiciousActivity(result);
                } else {
                    // Reset counter on good behavior
                    if (this.suspiciousActivityCount > 0) {
                        this.suspiciousActivityCount = Math.max(0, this.suspiciousActivityCount - 1);
                    }
                }
            }
        } catch (error) {
            console.error('FluxAuth: Error sending batch:', error);
        }
    }

    updateInjectedScript() {
        // Update the injected script with current status
        window.postMessage({
            type: 'FLUXAUTH_UPDATE',
            isActive: this.isMonitoring,
            sessionId: this.sessionId,
            trustScore: this.trustScore,
            isAnomaly: this.isAnomaly,
            lastUpdate: this.lastScoreUpdate
        }, '*');
    }

    handleSuspiciousActivity(result) {
        const trustScore = result.trustScore || this.trustScore;
        const severity = trustScore < 30 ? 'critical' : trustScore < 50 ? 'high' : 'medium';

        // Show warning for medium severity
        if (severity === 'medium') {
            this.showWarning(result);
        }

        // Show blocking overlay for high/critical severity
        if (severity === 'high' || severity === 'critical') {
            this.showBlockingOverlay(result, severity);
        }

        // Auto-logout for critical severity or multiple suspicious activities
        if (severity === 'critical' || this.suspiciousActivityCount >= 3) {
            setTimeout(() => {
                this.performLogout(result);
            }, 5000); // Give user 5 seconds before auto-logout
        }
    }

    showWarning(result) {
        // Remove existing warning
        const existing = document.getElementById('fluxauth-warning');
        if (existing) {
            existing.remove();
        }

        // Create warning banner
        const banner = document.createElement('div');
        banner.id = 'fluxauth-warning';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 999998;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease-out;
        `;
        banner.innerHTML = `
            <strong>⚠️ FluxAuth Security Alert</strong><br>
            Unusual typing pattern detected (Trust Score: ${result.trustScore || this.trustScore})<br>
            <small>Your session is being monitored. If this continues, you may be logged out.</small>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(banner);

        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.style.animation = 'slideDown 0.3s ease-out reverse';
                setTimeout(() => banner.remove(), 300);
            }
        }, 15000);
    }

    showBlockingOverlay(result, severity) {
        if (this.isBlocked) return; // Already showing overlay

        this.isBlocked = true;

        // Remove existing overlay
        const existing = document.getElementById('fluxauth-blocking-overlay');
        if (existing) {
            existing.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'fluxauth-blocking-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
            animation: fadeIn 0.3s ease-out;
        `;

        const trustScore = result.trustScore || this.trustScore;
        const isCritical = severity === 'critical';

        overlay.innerHTML = `
            <div style="
                background: ${isCritical ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'};
                color: white;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">
                    ${isCritical ? '🚨' : '⚠️'}
                </div>
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                    ${isCritical ? 'Critical Security Alert' : 'Suspicious Activity Detected'}
                </h2>
                <p style="font-size: 16px; margin-bottom: 20px; opacity: 0.9;">
                    Your behavior pattern has been flagged as ${isCritical ? 'highly suspicious' : 'suspicious'}.
                    <br><br>
                    <strong>Trust Score: ${trustScore}/100</strong>
                </p>
                ${isCritical ? `
                    <p style="font-size: 14px; margin-bottom: 24px; opacity: 0.8;">
                        You will be automatically logged out in <span id="countdown">5</span> seconds for security.
                    </p>
                ` : `
                    <p style="font-size: 14px; margin-bottom: 24px; opacity: 0.8;">
                        If this activity continues, you will be logged out automatically.
                    </p>
                `}
                <button id="fluxauth-dismiss" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid white;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ${isCritical ? 'Log Out Now' : 'Dismiss (Not Recommended)'}
                </button>
            </div>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(overlay);

        // Countdown for critical
        if (isCritical) {
            let countdown = 5;
            const countdownEl = overlay.querySelector('#countdown');
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdownEl) {
                    countdownEl.textContent = countdown.toString();
                }
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    this.performLogout(result);
                }
            }, 1000);
        }

        // Dismiss button
        const dismissBtn = overlay.querySelector('#fluxauth-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                if (isCritical) {
                    this.performLogout(result);
                } else {
                    overlay.remove();
                    this.isBlocked = false;
                }
            });
        }
    }

    performLogout(result) {
        // Notify background script
        chrome.runtime.sendMessage({
            type: 'PERFORM_LOGOUT',
            reason: 'suspicious_activity',
            trustScore: result.trustScore || this.trustScore,
            sessionId: this.sessionId
        });

        // Clear local storage
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.error('Failed to clear storage:', e);
        }

        // Show logout message
        if (this.blockingOverlay) {
            this.blockingOverlay.remove();
        }

        const logoutOverlay = document.createElement('div');
        logoutOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        logoutOverlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                color: white;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                text-align: center;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                    Logged Out for Security
                </h2>
                <p style="font-size: 16px; margin-bottom: 24px; opacity: 0.9;">
                    Your session has been terminated due to suspicious activity.
                    <br><br>
                    Please contact support if you believe this is an error.
                </p>
                <button onclick="window.location.href='/'" style="
                    background: white;
                    color: #dc2626;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Return to Home
                </button>
            </div>
        `;
        document.body.appendChild(logoutOverlay);

        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
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

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FRONTEND_ACTION') {
        if (message.action === 'logout') {
            monitor.performLogout({ trustScore: monitor.trustScore });
        } else if (message.action === 'block') {
            monitor.showBlockingOverlay({ trustScore: monitor.trustScore }, 'high');
        }
        sendResponse({ success: true });
    }
    return true;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    monitor.stopMonitoring();
});
