import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import FloatingNavBar from "@/components/FloatingNavBar";
import GlobalNotesSidebar from "@/components/GlobalNotesSidebar";
import { UserProvider, useUser } from "@/context/UserContext";
import { useColorScheme as useAppColorScheme } from "@/hooks/use-color-scheme";
import { ThemeProvider } from "@/hooks/use-theme";

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
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;

  const hideSidebar = pathname === "/login" || pathname === "/editorview" || pathname === "/listview";

  if (isLoading) return null;

  return (
    <>
      {!isAuthenticated && pathname !== "/login" && <Redirect href="/login" />}
      {isAuthenticated && pathname === "/login" && <Redirect href="/App" />}

      <View style={styles.appShell}>
        <View style={styles.mainContent}>
          <Stack screenOptions={{ headerShown: false }} />
          {pathname !== "/login" && <FloatingNavBar />}
        </View>

        {/* <GlobalNotesSidebar hidden={hideSidebar} routeKey={pathname} /> */}
      </View>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    flexDirection: "row",
  },
  mainContent: {
    flex: 1,
  },
});
