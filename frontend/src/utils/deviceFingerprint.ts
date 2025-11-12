/**
 * Device Fingerprinting Utility
 * 
 * NOTE: This is a basic implementation structure.
 * Full device fingerprinting requires extensive testing across:
 * - Different browsers (Chrome, Firefox, Safari, Edge)
 * - Different devices (Desktop, Mobile, Tablet)
 * - Different operating systems
 * - Privacy settings and extensions that may block certain APIs
 * - GDPR/CCPA compliance considerations
 * 
 * This utility provides a foundation but should be thoroughly tested
 * before production use.
 */

export interface DeviceFingerprint {
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    userAgent: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    colorDepth: number;
    pixelRatio: number;
    touchSupport: boolean;
    cookieEnabled: boolean;
    doNotTrack?: string | null;
    // Note: Canvas fingerprinting, WebGL fingerprinting, and AudioContext
    // fingerprinting are more advanced and require additional testing
}

/**
 * Generate a basic device fingerprint
 * 
 * WARNING: This is a simplified version. Production implementations should:
 * 1. Handle cases where APIs are blocked or unavailable
 * 2. Test across all major browsers and devices
 * 3. Consider privacy regulations (GDPR, CCPA)
 * 4. Implement proper error handling
 * 5. Add more sophisticated fingerprinting techniques if needed
 */
export function generateDeviceFingerprint(): DeviceFingerprint {
    try {
        return {
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language || navigator.languages?.[0] || 'unknown',
            platform: navigator.platform || 'unknown',
            userAgent: navigator.userAgent,
            hardwareConcurrency: navigator.hardwareConcurrency || 0,
            deviceMemory: (navigator as any).deviceMemory, // May be undefined in some browsers
            colorDepth: screen.colorDepth || 24,
            pixelRatio: window.devicePixelRatio || 1,
            touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack
        };
    } catch (error) {
        console.warn('Device fingerprinting failed:', error);
        // Return minimal fingerprint on error
        return {
            screenResolution: 'unknown',
            timezone: 'unknown',
            language: 'unknown',
            platform: 'unknown',
            userAgent: navigator.userAgent || 'unknown',
            hardwareConcurrency: 0,
            colorDepth: 24,
            pixelRatio: 1,
            touchSupport: false,
            cookieEnabled: false
        };
    }
}

/**
 * Generate a hash of the device fingerprint for storage/comparison
 * 
 * NOTE: This is a simple hash. Production should use a proper
 * cryptographic hash function (e.g., SHA-256) for security.
 */
export function hashDeviceFingerprint(fingerprint: DeviceFingerprint): string {
    const str = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Compare two device fingerprints to detect device changes
 * 
 * Returns a similarity score (0-1) where 1 is identical
 */
export function compareFingerprints(
    fp1: DeviceFingerprint,
    fp2: DeviceFingerprint
): number {
    let matches = 0;
    let total = 0;

    const compare = (key: keyof DeviceFingerprint) => {
        total++;
        if (fp1[key] === fp2[key]) {
            matches++;
        }
    };

    compare('screenResolution');
    compare('timezone');
    compare('language');
    compare('platform');
    compare('hardwareConcurrency');
    compare('colorDepth');
    compare('pixelRatio');
    compare('touchSupport');
    compare('cookieEnabled');

    // User agent comparison (partial match)
    if (fp1.userAgent && fp2.userAgent) {
        total++;
        // Compare browser family (simplified)
        const ua1 = fp1.userAgent.toLowerCase();
        const ua2 = fp2.userAgent.toLowerCase();
        if (
            (ua1.includes('chrome') && ua2.includes('chrome')) ||
            (ua1.includes('firefox') && ua2.includes('firefox')) ||
            (ua1.includes('safari') && ua2.includes('safari')) ||
            (ua1.includes('edge') && ua2.includes('edge'))
        ) {
            matches++;
        }
    }

    return total > 0 ? matches / total : 0;
}

