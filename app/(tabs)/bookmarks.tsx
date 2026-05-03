import { useCallback, useMemo } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { CourseCard } from '@/components/CourseCard';
import { useCourseStore } from '@/store/courseStore';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import type { Course } from '@/types/course';

function EmptyState({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
      <Text style={{ fontSize: 48, marginBottom: 16, color: colors.textSecondary }}>☆</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>No saved courses yet</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: 32 }}>
        Courses you bookmark will appear here so you can access them quickly later.
      </Text>
    </View>
  );
}

export default function Bookmarks() {
  const router = useRouter();
  const courses = useCourseStore(s => s.courses);
  const bookmarked = useMemo(() => courses.filter(c => c.isBookmarked), [courses]);
  const toggleBookmark = useCourseStore(s => s.toggleBookmark);
  const colors = useThemeColors();
  const isDark = useIsDark();

  const handlePress = useCallback((id: string) => {
    router.push(`/course/${id}` as any);
  }, [router]);

  const handleBookmark = useCallback((id: string) => {
    toggleBookmark(id);
  }, [toggleBookmark]);

  const renderItem = useCallback(({ item }: { item: Course }) => (
    <CourseCard 
      course={item} 
      onPress={handlePress} 
      onBookmark={handleBookmark} 
      showRemoveButton 
    />
  ), [handlePress, handleBookmark]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <FlashList
        data={bookmarked}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // @ts-expect-error FlashList types differ in Expo 55
        estimatedItemSize={340}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <LinearGradient
            colors={['#4F46E5', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Saved Courses</Text>
          </LinearGradient>
        }
        ListEmptyComponent={<EmptyState colors={colors} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
