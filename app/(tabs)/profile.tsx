import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert, StatusBar, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useThemeColors, useIsDark } from '@/hooks/useThemeColors';
import { Button } from '@/components/ui/Button';

function StatCard({ value, label, icon, onPress }: { value: number; label: string; icon: string; onPress?: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{ flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}
    >
      <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );
}

type ThemeOption = 'light' | 'dark' | 'system';

function ThemeToggle({ current, onChange }: { current: ThemeOption; onChange: (t: ThemeOption) => void }) {
  const colors = useThemeColors();
  const opts: ThemeOption[] = ['light', 'dark', 'system'];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden' }}>
      {opts.map(t => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: current === t ? '#4F46E5' : 'transparent',
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'capitalize',
            color: current === t ? '#fff' : '#64748B'
          }}>
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const bookmarkCount = useCourseStore(s => s.bookmarkIds.size);
  const courses = useCourseStore(s => s.courses);
  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const unenroll = useCourseStore(s => s.unenroll);
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = usePrefsStore();
  const colors = useThemeColors();
  const isDark = useIsDark();
  const [showEnrolledModal, setShowEnrolledModal] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Turned off to prevent stuck crop UI on Android
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // optimistic update — freeapi doesn't persist this
      updateUser({
        avatar: { url: result.assets[0].uri, localPath: result.assets[0].uri },
      });
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login' as any);
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Not logged in.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Background */}
        <LinearGradient
            colors={['#4F46E5', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 60, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20 }}>Profile</Text>
        </LinearGradient>

        {/* Profile Info */}
        <View style={{ alignItems: 'center', marginTop: -60, marginBottom: 24 }}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7} style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
            <Image
              source={{ uri: user.avatar?.url || 'https://i.pravatar.cc/150' }}
              style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.bg }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: '#4F46E5', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginTop: 12 }}>{user.fullName || user.username}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{user.email}</Text>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <StatCard value={enrolledCourses.length} label="Enrolled" icon="📚" onPress={() => setShowEnrolledModal(true)} />
            <StatCard value={bookmarkCount} label="Bookmarked" icon="★" />
          </View>

          {/* Preferences Button */}
          <TouchableOpacity
            onPress={() => router.push('/preferences' as any)}
            activeOpacity={0.85}
            style={{ marginBottom: 24 }}
          >
            <LinearGradient
              colors={['#1E293B', '#1a2236']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderWidth: 1,
                borderColor: 'rgba(129, 140, 248, 0.2)',
              }}
            >
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 22 }}>⚙️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Preferences</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>Theme, notifications, cache, tech stack</Text>
              </View>
              <Text style={{ color: '#818CF8', fontSize: 20, fontWeight: '600' }}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick Settings */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Quick Settings
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 12 }}>Theme Preference</Text>
              <ThemeToggle current={theme} onChange={setTheme} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>Push notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#334155', true: '#4F46E5' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Logout */}
          <Button
            label="Log out"
            variant="danger"
            onPress={handleLogout}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Enrolled Courses Modal */}
      <Modal
        visible={showEnrolledModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEnrolledModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Enrolled Courses</Text>
            <TouchableOpacity onPress={() => setShowEnrolledModal(false)}>
              <Text style={{ fontSize: 16, color: '#4F46E5', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {enrolledCourses.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>You are not enrolled in any courses yet.</Text>
            ) : (
              enrolledCourses.map(course => (
                <View key={course.id} style={{ flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                  <Image
                    source={{ uri: course.thumbnail || 'https://via.placeholder.com/100' }}
                    style={{ width: 60, height: 60, borderRadius: 8 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }} numberOfLines={2}>{course.title}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{course.instructor.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('De-enroll', `Are you sure you want to drop ${course.title}?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'De-enroll', style: 'destructive', onPress: () => unenroll(course.id) }
                      ]);
                    }}
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 }}
                  >
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Drop</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
