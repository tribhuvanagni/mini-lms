import { create } from 'zustand';
import { coursesApi } from '@/api/courses';
import { mergeCourses } from '@/utils/courseMapper';
import { storage, STORAGE_KEYS } from '@/services/storage';
import { getErrorMessage } from '@/utils/errorMessage';
import { notifyBookmarkMilestone } from '@/services/notifications';
import type { Course } from '@/types/course';

interface CourseState {
  courses: Course[];
  bookmarkIds: Set<string>;
  enrolledIds: Set<string>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetched: number | null;
  /** Bumped on catalog refresh so home AI picks are recomputed. */
  homeAiRecNonce: number;
}

interface CourseActions {
  fetchCourses: (force?: boolean) => Promise<void>;
  refreshCourses: () => Promise<void>;
  toggleBookmark: (id: string) => void;
  enroll: (id: string) => void;
  unenroll: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

const STALE_MS = 5 * 60 * 1000; // 5 min before re-fetch

export const useCourseStore = create<CourseState & CourseActions>((set, get) => ({
  courses: [],
  bookmarkIds: new Set(),
  enrolledIds: new Set(),
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetched: null,
  homeAiRecNonce: 0,

  hydrate: async () => {
    let bSet = new Set<string>();
    let eSet = new Set<string>();
    
    try {
      const rawBookmarks = await storage.get<string[]>(STORAGE_KEYS.BOOKMARKS);
      const rawEnrolled = await storage.get<string[]>(STORAGE_KEYS.ENROLLED);
      if (Array.isArray(rawBookmarks)) bSet = new Set(rawBookmarks);
      if (Array.isArray(rawEnrolled)) eSet = new Set(rawEnrolled);
    } catch (e) {
      // safe fallback
    }

    const cached = await storage.get<Course[]>(STORAGE_KEYS.COURSES);

    if (Array.isArray(cached) && cached.length > 0) {
      const hydrated = cached.map(c => ({
        ...c,
        isBookmarked: bSet.has(c.id),
        isEnrolled: eSet.has(c.id),
      }));
      set({
        courses: hydrated,
        bookmarkIds: bSet,
        enrolledIds: eSet,
      });
    }
  },

  fetchCourses: async (force = false) => {
    const { lastFetched, isLoading } = get();
    const isStale = !lastFetched || Date.now() - lastFetched > STALE_MS;

    if (!force && !isStale && get().courses.length > 0) return;
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const [usersRes, productsRes] = await Promise.all([
        coursesApi.getInstructors(20),
        coursesApi.getProducts(20),
      ]);

      const raw = mergeCourses(
        usersRes.data.data.data,
        productsRes.data.data.data
      );

      const { bookmarkIds, enrolledIds } = get();
      const merged = raw.map(c => ({
        ...c,
        isBookmarked: bookmarkIds.has(c.id),
        isEnrolled: enrolledIds.has(c.id),
      }));

      await storage.set(STORAGE_KEYS.COURSES, merged);
      set({ courses: merged, lastFetched: Date.now() });
    } catch (err) {
      set({ error: getErrorMessage(err) });
      // if we have cache, keep it visible — just show the error banner
    } finally {
      set({ isLoading: false });
    }
  },

  refreshCourses: async () => {
    set({ isRefreshing: true });
    try {
      await get().fetchCourses(true);
    } finally {
      set(s => ({
        isRefreshing: false,
        homeAiRecNonce: s.homeAiRecNonce + 1,
      }));
    }
  },

  toggleBookmark: (id) => {
    const { bookmarkIds, courses } = get();
    const next = new Set(bookmarkIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    const updated = courses.map(c =>
      c.id === id ? { ...c, isBookmarked: next.has(id) } : c
    );

    storage.set(STORAGE_KEYS.BOOKMARKS, Array.from(next));
    set({ courses: updated, bookmarkIds: next });

    // milestone check — every 5th bookmark
    if (next.has(id) && next.size % 5 === 0) {
      notifyBookmarkMilestone(next.size).catch(() => null);
    }
  },

  enroll: (id) => {
    const { enrolledIds, courses } = get();
    if (enrolledIds.has(id)) return;

    const next = new Set(enrolledIds);
    next.add(id);

    const updated = courses.map(c =>
      c.id === id ? { ...c, isEnrolled: true, enrolledAt: new Date().toISOString() } : c
    );

    storage.set(STORAGE_KEYS.ENROLLED, Array.from(next));
    set({ courses: updated, enrolledIds: next });
  },

  unenroll: (id) => {
    const { enrolledIds, courses } = get();
    if (!enrolledIds.has(id)) return;

    const next = new Set(enrolledIds);
    next.delete(id);

    const updated = courses.map(c =>
      c.id === id ? { ...c, isEnrolled: false, enrolledAt: undefined } : c
    );

    storage.set(STORAGE_KEYS.ENROLLED, Array.from(next));
    set({ courses: updated, enrolledIds: next });
  },

  updateProgress: (id, progress) => {
    const updated = get().courses.map(c =>
      c.id === id ? { ...c, progress: Math.min(100, Math.max(0, progress)) } : c
    );
    set({ courses: updated });
    storage.set(STORAGE_KEYS.COURSES, updated);
  },

  clearError: () => set({ error: null }),
}));

export const selectBookmarked = (s: CourseState) =>
  s.courses.filter(c => c.isBookmarked);

export const selectEnrolled = (s: CourseState) =>
  s.courses.filter(c => c.isEnrolled);
