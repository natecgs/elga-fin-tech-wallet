import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { COLORS } from './lib/theme';
import LoginScreen from './auth/login';
import RegisterScreen from './auth/register';

if (typeof globalThis.fetch === 'undefined') {
  // @ts-ignore
  globalThis.fetch = fetch;
}

function SplashScreen() {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={splashStyles.container}>
      <StatusBar style="light" />
      <Animated.View style={[splashStyles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
        <Ionicons name="wallet" size={56} color={COLORS.white} />
      </Animated.View>
      <Text style={splashStyles.title}>FinTech</Text>
      <Text style={splashStyles.subtitle}>Loading your account...</Text>
      <View style={splashStyles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={splashStyles.dot} />
        ))}
      </View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
});

function AppContent() {
  const { isLoading, isAuthenticated, needsRegistration, user, token } = useAuth();

  // Splash screen while checking auth state
  if (isLoading) {
    return <SplashScreen />;
  }

  // Not logged in at all - show login
  if (!token || !user) {
    return (
      <>
        <StatusBar style="dark" />
        <LoginScreen />
      </>
    );
  }

  // Logged in but needs to complete registration
  if (needsRegistration) {
    return (
      <>
        <StatusBar style="dark" />
        <RegisterScreen />
      </>
    );
  }

  // Fully authenticated - show main app
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lifestyle"
          options={{
            headerShown: true,
            title: 'Lifestyle',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="card-details"
          options={{
            headerShown: true,
            title: 'Payment Details',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            title: 'About',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: true,
            title: 'Notifications',
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
