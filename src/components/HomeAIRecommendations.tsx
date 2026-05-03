import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecommendations, type Recommendation } from '@/services/aiRecommendations';
import { useCourseStore } from '@/store/courseStore';
import { useThemeColors } from '@/hooks/useThemeColors';

export function HomeAIRecommendations() {
  const router = useRouter();
  const colors = useThemeColors();
  const courses = useCourseStore(s => s.courses);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecs() {
      // Find a bookmarked course to base recommendations on, or just use the first course
      const baseCourse = courses.find(c => c.isBookmarked) || courses[0];
      
      if (!baseCourse) {
        setLoading(false);
        return;
      }

      try {
        // We use a special cache key for the home page based on the base course category
        const results = await getRecommendations(
          `home_${baseCourse.category}`,
          `Trending in ${baseCourse.category}`, 
          baseCourse.category
        );
        setRecs(results);
      } catch (err) {
        console.error('Home AI Recs error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (courses.length > 0) {
      fetchRecs();
    }
  }, [courses]);

  if (loading) {
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' }}>
        <ActivityIndicator color="#6366f1" />
        <Text style={{ color: colors.textSecondary, marginTop: 8, fontSize: 13 }}>AI is preparing your top picks...</Text>
      </View>
    );
  }

  if (recs.length === 0) {
    return (
      <View style={{ marginBottom: 24, marginTop: 8, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>AI Top Picks For You</Text>
        </View>
        <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            No recommendations available right now. Please check if your Gemini API Key is valid and restart the app.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 24, marginTop: 8 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>✨</Text>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>AI Top Picks For You</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {recs.map((rec, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.8}
            onPress={() => {
              // Try to find a matching course in our local DB, otherwise just show a toast or search
              const match = courses.find(c => {
                const keyword = rec.title.toLowerCase().split(' ')[0] || '';
                return c.title.toLowerCase().includes(keyword);
              });
              if (match) {
                router.push(`/course/${match.id}` as any);
              }
            }}
            style={{
              width: 260,
              marginHorizontal: 4,
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.2)',
              shadowColor: '#6366f1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            />
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6 }} numberOfLines={2}>
              {rec.title}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }} numberOfLines={3}>
              {rec.reason}
            </Text>
            <View style={{ marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(99, 102, 241, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#6366f1', fontSize: 11, fontWeight: '600' }}>AI Match</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
