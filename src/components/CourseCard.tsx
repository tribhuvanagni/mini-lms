import { memo, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { Course } from '@/types/course';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400/1E293B/FFFFFF?text=Course';

interface Props {
  course: Course;
  onPress: (id: string) => void;
  onBookmark: (id: string) => void;
  showRemoveButton?: boolean;
  index?: number;
}

function CourseCardBase({ course, onPress, onBookmark, showRemoveButton, index = 0 }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bookmarkAnim = useRef(new Animated.Value(1)).current;

  // Entry animation: fade in + slide up from below (staggered by index)
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(entryTranslateY, {
        toValue: 0,
        delay: index * 60,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    Animated.sequence([
      Animated.timing(bookmarkAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.spring(bookmarkAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onBookmark(course.id);
  }, [course.id, onBookmark, bookmarkAnim]);

  const ratingStars = Math.round(course.rating);

  return (
    <Animated.View
      style={{
        opacity: entryOpacity,
        transform: [{ translateY: entryTranslateY }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={() => onPress(course.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${course.title}, by ${course.instructor.name}`}
        style={{
          backgroundColor: '#1E293B',
          borderRadius: 20,
          marginBottom: 20,
          overflow: 'hidden',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }}
      >
        {/* Thumbnail with gradient overlay */}
        <View>
          <Image
            source={{ uri: course.thumbnail || FALLBACK_IMAGE }}
            style={{ width: '100%', height: 220 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
            placeholder={FALLBACK_IMAGE}
            accessibilityLabel={`${course.title} thumbnail`}
          />

          {/* Dark gradient overlay at bottom of image */}
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />

          {/* Category badge */}
          <View
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(79, 70, 229, 0.9)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
              {course.category}
            </Text>
          </View>

          {/* Price badge */}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
              ${course.price?.toFixed(2) ?? '49.99'}
            </Text>
          </View>

          {/* Bookmark button */}
          <TouchableOpacity
            onPress={handleBookmark}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.5)',
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={course.isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
            accessibilityState={{ selected: course.isBookmarked }}
          >
            <Animated.Text
              style={{
                fontSize: 22,
                marginTop: -1,
                color: course.isBookmarked ? '#F59E0B' : '#fff',
                transform: [{ scale: bookmarkAnim }],
              }}
            >
              {course.isBookmarked ? '★' : '☆'}
            </Animated.Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ padding: 16 }}>
          <Text
            style={{ color: '#F8FAFC', fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 6 }}
            numberOfLines={2}
          >
            {course.title}
          </Text>

          <Text
            style={{ color: '#94A3B8', fontSize: 13, lineHeight: 20, marginBottom: 12 }}
            numberOfLines={2}
          >
            {course.description}
          </Text>

          {/* Instructor row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
              <Image
                source={{ uri: course.instructor.avatar || 'https://via.placeholder.com/48' }}
                style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#4F46E5' }}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <Text
                style={{ color: '#94A3B8', fontSize: 13, marginLeft: 8, flex: 1 }}
                numberOfLines={1}
              >
                {course.instructor.name}
              </Text>
            </View>

            {/* Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#F59E0B', fontSize: 13, fontWeight: '700' }}>
                {'★'.repeat(ratingStars)}{'☆'.repeat(5 - ratingStars)} {course.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Explicit Remove Bookmark Button for Bookmarks Page */}
          {showRemoveButton && (
            <TouchableOpacity
              onPress={handleBookmark}
              style={{
                marginTop: 16,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#EF4444',
                alignItems: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                Remove from Bookmarks
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const CourseCard = memo(CourseCardBase);
