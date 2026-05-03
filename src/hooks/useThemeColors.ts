import { useColorScheme } from 'react-native';
import { usePrefsStore } from '@/store/prefsStore';
import { DARK, LIGHT, type ThemeColors } from '@/constants/theme';

/**
 * Returns the active theme color palette based on user preference.
 *  - 'light' → LIGHT colors
 *  - 'dark'  → DARK colors
 *  - 'system' → follows device setting
 */
export function useThemeColors(): ThemeColors {
  const pref = usePrefsStore(s => s.theme);
  const systemScheme = useColorScheme();

  if (pref === 'light') return LIGHT;
  if (pref === 'dark') return DARK;
  // system
  return systemScheme === 'light' ? LIGHT : DARK;
}

/**
 * Returns true if current theme is dark mode.
 */
export function useIsDark(): boolean {
  const colors = useThemeColors();
  return colors.bg === DARK.bg;
}
