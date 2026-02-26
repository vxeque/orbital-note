// hooks/auth/useAuth.ts
import { useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";
import { saveAccessToken, removeAccessToken } from "@/services/tokenStorage";

WebBrowser.maybeCompleteAuthSession();

// ─── Constantes ───────────────────────────────────────────────────────────────
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "google_access_token",
  USER: "google_user",
} as const;
// 
const GOOGLE_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file",
] as const;

// ─── Utilidad de token ────────────────────────────────────────────────────────
const TokenStorage = {
  save: (token: string) =>
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),

  get: () =>
    AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),

  remove: () =>
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const { user, setUser, clearUser, isLoading } = useUser();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: [...GOOGLE_SCOPES],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      if (token) {
        handleSuccessfulAuth(token);
      }
    }
  }, [response]);

  const handleSuccessfulAuth = async (accessToken: string) => {
    try {
      // Guardar token y obtener perfil en paralelo
      const [, userInfo] = await Promise.all([
        saveAccessToken(accessToken),
        // TokenStorage.save(accessToken),
        fetchGoogleProfile(accessToken),
      ]);

      await setUser(userInfo);
    } catch (error) {
      throw error;
    }
  };

  const fetchGoogleProfile = async (accessToken: string) => {
    const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Error obteniendo perfil: ${res.status}`);
    }

    const data = await res.json();

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture,
      given_name: data.given_name,
      family_name: data.family_name,
    };
  };

  const login = async () => {
    await promptAsync();
  };

  // const logout = async () => {
  //   await Promise.all([
  //     TokenStorage.remove(),
  //     clearUser(),
  //   ]);
  // };

  const logout = async () => {
    await Promise.all([removeAccessToken(), clearUser()])
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    request,
  };
};