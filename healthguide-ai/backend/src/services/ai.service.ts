import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { AIAnalysisResult, SymptomCheckInput } from '../types';

const client = env.AI_MOCK || !env.ANTHROPIC_API_KEY ? null : new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

async function callGroq(prompt: string): Promise<string> {
  if (!env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a medical information assistant. Output ONLY valid JSON. Do not include markdown or backticks.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned empty content');
  }
  return content;
}

function buildMockAnalysis(input: SymptomCheckInput, reason: string): AIAnalysisResult {
  const symptomsLower = input.symptoms.map((s) => s.toLowerCase());
  const hasEmergencySymptom = symptomsLower.some((s) =>
    [
      'chest pain',
      'shortness of breath',
      'difficulty breathing',
      'fainting',
      'severe bleeding',
      'stroke',
      'seizure',
      'unconscious',
    ].some((k) => s.includes(k))
  );

  const urgencyLevel: AIAnalysisResult['urgencyLevel'] = hasEmergencySymptom
    ? 'emergency'
    : input.severity === 'severe'
      ? 'high'
      : input.severity === 'moderate'
        ? 'moderate'
        : 'low';

  const summary = `This is a fallback (mock) analysis because the AI service is unavailable (${reason}). ` +
    `Based on the reported symptoms (${input.symptoms.join(', ')}), here are general possibilities and next steps.`;

  return {
    summary,
    possibleConditions: [
      {
        name: 'Viral infection / common cold',
        likelihood: 'medium' as const,
        description: 'Many symptom combinations (fever, fatigue, sore throat, cough, body aches) can fit a self-limited viral illness.',
      },
      {
        name: 'Dehydration / heat-related illness',
        likelihood: 'low' as const,
        description: 'Headache, dizziness, fatigue can worsen with low fluid intake, especially with fever or diarrhea.',
      },
    ].slice(0, 2),
    recommendations: [
      'Rest and stay hydrated; consider oral rehydration if you have vomiting/diarrhea.',
      'Track temperature and symptoms; avoid strenuous activity until improving.',
      'If symptoms worsen, new severe symptoms appear, or you are high-risk, seek medical advice.',
    ],
    urgencyLevel,
    urgencyExplanation:
      urgencyLevel === 'emergency'
        ? 'Some symptoms can indicate a medical emergency. Seek urgent care immediately.'
        : urgencyLevel === 'high'
          ? 'Symptoms are severe; consider same-day medical evaluation.'
          : urgencyLevel === 'moderate'
            ? 'Consider seeing a clinician soon, especially if symptoms persist or worsen.'
            : 'Symptoms may be monitored at home if mild and improving.',
    disclaimer:
      'This tool provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment.',
    whenToSeeDoctor: [
      'If you have trouble breathing, chest pain, confusion, fainting, or severe weakness',
      'If fever is very high, lasts more than 3 days, or symptoms rapidly worsen',
      'If you are pregnant, immunocompromised, very young/old, or have serious chronic illness',
    ],
    selfCareTips: [
      'Drink fluids regularly; aim for pale yellow urine.',
      'Use acetaminophen/ibuprofen as appropriate for fever/pain (if safe for you).',
      'Get plenty of rest and light, nutritious meals.',
    ],
  };
}

export async function analyzeSymptoms(input: SymptomCheckInput): Promise<AIAnalysisResult> {
  if (env.AI_MOCK) {
    return buildMockAnalysis(input, 'AI_MOCK=true');
  }

  const contextParts: string[] = [];

  if (input.age) contextParts.push(`Age: ${input.age}`);
  if (input.gender) contextParts.push(`Gender: ${input.gender}`);
  if (input.severity) contextParts.push(`Severity: ${input.severity}`);
  if (input.duration) contextParts.push(`Duration: ${input.duration}`);

  const context = contextParts.length > 0 ? `\nPatient context:\n${contextParts.join('\n')}` : '';
  const symptomsList = input.symptoms.join(', ');

  const prompt = `You are a medical information assistant. A user is reporting the following symptoms: ${symptomsList}.${context}

Analyze these symptoms and provide a structured JSON response. Be informative but always remind users to consult healthcare professionals.

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "Brief 2-3 sentence overview of the symptom pattern",
  "possibleConditions": [
    {
      "name": "Condition name",
      "likelihood": "low|medium|high",
      "description": "Brief explanation of why this condition matches the symptoms"
    }
  ],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "urgencyLevel": "low|moderate|high|emergency",
  "urgencyExplanation": "Why this urgency level was assigned",
  "disclaimer": "Medical disclaimer statement",
  "whenToSeeDoctor": ["Situation 1 that warrants medical attention", "Situation 2"],
  "selfCareTips": ["Self-care tip 1", "Self-care tip 2"]
}

Rules:
- List 2-4 possible conditions ordered by likelihood
- Urgency: low=monitor at home, moderate=see doctor soon, high=see doctor today, emergency=go to ER now
- Always include a disclaimer about not replacing professional medical advice
- Be factual, compassionate, and clear`;

  // Prefer Groq if configured; otherwise use Anthropic if available.
  if (env.GROQ_API_KEY) {
    try {
      const content = await callGroq(prompt);
      const result = JSON.parse(content) as AIAnalysisResult;
      return result;
    } catch (err: unknown) {
      const reason = (err as { message?: string })?.message?.slice(0, 160) ?? 'Groq error';
      return buildMockAnalysis(input, reason);
    }
  }

  if (!client) {
    return buildMockAnalysis(input, 'missing AI provider key');
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    const jsonText = content.text.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(jsonText) as AIAnalysisResult;

    return result;
  } catch (err: unknown) {
    const reason =
      (err as { message?: string })?.message?.slice(0, 160) ??
      'Unknown AI error';
    return buildMockAnalysis(input, reason);
  }
}
