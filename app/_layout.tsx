import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { container } from "@/src/di/container";
import { useAuth } from "@/src/presentation/hooks/useAuth";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-BoldItalic.ttf"),
  });

  // 🟢 Inicializar el container
  const [containerReady, setContainerReady] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();


  useEffect(() => {
    const initContainer = async () => {
      try {
        await container.initialize();
        setContainerReady(true);
      } catch (error) {
        console.error("Error initializing container:", error);
      }
    };

    initContainer();
  }, []);

  useEffect(() => {
    if (!containerReady || authLoading) return;

    const inAuthGroup =
      segments[0] === "(auth)" &&
      (segments[1] === "login" || segments[1] === "register");
      
    if (!user && !inAuthGroup) {
      // Usuario no autenticado intenta acceder a ruta protegida
      router.replace("/login" as any);
    } else if (user && inAuthGroup) {
      // Usuario autenticado intenta acceder a login/register
      router.replace("/(app)/(tabs)/todos");
    }
  }, [user, segments, containerReady, authLoading]);


  useEffect(() => {
    if (loaded && containerReady && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, containerReady, authLoading]);

  if (!loaded || !containerReady || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </ThemeProvider>
  );
}
