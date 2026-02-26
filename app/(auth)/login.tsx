import React, { useState } from "react";
import {
    Platform,
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors } from "@/constants/theme";

import CustomAlert from "@/components/modal/CustonAlert";
import ModalSuccess from "@/components/modal/Success";

import { useAuth } from "@/services/auth/useAuth";

// ─── Separador ────────────────────────────────────────────────────────────────
const Divider = ({ textColor }: { textColor: string }) => (
    <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={[styles.dividerText, { color: textColor }]}>Iniciar sesión</Text>
        <View style={styles.dividerLine} />
    </View>
);

// ─── Botón de Google ──────────────────────────────────────────────────────────
const GoogleButton = ({
    onPress,
    disabled,
}: {
    onPress: () => void;
    disabled?: boolean;
}) => (
    <TouchableOpacity
        style={[styles.googleButton, disabled && { opacity: 0.6 }]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
    >
        {/* Ícono G de Google con colores oficiales */}
        <View style={styles.googleIconWrapper}>
            <Image source={require('@/assets/images/Google__G__logo.png')} style={{ width: 24, height: 24 }} />
        </View>
        <Text style={styles.googleButtonText}>Continuar con Google</Text>
    </TouchableOpacity>
);

// ─── Componente principal ─────────────────────────────────────────────────────
function LoginScreen() {
    const router = useRouter();
    const backgroundColor = useThemeColor({}, "background");
    const textColor = useThemeColor({}, "text");
    const inputBorderColor = useThemeColor(
        { light: Colors.light.icon, dark: Colors.dark.icon },
        "icon"
    );
    const tintColor = useThemeColor({}, "tint");
    const inputBgColor = useThemeColor(
        { light: "#f0f0f0", dark: "#1e1e1e" },
        "background"
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState(
        "Por favor, ingresa tu correo y contraseña."
    );
    const [showSuccess, setShowSuccess] = useState(false);

    const { user, isLoading, isAuthenticated, login, logout } = useAuth();

    const isWeb = Platform.OS === "web";

    // ── Colores dinámicos para la tarjeta de usuario autenticado ────────────────
    const cardBg = useThemeColor({ light: "#f5f5f5", dark: "#0000" }, "background");

    // ── Login con email/password ─────────────────────────────────────────────────
    const handleEmailLogin = async () => {
        if (!email || !password) {
            setAlertMessage("Por favor, ingresa tu correo y contraseña.");
            setShowAlert(true);
            return;
        }
    };

    // ── Estado de carga ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor }]}>
                <ActivityIndicator size="large" color="#4285F4" />
                <Text style={[styles.loadingText, { color: textColor }]}>
                    Iniciando sesión...
                </Text>
            </View>
        );
    }

    // ── Ya autenticado: mostrar perfil ───────────────────────────────────────────
    if (isAuthenticated && user) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor }]}>
                <View style={[styles.profileCard, { backgroundColor: cardBg }]}>
                    {user.picture ? (
                        <Image source={{ uri: user.picture }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarFallbackText}>
                                {user.name?.[0]?.toUpperCase() ?? "U"}
                            </Text>
                        </View>
                    )}

                    <Text style={[styles.profileName, { color: textColor }]}>
                        {user.name}
                    </Text>
                    <Text style={styles.profileEmail}>{user.email}</Text>

                    <View style={styles.syncBadge}>
                        <Text style={styles.syncBadgeText}>
                            ✓ Sincronizado con Google Drive
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.goToAppButton}
                        onPress={() => router.replace("/listview")}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.goToAppText}>Ir a mis notas →</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={logout}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ── Pantalla de login ────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
            <View style={isWeb ? styles.formContainerWeb : styles.formContainer}>

                {/* Logo y título */}
                <Image
                    source={require("@/assets/images/icon.png")}
                    style={styles.logo}
                />
                <Text style={[styles.title, { color: textColor }]}>ORBITAL NOTE</Text>
                <Text style={[styles.subtitle, { color: inputBorderColor }]}>
                    Tus notas, siempre contigo
                </Text>

                {/* ── Sección email/password ── */}
                {/* <View style={styles.inputsContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                borderColor: inputBorderColor,
                                color: textColor,
                                backgroundColor: inputBgColor,
                            },
                        ]}
                        placeholder="Correo electrónico"
                        placeholderTextColor={
                            textColor === Colors.light.text
                                ? Colors.light.icon
                                : Colors.dark.icon
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={[
                            styles.input,
                            {
                                borderColor: inputBorderColor,
                                color: textColor,
                                backgroundColor: inputBgColor,
                            },
                        ]}
                        placeholder="Contraseña"
                        placeholderTextColor={
                            textColor === Colors.light.text
                                ? Colors.light.icon
                                : Colors.dark.icon
                        }
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity
                        style={styles.emailLoginButton}
                        onPress={handleEmailLogin}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.emailLoginButtonText}>Iniciar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.forgotPasswordText, { color: tintColor }]}>
                            ¿Olvidaste tu contraseña?
                        </Text>
                    </TouchableOpacity>
                </View> */}

                {/* ── Separador ── */}
                <Divider textColor={inputBorderColor} />

                {/* ── Botón de Google ── */}
                <GoogleButton onPress={login} />

                <Text style={[styles.disclaimer, { color: inputBorderColor }]}>
                    Solo accedemos a los archivos creados por esta app en tu Drive
                </Text>

                {/* ── Modales ── */}
                <CustomAlert
                    visible={showAlert}
                    title="Error"
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />

                <ModalSuccess
                    visible={showSuccess}
                    onClose={() => setShowSuccess(false)}
                />
            </View>
        </SafeAreaView>
    );
}

export default LoginScreen;

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Layouts base
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    formContainer: {
        width: "85%",
        alignItems: "center",
        padding: 20,
        borderRadius: 10,
    },
    formContainerWeb: {
        justifyContent: "center",
        alignItems: "center",
        width: 360,
    },

    // Logo y cabecera
    logo: {
        width: 90,
        height: 90,
        borderRadius: 20,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        letterSpacing: 3,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        marginBottom: 28,
        letterSpacing: 0.5,
    },

    // Inputs
    inputsContainer: {
        width: "100%",
        gap: 0,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        marginBottom: 12,
    },

    // Botón email login
    emailLoginButton: {
        width: "100%",
        height: 50,
        borderRadius: 10,
        backgroundColor: "#1e3a8a",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
        shadowColor: "#1e3a8a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    emailLoginButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Forgot password
    forgotPasswordButton: {
        marginTop: 12,
        alignSelf: "flex-end",
    },
    forgotPasswordText: {
        fontSize: 13,
    },

    // Separador
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 20,
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#333",
    },
    dividerText: {
        fontSize: 13,
        paddingHorizontal: 4,
    },

    // Botón Google
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        width: "100%",
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    googleIconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        // backgroundColor: "#4285F4",
        justifyContent: "center",
        alignItems: "center",
    },
    googleIconText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "800",
    },
    googleButtonText: {
        color: "#333",
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
    },

    // Disclaimer
    disclaimer: {
        fontSize: 11,
        textAlign: "center",
        marginTop: 14,
        lineHeight: 16,
        paddingHorizontal: 8,
    },

    // Loading
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },

    // Perfil autenticado
    profileCard: {
        width: "100%",
        maxWidth: 360,
        padding: 28,
        borderRadius: 20,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
    },
    avatarFallback: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#4285F4",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarFallbackText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
    },
    profileName: {
        fontSize: 20,
        fontWeight: "bold",
    },
    profileEmail: {
        fontSize: 13,
        color: "#888",
        marginBottom: 4,
    },
    syncBadge: {
        backgroundColor: "#0d2e0d",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 4,
        marginBottom: 8,
    },
    syncBadgeText: {
        color: "#4caf50",
        fontSize: 12,
        fontWeight: "600",
    },
    goToAppButton: {
        width: "100%",
        height: 48,
        backgroundColor: "#1e3a8a",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    goToAppText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    logoutButton: {
        marginTop: 8,
        paddingVertical: 8,
    },
    logoutText: {
        color: "#d32f2f",
        fontSize: 13,
        fontWeight: "600",
    },
});