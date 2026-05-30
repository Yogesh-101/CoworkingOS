const GEMINI_MODEL = 'gemini-2.0-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export function isGeminiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
}

export function getGeminiApiKey(): string | undefined {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  return key || undefined;
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
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  const contents: GeminiContent[] = [
    ...(options.history ?? []),
    { role: 'user', parts: [{ text: options.userMessage }] },
  ];

  const response = await fetch(
    `${API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: options.systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.65,
          maxOutputTokens: options.maxOutputTokens ?? 512,
        },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }
  return text;
}
