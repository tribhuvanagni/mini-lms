import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourseStore } from '@/store/courseStore';
import { buildInjectionScript, parseWebMessage } from '@/services/webviewBridge';
import { logger } from '@/utils/logger';
import { COLORS } from '@/constants/theme';

// local HTML — bundled as an asset
const COURSE_HTML = require('../../assets/webview/course-template.html');

export default function CourseWebView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const { courses, updateProgress } = useCourseStore();
  const course = courses.find(c => c.id === id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    const msg = parseWebMessage(e.nativeEvent.data);
    if (!msg || !course) return;

    logger.log('webview msg:', msg);
    if (msg.type === 'SECTION_COMPLETE') {
      const next = Math.min(100, (msg.sectionIdx + 1) * 20);
      updateProgress(course.id, next);
    }
    if (msg.type === 'SCROLL_PROGRESS') {
      updateProgress(course.id, msg.percent);
    }
  }, [course, updateProgress]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-bgPrimary items-center justify-center">
        <Text className="text-textSecondary mb-4">Course not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-bgPrimary items-center justify-center px-8">
        <Text className="text-textPrimary text-lg font-bold mb-2">{course.title}</Text>
        <Text className="text-textSecondary text-sm text-center mb-6">
          Failed to load course content. Check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => { setError(false); setLoading(true); }}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary">
      {/* nav bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
        >
          <Text className="text-primary text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-textPrimary text-sm font-medium text-center mx-4" numberOfLines={1}>
          {course.title}
        </Text>
      </View>

      <WebView
        ref={webviewRef}
        source={COURSE_HTML}
        injectedJavaScriptBeforeContentLoaded={buildInjectionScript({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor.name,
          rating: course.rating,
          category: course.category,
          progress: course.progress,
        })}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        originWhitelist={['*']}
        javaScriptEnabled
        style={{ flex: 1 }}
      />

      {loading && (
        <View className="absolute inset-0 bg-bgPrimary items-center justify-center" style={{ top: 48 }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}
