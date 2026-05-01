import { memo, useCallback } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import type { Course } from '@/types/course';

interface Props {
  course: Course;
  onPress: (id: string) => void;
  onBookmark: (id: string) => void;
}

// memo here because the list re-renders on every parent state tick — profiled
function CourseCardBase({ course, onPress, onBookmark }: Props) {
  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => null);
    onBookmark(course.id);
  }, [course.id, onBookmark]);

  return (
    <Pressable
      onPress={() => onPress(course.id)}
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, by ${course.instructor.name}`}
      className="flex-row bg-surface rounded-2xl mb-3 overflow-hidden active:opacity-80"
    >
      <Image
        source={{ uri: course.thumbnail }}
        style={{ width: 90, height: 90 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        accessibilityLabel={`${course.title} thumbnail`}
      />
      <View className="flex-1 px-3 py-3 justify-between">
        <Text
          className="text-textPrimary text-sm font-semibold leading-5"
          numberOfLines={2}
        >
          {course.title}
        </Text>
        <View className="flex-row items-center mt-1">
          <Image
            source={{ uri: course.instructor.avatar }}
            style={{ width: 18, height: 18, borderRadius: 9 }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <Text className="text-textMuted text-xs ml-1.5" numberOfLines={1}>
            {course.instructor.name}
          </Text>
        </View>
        <View className="flex-row items-center mt-1 gap-2">
          <Text className="text-accent text-xs font-medium">
            ★ {course.rating.toFixed(1)}
          </Text>
          <Text className="text-textMuted text-xs">{course.category}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleBookmark}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        className="p-3 justify-start items-center"
        accessibilityRole="button"
        accessibilityLabel={course.isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
        accessibilityState={{ selected: course.isBookmarked }}
      >
        <Text className={`text-xl ${course.isBookmarked ? 'text-accent' : 'text-textMuted'}`}>
          {course.isBookmarked ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </Pressable>
  );
}

export const CourseCard = memo(CourseCardBase);
