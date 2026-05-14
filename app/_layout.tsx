import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import 'react-native-reanimated';

import LockOverlay from '@/components/LockOverlay';
import { useColorScheme } from '@/components/useColorScheme';
import {
  configureNotificationHandler,
  loadPersistentEnabled,
  NOTIFICATION_TAP_ACTION,
  postPersistentQuickAddNotification,
} from '@/services/NotificationService';
import { refreshSpendingWidget } from '@/services/WidgetService';
import { useAuthStore } from '@/store/authStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const navigateToAddScreenIfTapAction = (action: unknown) => {
  if (action === NOTIFICATION_TAP_ACTION) {
    router.push('/(tabs)/add');
  }
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    configureNotificationHandler();

    refreshSpendingWidget().catch(() => undefined);

    useAuthStore.getState().loadBiometricEnabled();

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        navigateToAddScreenIfTapAction(response.notification.request.content.data?.action);
      }
    });

    const tapSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateToAddScreenIfTapAction(response.notification.request.content.data?.action);
    });

    const appStateSubscription = AppState.addEventListener('change', async (nextState) => {
      const authStore = useAuthStore.getState();

      if (nextState === 'background' || nextState === 'inactive') {
        authStore.setBackgroundedAt(Date.now());
      }

      if (nextState === 'active') {
        if (authStore.shouldLockAfterBackground()) {
          authStore.setAuthenticated(false);
        }
        authStore.setBackgroundedAt(null);

        if (Platform.OS === 'ios') {
          const persistentEnabled = await loadPersistentEnabled();
          if (persistentEnabled) {
            await postPersistentQuickAddNotification();
          }
        }
      }
    });

    return () => {
      tapSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <LockOverlay />
    </ThemeProvider>
  );
}
