import { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '@/components/CourseCard';
import { CourseCardSkeleton } from '@/components/SkeletonLoader';
import { SearchBar } from '@/components/SearchBar';
import { useCourseStore } from '@/store/courseStore';
import type { Course } from '@/types/course';

function EmptyState({ query }: { query: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-4xl mb-4">🔍</Text>
      <Text className="text-textPrimary text-lg font-semibold mb-2">No results</Text>
      <Text className="text-textSecondary text-sm text-center px-8">
        {query
          ? `Nothing matching "${query}". Try a different search.`
          : 'No courses available right now. Pull down to refresh.'}
      </Text>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { courses, isLoading, isRefreshing, error, fetchCourses, refreshCourses, toggleBookmark } =
    useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return courses;
    const q = query.toLowerCase();
    return courses.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [courses, query]);

  const handlePress = useCallback((id: string) => {
    router.push(`/course/${id}` as any);
  }, [router]);

  const handleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handlePress} onBookmark={handleBookmark} />
  ), [handlePress, handleBookmark]);

  const keyExtractor = useCallback((item: Course) => item.id, []);

  if (isLoading && courses.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-bgPrimary px-4 pt-4">
        <Text className="text-textPrimary text-2xl font-bold mb-4">Explore</Text>
        {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary">
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            <Text className="text-textPrimary text-2xl font-bold mb-4">Explore</Text>
            {error ? (
              <Text className="text-danger text-sm mb-3">{error}</Text>
            ) : null}
            <SearchBar value={query} onChange={setQuery} />
          </View>
        }
        ListEmptyComponent={<EmptyState query={query} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshCourses}
            tintColor="#6366f1"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
