// Injected script that runs in page context
// This allows the frontend to detect the extension

(function() {
    'use strict';
    
    // Create extension detection object
    if (typeof window.fluxAuthExtension === 'undefined') {
        window.fluxAuthExtension = {
            isActive: false,
            sessionId: null,
            trustScore: null,
            isAnomaly: false,
            lastUpdate: null,
            version: '1.0.0'
        };
    }

    // Listen for messages from content script
    window.addEventListener('message', function(event) {
        // Only accept messages from our extension
        if (event.data && event.data.type === 'FLUXAUTH_UPDATE') {
            window.fluxAuthExtension.isActive = event.data.isActive || false;
            window.fluxAuthExtension.sessionId = event.data.sessionId || null;
            window.fluxAuthExtension.trustScore = event.data.trustScore || null;
            window.fluxAuthExtension.isAnomaly = event.data.isAnomaly || false;
            window.fluxAuthExtension.lastUpdate = event.data.lastUpdate || Date.now();
        }
    });

    // Dispatch initial ready event
    window.dispatchEvent(new CustomEvent('fluxauth-extension-ready'));
})();

