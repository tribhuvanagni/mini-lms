import { useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '@/components/CourseCard';
import { useCourseStore, selectBookmarked } from '@/store/courseStore';
import type { Course } from '@/types/course';

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Text className="text-4xl mb-4">☆</Text>
      <Text className="text-textPrimary text-lg font-semibold mb-2">Nothing saved yet</Text>
      <Text className="text-textSecondary text-sm text-center px-8">
        Bookmark courses to find them here.
      </Text>
    </View>
  );
}

export default function Bookmarks() {
  const router = useRouter();
  const bookmarked = useCourseStore(selectBookmarked);
  const toggleBookmark = useCourseStore(s => s.toggleBookmark);

  const handlePress = useCallback((id: string) => {
    router.push(`/course/${id}` as any);
  }, [router]);

  const handleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handlePress} onBookmark={handleBookmark} />
  ), [handlePress, handleBookmark]);

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary">
      <FlatList
        data={bookmarked}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            <Text className="text-textPrimary text-2xl font-bold mb-4">Saved</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
