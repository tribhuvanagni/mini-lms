import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '@/constants/env';
import { logger } from '@/utils/logger';
import { storage } from './storage';
import type { Course } from '@/types/course';

const CACHE_KEY_PREFIX = 'ai_rec_v1_';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export async function getRecommendations(userInterests: string[], allCourses: Course[]): Promise<string> {
  const cacheKey = `${CACHE_KEY_PREFIX}${userInterests.sort().join('_')}`;
  
  try {
    // Check local cache first to save Gemini quota
    const cachedData = await storage.get(cacheKey) as { text: string; timestamp: number } | null;
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      logger.log('[AI] Using cached recommendations');
      return cachedData.text;
    }

    const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert education advisor for "Mini LMS".
      User interests: ${userInterests.join(', ')}
      
      Available courses:
      ${allCourses.map(c => `- ${c.title} (Category: ${c.category}, ID: ${c.id})`).join('\n')}

      Task: Recommend exactly 3 courses from the list above that best match the user's interests.
      Explain WHY in one short, exciting sentence.
      Format: "Course Title: Explanation"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Store in cache for 1 hour
    await storage.set(cacheKey, { text, timestamp: Date.now() });
    
    return text;
  } catch (error) {
    logger.error('AI Recommendations failed:', error);
    throw error;
  }
}
