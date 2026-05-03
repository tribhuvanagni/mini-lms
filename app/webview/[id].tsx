import { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import WebView from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourseStore } from '@/store/courseStore';
import { buildInjectionScript, parseWebMessage } from '@/services/webviewBridge';
import { logger } from '@/utils/logger';
import { useThemeColors } from '@/hooks/useThemeColors';

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
  const colors = useThemeColors();

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Course not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#6366f1' }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{course.title}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
          Failed to load course content. Check your connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => { setError(false); setLoading(true); }}
          style={{ backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* nav bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
        >
          <Text style={{ color: '#6366f1', fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '500', textAlign: 'center', marginHorizontal: 16 }} numberOfLines={1}>
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
        <View style={{ position: 'absolute', top: 48, bottom: 0, left: 0, right: 0, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}
