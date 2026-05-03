import { create } from 'zustand';
import { getSimilarCourses, type Recommendation } from '@/services/aiRecommendations';
import { useCourseStore } from '@/store/courseStore';

interface RecommendationState {
  recommendations: Map<string, Recommendation[]>;
  loading: Set<string>;
  fetchRecommendations: (courseId: string, title: string, category: string) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: new Map(),
  loading: new Set(),

  fetchRecommendations: async (courseId, title, category) => {
    const { recommendations, loading } = get();
    const cached = recommendations.get(courseId);
    if (cached !== undefined && cached.length > 0) return;
    if (loading.has(courseId)) return;

    const nextLoading = new Set(loading);
    nextLoading.add(courseId);
    set({ loading: nextLoading });

    try {
      const courses = useCourseStore.getState().courses;
      const recs = await getSimilarCourses(courseId, title, category, courses);
      const nextRecs = new Map(get().recommendations);
      nextRecs.set(courseId, recs);
      set({ recommendations: nextRecs });
    } catch {
      const nextRecs = new Map(get().recommendations);
      nextRecs.set(courseId, []);
      set({ recommendations: nextRecs });
    } finally {
      const doneLoading = new Set(get().loading);
      doneLoading.delete(courseId);
      set({ loading: doneLoading });
    }
  },
}));
