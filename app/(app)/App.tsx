import React, { useEffect, useRef } from "react";
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useUser } from "@/context/UserContext";

const isWeb = Platform.OS === "web";

interface HomeViewProps {
  onNavigateToList: () => void;
  onNavigateToNew: () => void;
  onNavigateToLogin: () => void;
  onNavigateToView: () => void;
  isDark?: boolean;
  userName?: string;
  userPhoto?: string;
  userEmail?: string;
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
}

const COLORS = {
  bg: "black",
  border: "#1e2435",
  accent: "#3b82f6",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
};

const StatusBadge = () => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>ORBITAL NOTE READY</Text>
  </View>
);

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToLogin, isDark = true, userEmail = "" }) => {
  const { user } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={[styles.root, { backgroundColor: isDark ? COLORS.bg : "#ffffff" }]}>
      <View style={styles.header}>
        <View />
        <TouchableOpacity style={styles.userChip} onPress={onNavigateToLogin} activeOpacity={0.8}>
          <View style={styles.userTextWrap}>
            <Text style={styles.userNameText}>{user?.name || "Usuario"}</Text>
            {!!userEmail && (
              <Text style={styles.userEmailText} numberOfLines={1}>
                {userEmail}
              </Text>
            )}
          </View>
          <Image source={{ uri: user?.picture }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isWeb && styles.scrollContentWeb]}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <StatusBadge />
          <View style={styles.greetingWrap}>
            <Text style={styles.greeting}>
              {"Hola, "}
              <Text style={styles.greetingName}>{user?.name || "amigo"}</Text>
              {"!"}
            </Text>
            <Text style={styles.greetingSub}>Que escribiremos hoy?</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomColor: COLORS.border,
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userTextWrap: {
    alignItems: "flex-end",
  },
  userNameText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  userEmailText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    maxWidth: 160,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: "#141720",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 48,
  },
  scrollContentWeb: {
    // maxWidth: 860,
    width: "100%",
    // height: "100%",
    justifyContent: "center",
    alignSelf: "center",
  },
  badge: {
    borderWidth: 1,
    borderColor: "#1a3a1a",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 28,
  },
  badgeText: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  greetingWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  greetingName: {
    color: COLORS.accent,
  },
  greetingSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
});

export default HomeView;
