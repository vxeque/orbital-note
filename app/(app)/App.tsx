import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

// contexto del usuario
import { useUser } from "@/context/UserContext";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RecentNote {
  id: string;
  title: string;
  subtitle: string;
}

interface HomeViewProps {
  onNavigateToList: () => void;
  onNavigateToNew: () => void;
  onNavigateToLogin: () => void;
  onNavigateToView: () => void;
  isDark?: boolean;
  userName?: string;
  userPhoto?: string;
  userEmail?: string;
  recentNotes?: RecentNote[];
  onSearch?: (query: string) => void;
  onCategorySelect?: (category: string) => void;
}

// ─── Paleta de colores ────────────────────────────────────────────────────────
const COLORS = {
  bg: "black",
  surface: "#141720",
  surfaceHover: "#1a1f2e",
  border: "#1e2435",
  accent: "#3b82f6",
  accentMuted: "#6c63ff22",
  purple: "#a855f7",
  purpleMuted: "#a855f722",
  pink: "#ec4899",
  pinkMuted: "#ec489922",
  blue: "#3b82f6",
  blueMuted: "#3b82f622",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
  textMuted: "#334155",
  green: "#22c55e",
  badge: "#1a2a1a",
};

// ─── Categorías ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "blog",
    icon: "📝",
    title: "Artículo de Blog",
    desc: "Crea contenido atractivo para tu audiencia.",
    accent: COLORS.blue,
    bg: COLORS.blueMuted,
  },
  {
    id: "email",
    icon: "✉️",
    title: "Correo Profesional",
    desc: "Redacta emails formales y claros.",
    accent: COLORS.purple,
    bg: COLORS.purpleMuted,
  },
  {
    id: "creative",
    icon: "✦",
    title: "Historia Creativa",
    desc: "Desata tu imaginación con historias únicas.",
    accent: COLORS.pink,
    bg: COLORS.pinkMuted,
  },
];

// ─── Componente: Badge de estado ──────────────────────────────────────────────
const StatusBadge = () => (
  <View style={badgeStyles.container}>
    <Text style={badgeStyles.text}>ORBITAL NOTE READY</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#",
    borderWidth: 1,
    // borderColor: "#1a3a1a",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    alignSelf: "center",
    marginBottom: 28,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  text: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});

// ─── Componente: Tarjeta de categoría ─────────────────────────────────────────
const CategoryCard: React.FC<{
  item: (typeof CATEGORIES)[0];
  onPress: () => void;
}> = ({ item, onPress }) => (
  <TouchableOpacity
    style={[cardStyles.container, { borderColor: item.accent + "44" }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[cardStyles.iconWrap, { backgroundColor: item.bg }]}>
      <Text style={[cardStyles.icon, { color: item.accent }]}>{item.icon}</Text>
    </View>
    <Text style={[cardStyles.title, { color: item.accent }]}>{item.title}</Text>
    <Text style={cardStyles.desc}>{item.desc}</Text>
  </TouchableOpacity>
);

const cardStyles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: isWeb ? 180 : 140,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});

// ─── Componente: Fila de nota reciente ────────────────────────────────────────
const RecentNoteRow: React.FC<{
  note: RecentNote;
  onPress: () => void;
}> = ({ note, onPress }) => (
  <TouchableOpacity style={rowStyles.container} onPress={onPress} activeOpacity={0.7}>
    <View style={rowStyles.iconWrap}>
      <Text style={rowStyles.icon}>📄</Text>
    </View>
    <View style={rowStyles.textWrap}>
      <Text style={rowStyles.title} numberOfLines={1}>{note.title}</Text>
      <Text style={rowStyles.subtitle}>{note.subtitle}</Text>
    </View>
    <Text style={rowStyles.arrow}>›</Text>
  </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHover,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 16 },
  textWrap: { flex: 1 },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: COLORS.textMuted,
    fontSize: 22,
    fontWeight: "300",
  },
});

// ─── Componente principal ─────────────────────────────────────────────────────
const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToList,
  onNavigateToNew,
  onNavigateToLogin,
  isDark = true,
  // userName = useUser.name,
  // userPhoto,
  userEmail = "",
  recentNotes = [
    { id: "1", title: "Borrador de proyecto 1", subtitle: "Editado hace 2 horas" },
    { id: "2", title: "Borrador de proyecto 2", subtitle: "Editado hace 4 horas" },
  ],
  onSearch,
  onCategorySelect,
}) => {
  // Animaciones de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { user, isLoading, clearUser } = useUser(); 

  return (
    <View style={styles.root}>
      {/* ── Header con avatar ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.userChip}
          onPress={onNavigateToLogin}
          activeOpacity={0.8}
        >
          <View style={styles.userTextWrap}>
            <Text style={styles.userNameText}>{user?.name}</Text>
            {!!userEmail && (
              <Text style={styles.userEmailText} numberOfLines={1}>
                {userEmail}
              </Text>
            )}
          </View>
          <Image source={{ uri: user?.picture }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && styles.scrollContentWeb,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Badge ── */}
          <StatusBadge />

          {/* ── Saludo ── */}
          <View style={styles.greetingWrap}>
            <Text style={styles.greeting}>
              {"¡Hola, "}
              <Text style={styles.greetingName}>{user?.name}</Text>
              {"!"}
            </Text>
            <Text style={styles.greetingSub}>
              ¿Qué escribiremos hoy?
            </Text>
          </View>

          {/* ── Tarjetas de categorías ── */}
          {/* <View style={styles.cardsRow}>
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                item={cat}
                onPress={() => onCategorySelect?.(cat.id)}
              />
            ))}
          </View> */}

          {/* ── Recientes ── */}
          {/* <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recientes</Text>
            <TouchableOpacity onPress={onNavigateToList} activeOpacity={0.7}>
              <Text style={styles.recentSeeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View> */}
          {/* 
          {recentNotes.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Aún no tienes notas.</Text>
              <TouchableOpacity onPress={onNavigateToNew}>
                <Text style={styles.emptyAction}>Crear primera nota →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentNotes.map((note) => (
              <RecentNoteRow
                key={note.id}
                note={note}
                onPress={onNavigateToList}
              />
            ))
          )} */}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
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
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.accent + "66",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 48,
  },
  scrollContentWeb: {
    maxWidth: 860,
    alignSelf: "center",
    width: "100%",
  },

  // Saludo
  greetingWrap: {
    alignItems: "center",
    marginBottom: 32,
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

  // Búsqueda
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  searchIcon: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    height: "100%",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } as any : {}),
  },
  generateBtn: {
    backgroundColor: COLORS.accent,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Tarjetas
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 36,
    flexWrap: isWeb ? "nowrap" : "wrap",
  },

  // Recientes
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  recentTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  recentSeeAll: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
  },

  // Empty state
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyAction: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default HomeView;