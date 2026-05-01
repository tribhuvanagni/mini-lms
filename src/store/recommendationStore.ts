import { create } from 'zustand';
import { getRecommendations, type Recommendation } from '@/services/aiRecommendations';

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
    if (recommendations.has(courseId) || loading.has(courseId)) return;

    const nextLoading = new Set(loading);
    nextLoading.add(courseId);
    set({ loading: nextLoading });

    try {
      const recs = await getRecommendations(courseId, title, category);
      const nextRecs = new Map(get().recommendations);
      if (recs.length) nextRecs.set(courseId, recs);
      set({ recommendations: nextRecs });
    } finally {
      const doneLoading = new Set(get().loading);
      doneLoading.delete(courseId);
      set({ loading: doneLoading });
    }
  },
}));
