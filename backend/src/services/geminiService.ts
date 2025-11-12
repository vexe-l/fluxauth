import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeSessionWithAI(sessionData: {
    userId: string;
    trustScore: number;
    isAnomaly: boolean;
    features: any;
    topReasons: any[];
}) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a cybersecurity AI analyzing a behavioral authentication session.

Session Data:
- User ID: ${sessionData.userId}
- Trust Score: ${sessionData.trustScore}/100
- Anomaly Detected: ${sessionData.isAnomaly ? 'YES' : 'NO'}
- Behavioral Features: ${JSON.stringify(sessionData.features, null, 2)}
- Top Anomaly Reasons: ${JSON.stringify(sessionData.topReasons, null, 2)}

Provide a concise security analysis in 2-3 sentences:
1. Is this likely a legitimate user or potential threat?
2. What specific behavioral patterns are concerning (if any)?
3. Recommended action (allow, require MFA, or block)?

Keep response under 100 words, professional tone.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini AI analysis failed:', error);
        return null;
    }
}

export async function generateThreatReport(sessions: any[]) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const anomalySessions = sessions.filter(s => s.is_anomaly);
        const avgTrustScore = sessions.reduce((sum, s) => sum + (s.trust_score || 0), 0) / sessions.length;

        const prompt = `You are a cybersecurity analyst reviewing authentication data.

Summary:
- Total Sessions: ${sessions.length}
- Anomalies Detected: ${anomalySessions.length}
- Average Trust Score: ${avgTrustScore.toFixed(1)}/100
- Anomaly Rate: ${((anomalySessions.length / sessions.length) * 100).toFixed(1)}%

Generate a brief security report (3-4 sentences):
1. Overall security posture
2. Notable patterns or concerns
3. Recommended actions

Professional, concise, actionable.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini threat report failed:', error);
        return null;
    }
}

export async function explainAnomalyToUser(anomalyReasons: any[]) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Explain these behavioral authentication anomalies to a non-technical user in simple terms:

${JSON.stringify(anomalyReasons, null, 2)}

Provide a friendly, clear explanation (2-3 sentences) of:
1. What was unusual about their typing/behavior
2. Why this matters for security
3. What they should do

Use simple language, no jargon. Be reassuring but clear.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini explanation failed:', error);
        return null;
    }
}
