import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '@/constants/env';
import { logger } from '@/utils/logger';
import { storage } from './storage';
import type { Course } from '@/types/course';

const CACHE_KEY_PREFIX = 'ai_rec_v1_';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

export interface Recommendation {
  title: string;
  reason: string;
}

/**
 * Get top picks for the Home screen based on interests
 */
export async function getRecommendations(userInterests: string[], allCourses: Course[]): Promise<string> {
  const cacheKey = `${CACHE_KEY_PREFIX}home_${userInterests.sort().join('_')}`;
  
  try {
    const cachedData = await storage.get(cacheKey) as { text: string; timestamp: number } | null;
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.text;
    }

    const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Recommend exactly 3 courses from this list matching interests: ${userInterests.join(', ')}.
      List: ${allCourses.map(c => `${c.title} (${c.category})`).join(', ')}.
      Format: "Course Title: Short exciting reason"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    await storage.set(cacheKey, { text, timestamp: Date.now() });
    return text;
  } catch (error) {
    logger.error('AI Home Recs failed:', error);
    throw error;
  }
}

/**
 * Get similar courses for the Course Details screen
 */
export async function getSimilarCourses(courseId: string, title: string, category: string): Promise<Recommendation[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}sim_${courseId}`;
  
  try {
    const cachedData = await storage.get(cacheKey) as { data: Recommendation[]; timestamp: number } | null;
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.data;
    }

    const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Suggest 2 courses similar to "${title}" (Category: ${category}).
      Return ONLY a JSON array of objects: [{"title": "Course Name", "reason": "Short reason"}]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(text) as Recommendation[];
    
    await storage.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    logger.error('AI Similar Recs failed:', error);
    return [];
  }
}
