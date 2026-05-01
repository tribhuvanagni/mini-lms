import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { logger } from '@/utils/logger';

interface State { hasError: boolean; message: string }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    logger.error('ErrorBoundary caught:', err, info);
  }

  handleRestart = () => {
    // just reset state since expo-updates isn't always available in dev
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View className="flex-1 bg-bgPrimary items-center justify-center px-8">
        <Text className="text-textPrimary text-2xl font-bold mb-2">
          Something broke
        </Text>
        <Text className="text-textSecondary text-sm text-center mb-8">
          The app ran into an unexpected error. Restarting usually fixes it.
        </Text>
        <TouchableOpacity
          onPress={this.handleRestart}
          className="bg-primary px-6 py-3 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Restart the app"
        >
          <Text className="text-white font-semibold">Restart app</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
