import axios from 'axios';
import { ENV } from '@/constants/env';
import { storage } from '@/services/storage';
import { logger } from '@/utils/logger';

export interface Recommendation {
  title: string;
  reason: string;
}

const CACHE_PREFIX = 'ai_recs_';

/**
 * Get AI-powered course recommendations using Google Gemini (FREE tier).
 *
 * Free tier: 15 requests/min, 1M tokens/month — more than enough for a demo.
 * Get your free key at: https://aistudio.google.com/apikey
 */
export async function getRecommendations(
  courseId: string,
  title: string,
  category: string
): Promise<Recommendation[]> {
  if (!ENV.GEMINI_API_KEY) return [];

  // check cache first
  const cached = await storage.get<Recommendation[]>(`${CACHE_PREFIX}${courseId}`);
  if (cached?.length) return cached;

  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${ENV.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a course recommendation engine. Given a course title and category, suggest 3 related courses a student might enjoy.

Course: ${title}
Category: ${category}

Return ONLY a JSON array of objects with "title" and "reason" keys. Keep reasons under 15 words. No markdown, no explanation, just the JSON array.

Example format:
[{"title":"Course Name","reason":"Short reason here"}]`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      }
    );

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    // When responseMimeType is application/json, it returns raw JSON.
    // We still strip markdown fences just in case the model ignores the instruction.
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsed: Recommendation[] = [];
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      logger.warn('Failed to parse AI response:', cleaned);
      throw new Error('AI returned invalid format. Please try again.');
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      await storage.set(`${CACHE_PREFIX}${courseId}`, parsed);
      return parsed;
    }
    return [];
  } catch (err: any) {
    logger.warn('AI recommendations failed:', err);
    // Return the actual error message so we can see it on screen
    return [{
      title: "API Error Details",
      reason: err?.response?.data?.error?.message || err?.message || String(err)
    }];
  }
}
