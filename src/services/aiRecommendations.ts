import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '@/constants/env';
import { logger } from '@/utils/logger';
import { storage } from './storage';
import type { Course } from '@/types/course';

/** Try in order — API availability varies by key/region; first success wins. */
const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-1.5-flash-002',
  'gemini-flash-latest',
] as const;

const CACHE_KEY_PREFIX = 'ai_rec_v2_';
/** Course-detail similar recs — longer cache is fine. */
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour
/** Home picks — shorter TTL so rotation + refresh feel fresh. */
const HOME_CACHE_EXPIRY_MS = 12 * 60 * 1000; // 12 min
/** New cache bucket periodically so the same interests still get new AI picks. */
const HOME_ROTATION_SLOT_MS = 15 * 60 * 1000; // 15 min

export interface Recommendation {
  title: string;
  reason: string;
}

function normalizeInterestTags(input: string[] | string | undefined | null): string[] {
  if (Array.isArray(input)) {
    return [...new Set(input.filter(Boolean).map(String))];
  }
  if (input == null || input === '') return [];
  return [String(input)];
}

function parseRecommendationList(text: string): Recommendation[] {
  const normalize = (raw: string): Recommendation[] => {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleaned) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (item): item is Recommendation =>
          !!item &&
          typeof item === 'object' &&
          'title' in item &&
          'reason' in item &&
          typeof (item as Recommendation).title === 'string' &&
          typeof (item as Recommendation).reason === 'string'
      )
      .slice(0, 5);
  };

  const chunks = [text];
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch && arrayMatch[0] !== text) {
    chunks.push(arrayMatch[0]);
  }

  for (const chunk of chunks) {
    try {
      const out = normalize(chunk);
      if (out.length) return out;
    } catch {
      continue;
    }
  }
  return [];
}

async function generateTextFromGemini(
  prompt: string,
  generationConfig?: { temperature?: number }
): Promise<string> {
  const key = ENV.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(key);
  let lastError: unknown;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(generationConfig ? { generationConfig } : {}),
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      lastError = e;
      logger.warn(`Gemini model ${modelName} failed, trying next`, e);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function catalogFingerprint(courses: Course[]): string {
  const ids = courses.map(c => c.id).sort();
  let h = 2166136261;
  for (const id of ids) {
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return `${courses.length}_${(h >>> 0).toString(36)}`;
}

export type HomeRecommendationsOptions = {
  /** Increments when the user pulls to refresh the catalog — forces new picks. */
  refreshNonce?: number;
};

/**
 * Get top picks for the Home screen based on interests
 */
export async function getRecommendations(
  userInterests: string[] | string | undefined | null,
  allCourses: Course[],
  options?: HomeRecommendationsOptions
): Promise<Recommendation[]> {
  const interests = normalizeInterestTags(userInterests);
  const tagsForKey = [...interests].sort().join('_');
  const catalogFp = catalogFingerprint(allCourses);
  const rotationSlot = Math.floor(Date.now() / HOME_ROTATION_SLOT_MS);
  const nonce = options?.refreshNonce ?? 0;
  const cacheKey = `${CACHE_KEY_PREFIX}home_${tagsForKey}_${catalogFp}_r${rotationSlot}_n${nonce}`;

  if (!allCourses.length) {
    return [];
  }

  if (!ENV.GEMINI_API_KEY?.trim()) {
    logger.warn('AI Home Recs skipped: no GEMINI_API_KEY');
    return [];
  }

  try {
    const cachedData = await storage.get(cacheKey) as { data: Recommendation[]; timestamp: number } | null;
    if (cachedData?.data && Date.now() - cachedData.timestamp < HOME_CACHE_EXPIRY_MS) {
      return cachedData.data;
    }

    const interestLine =
      interests.length > 0 ? interests.join(', ') : 'general learning and discovery';

    const diversityHint =
      rotationSlot % 3 === 0
        ? 'Include at least one course whose category differs from the main interest if it still helps the learner grow.'
        : rotationSlot % 3 === 1
          ? 'Favor a mix of foundational and stretch courses—not only the most obvious matches.'
          : 'Highlight one pick that complements the others (e.g. adjacent skill or format).';

    const prompt = `
      From this course catalog, pick exactly 3 courses that best match these learner interests: ${interestLine}.
      Only choose titles that appear in the catalog list.
      ${diversityHint}
      Vary your trio when several courses are equally good—do not always default to the same obvious choices.

      Catalog:
      ${allCourses.map(c => `- ${c.title} (${c.category})`).join('\n')}

      Return ONLY a JSON array (no markdown): [{"title": "Exact course title from catalog", "reason": "One short engaging sentence"}]
    `;

    const text = await generateTextFromGemini(prompt, { temperature: 0.9 });
    const data = parseRecommendationList(text);
    if (data.length) {
      await storage.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  } catch (error) {
    logger.error('AI Home Recs failed:', error);
    throw error;
  }
}

/**
 * Get similar courses for the Course Details screen (titles must exist in catalog).
 */
export async function getSimilarCourses(
  courseId: string,
  title: string,
  category: string,
  allCourses: Course[]
): Promise<Recommendation[]> {
  const cacheKey = `${CACHE_KEY_PREFIX}sim_${courseId}`;
  const catalog = allCourses.filter(c => c.id !== courseId);

  if (!catalog.length) {
    return [];
  }

  if (!ENV.GEMINI_API_KEY?.trim()) {
    logger.warn('AI Similar Recs skipped: no GEMINI_API_KEY');
    return [];
  }

  try {
    const cachedData = await storage.get(cacheKey) as { data: Recommendation[]; timestamp: number } | null;
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.data;
    }

    const prompt = `
      The learner is viewing "${title}" (${category}).
      Pick exactly 2 other courses from the catalog below that are the best follow-ups (similar topic, skill level, or career path).
      Do not recommend "${title}". Use each course's exact title string from the list.

      Catalog:
      ${catalog.map(c => `- ${c.title} (${c.category})`).join('\n')}

      Return ONLY a JSON array (no markdown): [{"title": "Exact title from catalog", "reason": "One short sentence why it fits"}]
    `;

    const text = await generateTextFromGemini(prompt);
    const data = parseRecommendationList(text).slice(0, 2);

    if (data.length) {
      await storage.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  } catch (error) {
    logger.error('AI Similar Recs failed:', error);
    return [];
  }
}
