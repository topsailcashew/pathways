import { GeminiResponse } from '@types/api';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash-exp';

interface GenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseFormat?: 'text' | 'json';
}

export const geminiService = {
  async generateText(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<string> {
    const response = await this.callAPI(prompt, { ...options, responseFormat: 'text' });
    return this.extractText(response);
  },

  async generateJSON<T = any>(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<T> {
    const response = await this.callAPI(prompt, { ...options, responseFormat: 'json' });
    const text = this.extractText(response);
    return JSON.parse(text) as T;
  },

  async callAPI(prompt: string, options: GenerateOptions): Promise<GeminiResponse> {
    const endpoint = options.responseFormat === 'json'
      ? `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`
      : `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

    const body: any = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
      },
    };

    if (options.responseFormat === 'json') {
      body.generationConfig.responseMimeType = 'application/json';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message ?? 'Unknown error'}`);
    }

    return response.json();
  },

  extractText(response: GeminiResponse): string {
    const candidate = response.candidates[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('No text in Gemini response');
    }
    return candidate.content.parts[0].text;
  },
};
