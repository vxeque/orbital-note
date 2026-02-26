import { FontAwesome } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  if (pathname === '/editorview') {
    return null;
  }

  const isActive = (route: string) => {
    return pathname === `/${route}` || (route === "index" && pathname === "/");
  };

  const navItems = [
    { route: "index", icon: "home" },
    { route: "editorview", icon: "plus-circle" },
    { route: "listview", icon: "archive" },
    // { route: 'menu', icon: 'bars' },
  ];

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(600)}
      style={[
        styles.container,
        {
          bottom: insets.bottom + 16,
          backgroundColor: isDark ? "black" : "#ffffff",
          borderColor: isDark ? "#222222" : "#e0e0e0",
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
                  backgroundColor: isDark ? "black" : "#f0f0f0",
                },
              ]}
              onPress={() =>
                router.push(item.route === "index" ? "/" : `/${item.route}`)
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

      {/* <View style={styles.divider} /> */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // position: "fixed",
    // bottom: 20,
    // left: 0,
    // right: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-evenly",
    // alignItems: "center",
    // paddingHorizontal: 12,
    // width: 800
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#ffffff20",
    marginHorizontal: 4,
  },
});
