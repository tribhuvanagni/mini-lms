import { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getRecommendations, type Recommendation } from '@/services/aiRecommendations';
import { useCourseStore } from '@/store/courseStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { findCourseBySuggestedTitle } from '@/utils/courseMatch';

const HOME_REC_SLOT_MS = 15 * 60 * 1000;

export function HomeAIRecommendations() {
  const router = useRouter();
  const colors = useThemeColors();
  const courses = useCourseStore(s => s.courses);
  const homeAiRecNonce = useCourseStore(s => s.homeAiRecNonce);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const slotRef = useRef(Math.floor(Date.now() / HOME_REC_SLOT_MS));
  const [homeRecSlot, setHomeRecSlot] = useState(slotRef.current);

  useEffect(() => {
    const id = setInterval(() => {
      const s = Math.floor(Date.now() / HOME_REC_SLOT_MS);
      if (s !== slotRef.current) {
        slotRef.current = s;
        setHomeRecSlot(s);
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (courses.length === 0) {
      setRecs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRecs() {
      const bookmarked = courses.filter(c => c.isBookmarked);
      const pivot = (homeAiRecNonce + homeRecSlot) % Math.max(1, bookmarked.length || courses.length);
      const anchor =
        bookmarked.length > 0 ? bookmarked[pivot % bookmarked.length] : courses[pivot % courses.length];
      if (!anchor) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const interestTags = [
          anchor.category,
          ...bookmarked.map(c => c.category),
        ];
        const uniqueTags = [...new Set(interestTags.filter(Boolean))];
        const results = await getRecommendations(uniqueTags, courses, { refreshNonce: homeAiRecNonce });
        if (!cancelled) setRecs(results);
      } catch (err) {
        console.error('Home AI Recs error:', err);
        if (!cancelled) setRecs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecs();
    return () => {
      cancelled = true;
    };
  }, [courses, homeAiRecNonce, homeRecSlot]);

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
              const match = findCourseBySuggestedTitle(courses, rec.title);
              if (match) router.push(`/course/${match.id}` as any);
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
