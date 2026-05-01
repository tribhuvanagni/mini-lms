import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { useCourseStore } from '@/store/courseStore';
import { useRecommendationStore } from '@/store/recommendationStore';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Skeleton } from '@/components/SkeletonLoader';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enroll } = useCourseStore();
  const course = courses.find(c => c.id === id);

  const { recommendations, loading: recsLoading, fetchRecommendations } = useRecommendationStore();
  const recs = id ? recommendations.get(id) ?? [] : [];
  const isRecsLoading = id ? recsLoading.has(id) : false;

  const [enrollAnim] = useState(new Animated.Value(1));
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (course) {
      fetchRecommendations(course.id, course.title, course.category);
    }
  }, [course?.id]);

  const handleEnroll = useCallback(() => {
    if (!course || course.isEnrolled) return;
    setEnrolling(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => null);

    Animated.sequence([
      Animated.timing(enrollAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(enrollAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      enroll(course.id);
      setEnrolling(false);
    }, 600);
  }, [course, enroll, enrollAnim]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-bgPrimary items-center justify-center">
        <Text className="text-textSecondary">Course not found.</Text>
        <Button label="Go back" variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: course.thumbnail }}
          style={{ width: '100%', height: 220 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        <View className="px-5 pt-5 pb-10">
          {/* category + rating */}
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-medium">{course.category}</Text>
            </View>
            <Text className="text-accent text-sm font-medium">★ {course.rating.toFixed(1)}</Text>
            <Text className="text-textMuted text-sm">${course.price}</Text>
          </View>

          <Text className="text-textPrimary text-2xl font-bold mb-3 leading-tight">
            {course.title}
          </Text>

          {/* instructor */}
          <View className="flex-row items-center mb-5">
            <Image
              source={{ uri: course.instructor.avatar }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="cover"
            />
            <View className="ml-3">
              <Text className="text-textPrimary text-sm font-semibold">{course.instructor.name}</Text>
              <Text className="text-textMuted text-xs">{course.instructor.location}</Text>
            </View>
          </View>

          <Text className="text-textSecondary text-sm leading-6 mb-6">
            {course.description}
          </Text>

          {/* actions */}
          <View className="gap-3">
            <Animated.View style={{ transform: [{ scale: enrollAnim }] }}>
              <Button
                label={course.isEnrolled ? '✓ Enrolled' : 'Enroll now'}
                onPress={handleEnroll}
                loading={enrolling}
                disabled={course.isEnrolled}
                fullWidth
              />
            </Animated.View>

            <Button
              label={course.isBookmarked ? 'Remove bookmark' : 'Save for later'}
              variant="outline"
              onPress={() => toggleBookmark(course.id)}
              fullWidth
            />

            <Button
              label="View course content"
              variant="ghost"
              onPress={() => router.push(`/webview/${course.id}` as any)}
              fullWidth
            />
          </View>

          {/* AI recommendations */}
          {(isRecsLoading || recs.length > 0) && (
            <View className="mt-8">
              <Text className="text-textPrimary text-lg font-bold mb-3">Recommended for you</Text>
              {isRecsLoading ? (
                <View className="gap-2">
                  <Skeleton height={72} borderRadius={12} />
                  <Skeleton height={72} borderRadius={12} />
                  <Skeleton height={72} borderRadius={12} />
                </View>
              ) : (
                recs.map((rec, idx) => (
                  <RecommendationCard key={idx} title={rec.title} reason={rec.reason} />
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* back btn overlay */}
      <View className="absolute top-12 left-4">
        <Button label="←" variant="primary" size="sm" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
