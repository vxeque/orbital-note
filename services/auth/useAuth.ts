// hooks/auth/useAuth.ts
import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { useUser } from "@/context/UserContext";
import { saveAccessToken, removeAccessToken } from "@/services/tokenStorage";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";

const GOOGLE_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.file",
] as const;

export const useAuth = () => {
  const { user, setUser, clearUser, isLoading } = useUser();
  const redirectUri =
    Platform.OS === "web"
      ? `${window.location.origin}/login`
      : AuthSession.makeRedirectUri({
          path: "login",
          scheme: "orbitalnote",
        });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    redirectUri,
    scopes: [...GOOGLE_SCOPES],
    extraParams: {
      prompt: "consent",
    },
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      const expiresIn = response.authentication?.expiresIn;
      if (token) {
        handleSuccessfulAuth(token, expiresIn);
      }
    }
  }, [response]);

  const handleSuccessfulAuth = async (
    accessToken: string,
    expiresInSeconds?: number
  ) => {
    try {
      const [, userInfo] = await Promise.all([
        saveAccessToken(accessToken, expiresInSeconds),
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
    console.log("[GoogleAuth] redirectUri:", redirectUri);
    await promptAsync({ redirectUri });
  };

  const logout = async () => {
    await Promise.all([removeAccessToken(), clearUser()]);
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
