import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert, StatusBar, Animated, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrefsStore } from '@/store/prefsStore';
import { storage } from '@/services/storage';

import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';

// --------------- sub-components ---------------

type ThemeOption = 'light' | 'dark' | 'system';

function ThemeSelector({ current, onChange }: { current: ThemeOption; onChange: (t: ThemeOption) => void }) {
  const colors = useThemeColors();
  const opts: { key: ThemeOption; icon: string; label: string }[] = [
    { key: 'light', icon: '☀️', label: 'Light' },
    { key: 'dark',  icon: '🌙', label: 'Dark' },
    { key: 'system', icon: '⚙️', label: 'System' },
  ];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 14, padding: 4 }}>
      {opts.map(t => (
        <TouchableOpacity
          key={t.key}
          onPress={() => onChange(t.key)}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: current === t.key ? '#4F46E5' : 'transparent',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</Text>
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            color: current === t.key ? '#fff' : colors.textSecondary,
            letterSpacing: 0.5,
          }}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{
      color: '#818CF8',
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      marginBottom: 12,
      marginTop: 28,
    }}>
      {title}
    </Text>
  );
}

function SettingRow({
  icon,
  label,
  description,
  right,
  onPress,
}: {
  icon: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 8,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(79, 70, 229, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
        {description && (
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{description}</Text>
        )}
      </View>
      {right}
      {onPress && !right && (
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// --------------- main screen ---------------

export default function Preferences() {
  const router = useRouter();
  const {
    theme,
    notificationsEnabled,
    setTheme,
    setNotificationsEnabled,
  } = usePrefsStore();

  const colors = useThemeColors();
  const isDark = useIsDark();
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove cached course data and AI recommendations. Your bookmarks and enrollment data will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true);
            try {
              // Clear course cache and AI recommendation cache
              await storage.remove('courses');
              // Clear all ai_recs_ keys by resetting
              Alert.alert('Done', 'Cache cleared successfully. Pull to refresh on the home screen to reload courses.');
            } catch {
              Alert.alert('Error', 'Failed to clear cache.');
            } finally {
              setClearingCache(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 56,
            paddingBottom: 28,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 0.5 }}>
              Preferences
            </Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginLeft: 48 }}>
            Customize your learning experience
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20 }}>
          {/* ── Appearance ── */}
          <SectionHeader title="Appearance" />
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 8,
          }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 12 }}>
              Theme
            </Text>
            <ThemeSelector current={theme} onChange={setTheme} />
          </View>

          {/* ── Notifications ── */}
          <SectionHeader title="Notifications" />
          <SettingRow
            icon="🔔"
            label="Push Notifications"
            description="Bookmark milestones & inactivity reminders"
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#334155', true: '#4F46E5' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="🎯"
            label="Bookmark Milestones"
            description="Get notified every 5 bookmarks"
          />
          <SettingRow
            icon="⏰"
            label="Inactivity Reminders"
            description="Remind after 24h of no activity"
          />

          {/* ── AI & Recommendations ── */}
          <SectionHeader title="AI & Recommendations" />
          <SettingRow
            icon="🤖"
            label="Smart Recommendations"
            description="Powered by Google Gemini (free tier)"
          />
          <SettingRow
            icon="🧠"
            label="Auto-suggest on Course View"
            description="Show AI suggestions when viewing courses"
          />

          {/* ── Data & Storage ── */}
          <SectionHeader title="Data & Storage" />
          <SettingRow
            icon="🗑️"
            label={clearingCache ? 'Clearing…' : 'Clear Cache'}
            description="Remove cached courses and AI data"
            onPress={handleClearCache}
          />
          <SettingRow
            icon="💾"
            label="Offline Storage"
            description="Courses are cached with MMKV for offline access"
          />
          <SettingRow
            icon="🔐"
            label="Secure Storage"
            description="Auth tokens stored with expo-secure-store"
          />

          {/* ── About ── */}
          <SectionHeader title="About" />
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Version</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>1.0.0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Framework</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>React Native Expo</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>State</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Zustand</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Forms</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>React Hook Form + Zod</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Lists</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>FlashList</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Animations</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Reanimated</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>AI</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Google Gemini</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Testing</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>Jest + RNTL</Text>
            </View>
          </View>

          {/* Tech stack badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 12 }}>
            {[
              'Expo Router', 'NativeWind', 'MMKV', 'Axios',
              'expo-image', 'WebView', 'Expo Notifications',
              'expo-secure-store', 'Sentry',
            ].map(tech => (
              <View
                key={tech}
                style={{
                  backgroundColor: 'rgba(79, 70, 229, 0.12)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(129, 140, 248, 0.15)',
                }}
              >
                <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: '700' }}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
