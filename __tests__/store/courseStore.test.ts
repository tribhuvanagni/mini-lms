jest.mock('../../src/services/storage', () => ({
  storage: { get: jest.fn().mockReturnValue(null), set: jest.fn(), remove: jest.fn(), clear: jest.fn() },
  STORAGE_KEYS: { COURSES: 'courses_v1', BOOKMARKS: 'bookmark_ids_v1', ENROLLED: 'enrolled_ids_v1', USER_PROFILE: 'user_profile_v1', PREFS: 'user_prefs_v1' },
}));
jest.mock('../../src/api/courses', () => ({ coursesApi: { getInstructors: jest.fn(), getProducts: jest.fn() } }));
jest.mock('../../src/services/notifications', () => ({ notifyBookmarkMilestone: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../src/utils/courseMapper', () => ({ mergeCourses: jest.fn() }));

import { useCourseStore } from '../../src/store/courseStore';
import { storage } from '../../src/services/storage';
import { coursesApi } from '../../src/api/courses';
import { notifyBookmarkMilestone } from '../../src/services/notifications';
import { mergeCourses } from '../../src/utils/courseMapper';

const fakeCourse = (id: string, ov = {}) => ({ id, title: `Course ${id}`, description: 'desc', thumbnail: '', price: 29, rating: 4.5, category: 'Tech', stock: 10, instructor: { id: 'i1', name: 'John', avatar: '', email: '', location: '' }, isBookmarked: false, isEnrolled: false, progress: 0, ...ov });

beforeEach(() => { useCourseStore.setState({ courses: [], bookmarkIds: new Set(), enrolledIds: new Set(), isLoading: false, isRefreshing: false, error: null, lastFetched: null }); jest.clearAllMocks(); });

describe('courseStore', () => {
  it('fetches and merges courses', async () => {
    (coursesApi.getInstructors as jest.Mock).mockResolvedValue({ data: { data: { data: [] } } });
    (coursesApi.getProducts as jest.Mock).mockResolvedValue({ data: { data: { data: [] } } });
    (mergeCourses as jest.Mock).mockReturnValue([fakeCourse('1')]);
    await useCourseStore.getState().fetchCourses(true);
    expect(useCourseStore.getState().courses).toHaveLength(1);
  });

  it('skips fetch if fresh', async () => {
    useCourseStore.setState({ courses: [fakeCourse('1')], lastFetched: Date.now() });
    await useCourseStore.getState().fetchCourses(false);
    expect(coursesApi.getInstructors).not.toHaveBeenCalled();
  });

  it('toggles bookmark', () => {
    useCourseStore.setState({ courses: [fakeCourse('1')] });
    useCourseStore.getState().toggleBookmark('1');
    expect(useCourseStore.getState().bookmarkIds.has('1')).toBe(true);
  });

  it('fires notification on 5th bookmark', () => {
    useCourseStore.setState({ courses: [fakeCourse('5')], bookmarkIds: new Set(['1','2','3','4']) });
    useCourseStore.getState().toggleBookmark('5');
    expect(notifyBookmarkMilestone).toHaveBeenCalledWith(5);
  });

  it('enrolls course', () => {
    useCourseStore.setState({ courses: [fakeCourse('1')] });
    useCourseStore.getState().enroll('1');
    expect(useCourseStore.getState().enrolledIds.has('1')).toBe(true);
  });

  it('clamps progress 0-100', () => {
    useCourseStore.setState({ courses: [fakeCourse('1')] });
    useCourseStore.getState().updateProgress('1', 150);
    expect(useCourseStore.getState().courses[0]!.progress).toBe(100);
  });

  it('hydrates from cache', async () => {
    // hydrate() reads: BOOKMARKS → ENROLLED → COURSES (must match this order)
    (storage.get as jest.Mock)
      .mockResolvedValueOnce(['1'])          // BOOKMARKS
      .mockResolvedValueOnce([])             // ENROLLED
      .mockResolvedValueOnce([fakeCourse('1')]); // COURSES
    await useCourseStore.getState().hydrate();
    expect(useCourseStore.getState().courses[0]!.isBookmarked).toBe(true);
  });
});
