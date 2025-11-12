// FluxAuth Background Service Worker
console.log('FluxAuth: Background service worker loaded');

// Store current session data
let currentSession = {
    sessionId: null,
    userId: null,
    trustScore: 100,
    isAnomaly: false,
    lastUpdate: null
};

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message.type);

    switch (message.type) {
        case 'SESSION_STARTED':
            currentSession.sessionId = message.sessionId;
            currentSession.userId = message.userId;
            currentSession.lastUpdate = Date.now();
            console.log('Session started:', currentSession);
            break;

        case 'TRUST_SCORE_UPDATE':
            currentSession.trustScore = message.trustScore;
            currentSession.isAnomaly = message.isAnomaly;
            currentSession.lastUpdate = Date.now();

            // Update badge
            updateBadge(message.trustScore, message.isAnomaly);

            // Show notification if suspicious
            if (message.isAnomaly || message.trustScore < 50) {
                showNotification(message.trustScore);
            }
            break;

        case 'GET_SESSION_DATA':
            sendResponse(currentSession);
            break;

        case 'PING':
            sendResponse({
                isActive: currentSession.sessionId !== null,
                sessionId: currentSession.sessionId,
                trustScore: currentSession.trustScore,
                isAnomaly: currentSession.isAnomaly,
                lastUpdate: currentSession.lastUpdate
            });
            break;

        case 'PERFORM_LOGOUT':
            console.log('Performing logout:', message.reason);
            // Clear session
            currentSession = {
                sessionId: null,
                userId: null,
                trustScore: 100,
                isAnomaly: false,
                lastUpdate: null
            };
            // Update badge
            chrome.action.setBadgeText({ text: '' });
            // Notify all tabs
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    if (tab.id) {
                        chrome.tabs.sendMessage(tab.id, {
                            type: 'LOGOUT_REQUIRED',
                            reason: message.reason
                        }).catch(() => {
                            // Ignore errors for tabs that don't have content script
                        });
                    }
                });
            });
            break;
    }

    return true;
});

// Update extension badge
function updateBadge(trustScore, isAnomaly) {
    if (isAnomaly || trustScore < 50) {
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#D65A31' });
    } else if (trustScore < 70) {
        chrome.action.setBadgeText({ text: '?' });
        chrome.action.setBadgeBackgroundColor({ color: '#EA7F60' });
    } else {
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setBadgeBackgroundColor({ color: '#393E46' });
    }
}

// Show notification
function showNotification(trustScore) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'FluxAuth Security Alert',
        message: `Unusual typing pattern detected (Trust Score: ${trustScore}). If this is you, you can ignore this message.`,
        priority: 2
    });
}

// Reset badge when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('FluxAuth: Extension installed');
    chrome.action.setBadgeText({ text: '' });
});
