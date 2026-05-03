import { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, RefreshControl, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
// @ts-expect-error Missing types for lodash.debounce
import debounce from 'lodash.debounce';
import { LinearGradient } from 'expo-linear-gradient';
import { CourseCard } from '@/components/CourseCard';
import { CourseCardSkeleton } from '@/components/SkeletonLoader';
import { SearchBar } from '@/components/SearchBar';
import { HomeAIRecommendations } from '@/components/HomeAIRecommendations';
import { useCourseStore } from '@/store/courseStore';
import { trackScreen } from '@/services/analytics';
import type { Course } from '@/types/course';

function EmptyState({ query }: { query: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
      <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No results found</Text>
      <Text style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 }}>
        {query
          ? `We couldn't find any courses matching "${query}". Try adjusting your search.`
          : 'No courses are available right now. Pull down to refresh the catalog.'}
      </Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { courses, isLoading, isRefreshing, error, fetchCourses, refreshCourses, toggleBookmark } =
    useCourseStore();

  useEffect(() => {
    fetchCourses();
    trackScreen('Home');
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((text: string) => setDebouncedQuery(text), 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return courses;
    const q = debouncedQuery.toLowerCase();
    return courses.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [courses, debouncedQuery]);

  const handlePress = useCallback((id: string) => {
    router.push(`/course/${id}` as any);
  }, [router]);

  const handleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item, index }: { item: Course; index: number }) => (
    <CourseCard course={item} onPress={handlePress} onBookmark={handleBookmark} index={index} />
  ), [handlePress, handleBookmark]);

  const keyExtractor = useCallback((item: Course) => item.id, []);

  if (isLoading && courses.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#4F46E5', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16 }}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Explore Courses</Text>
        </LinearGradient>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <StatusBar barStyle="light-content" />
      <FlashList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // @ts-expect-error FlashList types differ in Expo 55
        estimatedItemSize={340}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <LinearGradient
              colors={['#4F46E5', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
            >
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
                Find Your Next Skill
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>
                Top instructors. Endless possibilities.
              </Text>
            </LinearGradient>
            
            {/* AI Top Picks — above search so they appear near the top of the feed */}
            {!debouncedQuery.trim() ? <HomeAIRecommendations /> : null}

            <View
              style={{
                paddingHorizontal: 16,
                marginTop: debouncedQuery.trim() ? -25 : 8,
                marginBottom: 8,
              }}
            >
              <SearchBar value={query} onChange={handleSearchChange} />
              {error ? (
                <Text style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{error}</Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={<EmptyState query={debouncedQuery} />}
        onRefresh={refreshCourses}
        refreshing={isRefreshing}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
