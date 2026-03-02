import {  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import FloatingNavBar from "@/components/FloatingNavBar";
import { useColorScheme as useAppColorScheme } from "@/hooks/use-color-scheme";
import { ThemeProvider } from "@/hooks/use-theme";
import { UserProvider, useUser } from "@/context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootLayoutContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

function RootLayoutContent() {
  const pathname = usePathname();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === "dark";

  // Ahora viene del contexto real, no de estado local
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  // Mientras se verifica la sesión guardada, no renderizar nada
  if (isLoading) return null;

  return (
    <>
      {/* Redirigir a login si no está autenticado */}
      {!isAuthenticated && pathname !== "/login" && (
        <Redirect href="/login" />
      )}

      {/* Redirigir a la app si ya está autenticado e intenta ir al login */}
      {isAuthenticated && pathname === "/login" && (
        <>
          <Redirect href="/App" />
          {/* <FloatingNavBar /> */}
        </>
      )}

      <Stack screenOptions={{ headerShown: false }} />

      {
        pathname !== "/login" ? <><FloatingNavBar /></> : (
          null
        )
      }
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}