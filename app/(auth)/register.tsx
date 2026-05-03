import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  username: z.string().min(3, 'Username needs at least 3 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password is at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const { register: doRegister, error, clearError } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    clearError();
    try {
      await doRegister({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      router.replace('/(tabs)/home' as any);
    } catch {
      // error set in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: '#F8FAFC', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Create account</Text>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>Start your learning journey</Text>
          </View>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoComplete="new-password"
                returnKeyType="next"
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          {error ? (
            <Text style={{ color: '#EF4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{error}</Text>
          ) : null}

          <Button
            label="Sign up"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
          />

          <View style={{ marginTop: 12 }}>
            <Button
              label="Already have an account? Sign in"
              variant="ghost"
              onPress={() => router.back()}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
