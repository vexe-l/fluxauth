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

export async function calculateContextualRisk(context: {
    baseTrustScore: number;
    action: string;
    location?: string;
    timeOfDay: number;
    isNewDevice: boolean;
    amountInvolved?: number;
    userHistory?: {
        avgTrustScore: number;
        typicalLoginTimes: number[];
        typicalLocations: string[];
    };
}) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a cybersecurity risk assessment AI. Calculate contextual risk for this authentication attempt.

Base Trust Score: ${context.baseTrustScore}/100
Action Type: ${context.action}
${context.location ? `Location: ${context.location}` : ''}
Time of Day: ${context.timeOfDay}:00 (24-hour format)
New Device: ${context.isNewDevice ? 'YES' : 'NO'}
${context.amountInvolved ? `Transaction Amount: $${context.amountInvolved}` : ''}

${context.userHistory ? `User's Normal Behavior:
- Average Trust Score: ${context.userHistory.avgTrustScore}/100
- Typical Login Times: ${context.userHistory.typicalLoginTimes.join(', ')}:00
- Typical Locations: ${context.userHistory.typicalLocations.join(', ')}` : ''}

Analyze and provide:
1. Adjusted Risk Score (0-100, where 100 is highest risk)
2. Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
3. Key Risk Factors (list 2-3 specific concerns)
4. Recommended Action (ALLOW/REQUIRE_MFA/BLOCK)
5. Brief Reasoning (1-2 sentences)

Consider:
- Action sensitivity (login < view < transfer < delete)
- Unusual timing or location
- New device risk
- Transaction value
- Deviation from user's normal patterns

Respond in JSON format:
{
  "adjustedRiskScore": <number>,
  "riskLevel": "<string>",
  "riskFactors": ["<factor1>", "<factor2>"],
  "recommendedAction": "<string>",
  "reasoning": "<string>"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // Fallback if JSON parsing fails
        return {
            adjustedRiskScore: context.baseTrustScore,
            riskLevel: context.baseTrustScore > 70 ? 'LOW' : context.baseTrustScore > 50 ? 'MEDIUM' : 'HIGH',
            riskFactors: ['Unable to perform detailed analysis'],
            recommendedAction: context.baseTrustScore > 70 ? 'ALLOW' : 'REQUIRE_MFA',
            reasoning: 'AI analysis unavailable, using base trust score'
        };
    } catch (error) {
        console.error('Contextual risk calculation failed:', error);
        // Fallback to simple logic
        return {
            adjustedRiskScore: context.baseTrustScore,
            riskLevel: context.baseTrustScore > 70 ? 'LOW' : context.baseTrustScore > 50 ? 'MEDIUM' : 'HIGH',
            riskFactors: ['AI service unavailable'],
            recommendedAction: context.baseTrustScore > 70 ? 'ALLOW' : 'REQUIRE_MFA',
            reasoning: 'Using base trust score due to AI service unavailability'
        };
    }
}
