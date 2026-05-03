import type { Course } from '@/types/course';

/** Match AI-suggested title to a catalog course (exact or partial). */
export function findCourseBySuggestedTitle(courses: Course[], suggestedTitle: string): Course | undefined {
  const t = suggestedTitle.trim().toLowerCase();
  if (!t) return undefined;
  const exact = courses.find(c => c.title.trim().toLowerCase() === t);
  if (exact) return exact;
  return courses.find(c => c.title.toLowerCase().includes(t) || t.includes(c.title.toLowerCase()));
}
