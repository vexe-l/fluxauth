// FluxAuth Popup Script
document.addEventListener('DOMContentLoaded', async () => {
    // Load saved settings
    const settings = await chrome.storage.local.get(['userId', 'apiKey', 'apiUrl', 'enabled']);

    document.getElementById('userId').value = settings.userId || '';
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('apiUrl').value = settings.apiUrl || 'http://localhost:3001/api';
    // Default to enabled if not set
    document.getElementById('enableToggle').checked = settings.enabled !== undefined ? settings.enabled : true;

    updateStatus(settings.enabled);

    // Get current session data from background
    chrome.runtime.sendMessage({ type: 'GET_SESSION_DATA' }, (response) => {
        if (response && response.sessionId) {
            document.getElementById('sessionId').textContent = response.sessionId.substring(0, 16) + '...';

            if (response.trustScore !== null) {
                showTrustScore(response.trustScore, response.isAnomaly);
            }
        }
    });

    // Save settings button
    document.getElementById('saveBtn').addEventListener('click', async () => {
        const userId = document.getElementById('userId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const apiUrl = document.getElementById('apiUrl').value.trim();

        if (!userId || !apiKey) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        await chrome.storage.local.set({
            userId,
            apiKey,
            apiUrl,
            enabled: document.getElementById('enableToggle').checked
        });

        showMessage('Settings saved successfully!', 'success');

        // Reload content scripts
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
        }
    });

    // Toggle switch
    document.getElementById('enableToggle').addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        await chrome.storage.local.set({ enabled });
        updateStatus(enabled);

        if (enabled) {
            showMessage('Protection enabled', 'success');
            // Reload content scripts
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
            }
        } else {
            showMessage('Protection disabled', 'error');
        }
    });
});

function updateStatus(enabled) {
    const statusBadge = document.getElementById('statusBadge');
    if (enabled) {
        statusBadge.textContent = 'Active';
        statusBadge.className = 'status-badge status-active';
    } else {
        statusBadge.textContent = 'Inactive';
        statusBadge.className = 'status-badge status-inactive';
    }
}

function showTrustScore(score, isAnomaly) {
    const trustScoreSection = document.getElementById('trustScoreSection');
    const scoreCircle = document.getElementById('scoreCircle');

    trustScoreSection.style.display = 'block';
    scoreCircle.textContent = score;

    // Color based on score
    if (isAnomaly || score < 50) {
        scoreCircle.style.background = 'rgba(220, 53, 69, 0.3)';
    } else if (score < 70) {
        scoreCircle.style.background = 'rgba(255, 193, 7, 0.3)';
    } else {
        scoreCircle.style.background = 'rgba(40, 167, 69, 0.3)';
    }
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = type;
    message.style.display = 'block';

    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}
