import axios from 'axios';
import { ENV } from '@/constants/env';
import { storage } from '@/services/storage';
import { logger } from '@/utils/logger';

export interface Recommendation {
  title: string;
  reason: string;
}

const CACHE_PREFIX = 'ai_recs_';

export async function getRecommendations(
  courseId: string,
  title: string,
  category: string
): Promise<Recommendation[]> {
  if (!ENV.OPENAI_API_KEY) return [];

  // check cache first
  const cached = storage.get<Recommendation[]>(`${CACHE_PREFIX}${courseId}`);
  if (cached?.length) return cached;

  try {
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a course recommendation engine. Given a course title and category, suggest 3 related courses. Return a JSON array of objects with "title" and "reason" keys. Keep reasons under 15 words. Return ONLY the JSON array, no markdown.',
          },
          {
            role: 'user',
            content: `Course: ${title}, Category: ${category}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 8_000,
      }
    );

    const content = data.choices?.[0]?.message?.content ?? '';
    // strip markdown fences if the model wraps it
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as Recommendation[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      storage.set(`${CACHE_PREFIX}${courseId}`, parsed);
      return parsed;
    }
    return [];
  } catch (err) {
    logger.warn('AI recommendations failed:', err);
    return [];
  }
}
