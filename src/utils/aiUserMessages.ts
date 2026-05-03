/**
 * Copy for empty AI recommendation states.
 * Release builds (APK / store) must not mention .env — vars are baked in at build time.
 */
export function aiRecommendationsUnavailableMessage(): string {
  if (__DEV__) {
    return 'No AI picks yet. Add EXPO_PUBLIC_GEMINI_API_KEY to .env and restart Metro. If you already did, check the key and Gemini quotas.';
  }
  return 'Personalized suggestions are not available right now. Pull down to refresh, or try again in a moment.';
}
