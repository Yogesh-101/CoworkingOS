import { generateAiText, checkApiHealth } from '@/lib/api/client';

const GEMINI_MODEL = 'gemini-2.0-flash';

export function isGeminiConfigured(): boolean {
  return true;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function generateGeminiText(options: {
  systemInstruction: string;
  userMessage: string;
  history?: GeminiContent[];
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiUp = await checkApiHealth();
  if (apiUp) {
    return generateAiText(options);
  }

  const clientKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!clientKey) {
    throw new Error('AI service unavailable');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(clientKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.systemInstruction }] },
        contents: [
          ...(options.history ?? []),
          { role: 'user', parts: [{ text: options.userMessage }] },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.65,
          maxOutputTokens: options.maxOutputTokens ?? 512,
        },
      }),
    }
  );

  if (!response.ok) throw new Error('Gemini API error');
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) throw new Error('Empty AI response');
  return text;
}
