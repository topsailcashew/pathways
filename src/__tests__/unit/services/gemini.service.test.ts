import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '@/services/gemini.service';

global.fetch = vi.fn();

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Gemini API with correct parameters', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'AI response' }],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geminiService.generateText('Test prompt');

    expect(result).toBe('AI response');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should handle JSON mode', async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: '{"result": "data"}' }],
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geminiService.generateJSON('Test prompt');

    expect(result).toEqual({ result: 'data' });
  });
});
