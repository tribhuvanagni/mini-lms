import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, [string, string]> = {
    home:      ['🏠', '🏡'],
    bookmarks: ['☆', '★'],
    profile:   ['👤', '👤'],
  };
  const pair = icons[label];
  const icon = pair ? (focused ? pair[1] : pair[0]) : '?';
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBorder,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#818CF8',
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabIcon label="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon label="bookmarks" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
