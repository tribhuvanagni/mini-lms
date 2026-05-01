import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { usePrefsStore } from '@/store/prefsStore';
import { Button } from '@/components/ui/Button';

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <View className="flex-1 bg-surface rounded-2xl p-4 items-center">
      <Text className="text-2xl mb-1">{icon}</Text>
      <Text className="text-textPrimary text-xl font-bold">{value}</Text>
      <Text className="text-textMuted text-xs mt-1">{label}</Text>
    </View>
  );
}

type ThemeOption = 'light' | 'dark' | 'system';

function ThemeToggle({ current, onChange }: { current: ThemeOption; onChange: (t: ThemeOption) => void }) {
  const opts: ThemeOption[] = ['light', 'dark', 'system'];
  return (
    <View className="flex-row bg-surface rounded-xl overflow-hidden">
      {opts.map(t => (
        <TouchableOpacity
          key={t}
          onPress={() => onChange(t)}
          className={`flex-1 py-2.5 items-center ${current === t ? 'bg-primary' : ''}`}
        >
          <Text className={`text-sm font-medium capitalize ${current === t ? 'text-white' : 'text-textMuted'}`}>
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
  const enrolledCount = useCourseStore(s => s.enrolledIds.size);
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = usePrefsStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
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
      <SafeAreaView className="flex-1 bg-bgPrimary items-center justify-center">
        <Text className="text-textSecondary">Not logged in.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* header */}
        <View className="items-center pt-6 pb-6">
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            <Image
              source={{ uri: user.avatar?.url || 'https://i.pravatar.cc/150' }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View className="absolute bottom-0 right-0 bg-primary rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs">✎</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-textPrimary text-xl font-bold mt-3">{user.fullName || user.username}</Text>
          <Text className="text-textMuted text-sm mt-1">{user.email}</Text>
        </View>

        {/* stats */}
        <View className="flex-row gap-3 mb-6">
          <StatCard value={enrolledCount} label="Enrolled" icon="📚" />
          <StatCard value={bookmarkCount} label="Bookmarked" icon="★" />
        </View>

        {/* settings */}
        <View className="mb-6">
          <Text className="text-textSecondary text-xs font-semibold uppercase tracking-wider mb-3">
            Settings
          </Text>

          <View className="mb-4">
            <Text className="text-textPrimary text-sm font-medium mb-2">Theme</Text>
            <ThemeToggle current={theme} onChange={setTheme} />
          </View>

          <View className="flex-row items-center justify-between bg-surface rounded-xl px-4 py-3">
            <Text className="text-textPrimary text-sm font-medium">Push notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#334155', true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* logout */}
        <View className="mb-10">
          <Button
            label="Log out"
            variant="danger"
            onPress={handleLogout}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
