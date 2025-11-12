import { PolicyAction } from './policyEngine';

export interface WebhookConfig {
    url: string;
    events: string[];
    secret?: string;
}

export interface WebhookPayload {
    event: string;
    userId?: string;
    sessionId?: string;
    trustScore?: number;
    isAnomaly?: boolean;
    timestamp: string;
    data?: any;
}

/**
 * Send webhook notification
 */
export async function sendWebhook(config: WebhookConfig, payload: WebhookPayload): Promise<void> {
    if (!config.events.includes(payload.event)) {
        return; // Event not subscribed
    }

    try {
        const body = JSON.stringify(payload);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'FluxAuth-Webhook/1.0'
        };

        // Add signature if secret is configured
        if (config.secret) {
            const crypto = await import('crypto');
            const signature = crypto.createHmac('sha256', config.secret)
                .update(body)
                .digest('hex');
            headers['X-FluxAuth-Signature'] = signature;
        }

        const response = await fetch(config.url, {
            method: 'POST',
            headers,
            body,
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
            console.error(`Webhook failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Webhook delivery failed:', error);
        // Don't throw - webhook failures shouldn't break the main flow
    }
}

/**
 * Get webhook configuration from environment or database
 */
export function getWebhookConfig(): WebhookConfig | null {
    const webhookUrl = process.env.WEBHOOK_URL;
    const webhookEvents = process.env.WEBHOOK_EVENTS?.split(',') || [];
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookUrl || webhookEvents.length === 0) {
        return null;
    }

    return {
        url: webhookUrl,
        events: webhookEvents,
        secret: webhookSecret
    };
}

/**
 * Trigger webhook for an event
 */
export async function triggerWebhook(
    event: string,
    data: {
        userId?: string;
        sessionId?: string;
        trustScore?: number;
        isAnomaly?: boolean;
        policyAction?: PolicyAction;
        [key: string]: any;
    }
): Promise<void> {
    const config = getWebhookConfig();
    if (!config) {
        return; // No webhook configured
    }

    const payload: WebhookPayload = {
        event,
        userId: data.userId,
        sessionId: data.sessionId,
        trustScore: data.trustScore,
        isAnomaly: data.isAnomaly,
        timestamp: new Date().toISOString(),
        data
    };

    await sendWebhook(config, payload);
}

