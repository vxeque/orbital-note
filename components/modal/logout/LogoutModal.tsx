import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Pressable,
} from "react-native";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";

// ─── Props ──────────────────
interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
}

// ─── Paleta ───────────────
const C = {
  bg: "#0d0f14",
  surface: "black",
  border: "#1e2435",
  red: "#ef4444",
  redMuted: "#ef444418",
  redHover: "#dc2626",
  textPrimary: "#f1f5f9",
  textSecondary: "#64748b",
  accent: "#6c63ff",
};

export default function LogoutModal({ visible, onClose, isDark = true }: LogoutModalProps) {
  const { user, clearUser } = useUser();
  const router = useRouter();

  // Animación de entrada del card
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 60,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    await clearUser();
    onClose();
    router.replace("/login");
  };

  const initial = user?.given_name?.[0] ?? user?.name?.[0] ?? "U";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropInner, { opacity: fadeAnim }]} />
      </Pressable>

      {/* Card */}
      <View style={styles.centeredView} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* ── Encabezado ── */}
          <View style={styles.header}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningEmoji}>⚠️</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Título ── */}
          <Text style={styles.title}>Cerrar sesión</Text>
          <Text style={styles.subtitle}>
            ¿Estás seguro de que quieres salir? Tus notas seguirán guardadas en Google Drive.
          </Text>

          {/* ── Info del usuario ── */}
          {user && (
            <View style={styles.userRow}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{initial.toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>
          )}

          {/* ── Botones ── */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Sí, cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────
const styles = StyleSheet.create({
  // Backdrop semitransparente
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  // Contenedor centrado
  centeredView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  // Card principal
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: C.surface,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  warningIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  warningEmoji: {
    fontSize: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 5,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  closeBtnText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  // Texto
  title: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  // Fila de usuario
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.bg,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: C.accent,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  userEmail: {
    color: C.textSecondary,
    fontSize: 12,
  },

  // Botones
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  logoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: C.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.red,
  },
  logoutBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});