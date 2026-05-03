import { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Animated, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { useCourseStore } from '@/store/courseStore';
import { useRecommendationStore } from '@/store/recommendationStore';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Skeleton } from '@/components/SkeletonLoader';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { findCourseBySuggestedTitle } from '@/utils/courseMatch';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400/1E293B/FFFFFF?text=Course';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enroll } = useCourseStore();
  const course = courses.find(c => c.id === id);

  const { recommendations, loading: recsLoading, fetchRecommendations } = useRecommendationStore();
  const recs = id ? recommendations.get(id) : undefined;
  const hasLoadedRecs = Boolean(id && recommendations.has(id));
  const isRecsLoading = id ? recsLoading.has(id) : false;

  const [enrollAnim] = useState(new Animated.Value(1));
  const [enrolling, setEnrolling] = useState(false);
  const colors = useThemeColors();
  const isDark = useIsDark();

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
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 16, marginBottom: 16 }}>Course not found.</Text>
        <Button label="Go back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  const ratingStars = Math.round(course.rating);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={{ uri: course.thumbnail || FALLBACK_IMAGE }}
            style={{ width: '100%', height: 320 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            placeholder={FALLBACK_IMAGE}
          />
          <LinearGradient
            colors={['rgba(15, 23, 42, 0)', colors.bg]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
          {/* Category + Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginRight: 12 }}>
              <Text style={{ color: '#818CF8', fontSize: 13, fontWeight: '600' }}>{course.category}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 }}>
              <Text style={{ color: '#F59E0B', fontSize: 13, fontWeight: '700' }}>
                {'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)} {course.rating.toFixed(1)}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '700' }}>${course.price?.toFixed(2) ?? '49.99'}</Text>
          </View>

          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 16, lineHeight: 34 }}>
            {course.title}
          </Text>

          {/* Instructor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Image
              source={{ uri: course.instructor.avatar || 'https://via.placeholder.com/48' }}
              style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#4F46E5' }}
              contentFit="cover"
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 2 }}>{course.instructor.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{course.instructor.location}</Text>
            </View>
          </View>

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>About this course</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: 32 }}>
            {course.description}
          </Text>

          {/* Actions */}
          <View style={{ gap: 12 }}>
            <Animated.View style={{ transform: [{ scale: enrollAnim }] }}>
              {course.isEnrolled ? (
                 <Button
                 label="✓ Enrolled"
                 onPress={() => {}}
                 disabled={true}
                 fullWidth
               />
              ) : (
                <TouchableOpacity
                  onPress={handleEnroll}
                  disabled={enrolling}
                  style={{ opacity: enrolling ? 0.7 : 1 }}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                      {enrolling ? 'Enrolling...' : 'Enroll now'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>

            <Button
              label={course.isBookmarked ? '★ Saved to Bookmarks' : '☆ Save for later'}
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

          {/* AI recommendations (below actions) */}
          {(isRecsLoading || hasLoadedRecs) && (
            <View style={{ marginTop: 40 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Recommended for you</Text>
              </View>
              {isRecsLoading ? (
                <View style={{ gap: 12 }}>
                  <Skeleton height={72} borderRadius={16} />
                  <Skeleton height={72} borderRadius={16} />
                </View>
              ) : !recs?.length ? (
                <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                  No suggestions yet. Set <Text style={{ fontWeight: '600' }}>EXPO_PUBLIC_GEMINI_API_KEY</Text> in{' '}
                  <Text style={{ fontWeight: '600' }}>.env</Text> and reload, or try again later.
                </Text>
              ) : (
                recs.map((rec, idx) => {
                  const match = findCourseBySuggestedTitle(courses, rec.title);
                  const canOpen = match && match.id !== course.id;
                  return (
                    <RecommendationCard
                      key={`${rec.title}-${idx}`}
                      title={rec.title}
                      reason={rec.reason}
                      onPress={canOpen ? () => router.push(`/course/${match!.id}` as any) : undefined}
                    />
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Back button overlay */}
      <View style={{ position: 'absolute', top: 50, left: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600', marginLeft: -2 }}>←</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
