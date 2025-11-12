/**
 * Extension Detection Utility
 * Detects if FluxAuth Chrome Extension is installed and active
 */

const EXTENSION_ID = 'fluxauth-security'; // This will be the extension ID when published
const DETECTION_TIMEOUT = 2000; // 2 seconds timeout

export interface ExtensionStatus {
  isInstalled: boolean;
  isActive: boolean;
  sessionId?: string;
  trustScore?: number;
  isAnomaly?: boolean;
  lastUpdate?: number;
}

/**
 * Check if the Chrome extension is installed and active
 */
export async function checkExtensionInstalled(): Promise<ExtensionStatus> {
  return new Promise((resolve) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.chrome?.runtime) {
      resolve({
        isInstalled: false,
        isActive: false
      });
      return;
    }

    // Try to communicate with the extension
    // The extension will inject a script that sets window.fluxAuthExtension
    if ((window as any).fluxAuthExtension) {
      const ext = (window as any).fluxAuthExtension;
      resolve({
        isInstalled: true,
        isActive: ext.isActive || false,
        sessionId: ext.sessionId,
        trustScore: ext.trustScore,
        isAnomaly: ext.isAnomaly,
        lastUpdate: ext.lastUpdate
      });
      return;
    }

    // Fallback: Try to ping the extension via message
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          isInstalled: false,
          isActive: false
        });
      }
    }, DETECTION_TIMEOUT);

    try {
      // Try to send a message to the extension
      const chromeRuntime = (window as any).chrome?.runtime;
      if (chromeRuntime?.sendMessage) {
        chromeRuntime.sendMessage(
          { type: 'PING' },
          (response: any) => {
            clearTimeout(timeout);
            const lastError = chromeRuntime.lastError;
            if (!resolved && !lastError && response) {
              resolved = true;
              resolve({
                isInstalled: true,
                isActive: response.isActive || false,
                sessionId: response.sessionId,
                trustScore: response.trustScore,
                isAnomaly: response.isAnomaly,
                lastUpdate: response.lastUpdate
              });
            } else if (!resolved) {
              resolved = true;
              resolve({
                isInstalled: false,
                isActive: false
              });
            }
          }
        );
      } else {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve({
            isInstalled: false,
            isActive: false
          });
        }
      }
    } catch (error) {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve({
          isInstalled: false,
          isActive: false
        });
      }
    }
  });
}

/**
 * Listen for extension status updates
 */
export function listenForExtensionUpdates(
  callback: (status: ExtensionStatus) => void
): () => void {
  const checkInterval = setInterval(async () => {
    const status = await checkExtensionInstalled();
    callback(status);
  }, 1000); // Check every second

  // Also listen for custom events from the extension
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'FLUXAUTH_EXTENSION_UPDATE') {
      callback({
        isInstalled: true,
        isActive: event.data.isActive,
        sessionId: event.data.sessionId,
        trustScore: event.data.trustScore,
        isAnomaly: event.data.isAnomaly,
        lastUpdate: event.data.lastUpdate
      });
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    clearInterval(checkInterval);
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * Request extension to perform an action (like logout)
 */
export async function requestExtensionAction(
  action: 'logout' | 'block' | 'warn',
  reason?: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const chromeRuntime = (window as any).chrome?.runtime;
    if (!chromeRuntime?.sendMessage) {
      resolve(false);
      return;
    }

    chromeRuntime.sendMessage(
      {
        type: 'FRONTEND_ACTION',
        action,
        reason
      },
      (response: any) => {
        resolve(response?.success || false);
      }
    );
  });
}

