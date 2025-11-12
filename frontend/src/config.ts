// API Configuration
export const API_CONFIG = {
    // Use mock data if backend URL not set
    USE_MOCK_DATA: !import.meta.env.VITE_API_URL,
    API_URL: import.meta.env.VITE_API_URL || '/api',
    API_KEY: import.meta.env.VITE_API_KEY || 'dev_key_12345'
};

// Mock data for demo
export const MOCK_SESSIONS = [
    {
        session_id: 'demo-001',
        user_id: 'demo-alice',
        trust_score: 92,
        is_anomaly: 0,
        created_at: Date.now() - 120000,
        scored_at: Date.now() - 120000,
        events: JSON.stringify([
            { type: 'keydown', timestamp: Date.now(), keyClass: 'letter' }
        ])
    },
    {
        session_id: 'demo-002',
        user_id: 'demo-bob',
        trust_score: 45,
        is_anomaly: 1,
        created_at: Date.now() - 45000,
        scored_at: Date.now() - 45000,
        events: JSON.stringify([
            { type: 'keydown', timestamp: Date.now(), keyClass: 'letter' }
        ])
    },
    {
        session_id: 'demo-003',
        user_id: 'demo-charlie',
        trust_score: 88,
        is_anomaly: 0,
        created_at: Date.now() - 30000,
        scored_at: Date.now() - 30000,
        events: JSON.stringify([
            { type: 'keydown', timestamp: Date.now(), keyClass: 'letter' }
        ])
    }
];

export const MOCK_ENROLLMENT = {
    success: true,
    message: 'Demo enrollment successful! In production, this would store your behavioral profile.'
};

export const MOCK_SCORE_RESULT = {
    trustScore: 88,
    isAnomaly: false,
    topReasons: [
        {
            code: 'FLIGHT_TIME_NORMAL',
            message: 'Flight time is within normal range',
            feature: 'meanFlight',
            zscore: 0.3
        },
        {
            code: 'HOLD_TIME_NORMAL',
            message: 'Hold time matches your baseline',
            feature: 'meanHold',
            zscore: -0.1
        }
    ],
    aiAnalysis: '🤖 This session shows legitimate user behavior with consistent typing patterns. Trust score of 88/100 indicates normal authentication. Recommended action: Allow access.',
    aiExplanation: null
};

export const MOCK_ATTACK_RESULT = {
    trustScore: 23,
    isAnomaly: true,
    topReasons: [
        {
            code: 'FLIGHT_TIME_HIGH',
            message: 'Flight time is 3.2 standard deviations above normal',
            feature: 'meanFlight',
            zscore: 3.2
        },
        {
            code: 'TYPING_SPEED_ANOMALY',
            message: 'Typing speed is unusually fast',
            feature: 'totalKeys',
            zscore: 2.8
        }
    ],
    aiAnalysis: '🚨 This session exhibits bot-like behavior with unnaturally consistent timing patterns. Trust score of 23/100 indicates high risk. Recommended action: Block session and require additional verification.',
    aiExplanation: 'Your typing pattern was very different from your normal behavior. This could mean someone else is trying to access your account, or you\'re using a different device. For security, we recommend additional verification.'
};
