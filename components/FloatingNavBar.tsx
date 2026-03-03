import { FontAwesome } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function FloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { setTheme } = useTheme();

  if (pathname === "/editorview") {
    return null;
  }

  const isActive = (route: string) => {
    return pathname === route || (route === "/App" && pathname === "/");
  };

  const navItems = [
    { route: "/App" as const, icon: "home" },
    { route: "/editorview" as const, icon: "plus-circle" },
    { route: "/listview" as const, icon: "archive" },
    // { route: 'menu', icon: 'bars' },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(600)}
      style={[
        styles.container,
        {
          bottom: insets.bottom + 16,
          backgroundColor: isDark
            ? "#101010"
            : "rgba(248, 248, 250, 0.62)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(255, 255, 255, 0.65)",
          ...(Platform.OS === "web"
            ? ({ backdropFilter: "blur(18px)" } as any)
            : {}),
        },
      ]}
    >
      {navItems.map((item, index) => {
        const active = isActive(item.route);
        return (
          <Animated.View
            key={item.route}
            entering={ZoomIn.delay(400 + index * 100).duration(400)}
          >
            <TouchableOpacity
              style={[
                styles.navItem,
                active && {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.75)",
                },
              ]}
              onPress={() =>
                router.push(item.route)
              }
            >
              <FontAwesome
                name={item.icon as any}
                size={24}
                color={active ? "#0a7ea4" : isDark ? "#888888" : "#999999"}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <Animated.View entering={ZoomIn.delay(760).duration(400)}>
        <TouchableOpacity
          style={[
            styles.navItem,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.75)",
            },
          ]}
          onPress={() => setTheme(isDark ? "light" : "dark")}
          accessibilityLabel="Cambiar tema"
        >
          <FontAwesome
            name={isDark ? "sun-o" : "moon-o"}
            size={22}
            color={isDark ? "#f59e0b" : "#334155"}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "88%",
    maxWidth: 420,
    alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#ffffff20",
    marginHorizontal: 4,
  },
});
