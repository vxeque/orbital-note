import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "google_access_token";
const ACCESS_TOKEN_EXP_KEY = "google_access_token_exp";

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function buildExpiryTimestamp(expiresInSeconds?: number): string | null {
  if (!expiresInSeconds || expiresInSeconds <= 0) return null;
  const now = Date.now();
  const safetyWindowMs = 60_000;
  return String(now + expiresInSeconds * 1000 - safetyWindowMs);
}

async function saveAccessTokenExpiry(expiresInSeconds?: number): Promise<void> {
  const expiry = buildExpiryTimestamp(expiresInSeconds);

  if (Platform.OS === "web") {
    if (expiry) {
      localStorage.setItem(ACCESS_TOKEN_EXP_KEY, expiry);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_EXP_KEY);
    }
    return;
  }

  if (expiry) {
    await AsyncStorage.setItem(ACCESS_TOKEN_EXP_KEY, expiry);
  } else {
    await AsyncStorage.removeItem(ACCESS_TOKEN_EXP_KEY);
  }
}

async function isTokenExpired(): Promise<boolean> {
  const raw =
    Platform.OS === "web"
      ? localStorage.getItem(ACCESS_TOKEN_EXP_KEY)
      : await AsyncStorage.getItem(ACCESS_TOKEN_EXP_KEY);

  if (!raw) return false;
  const expiryTs = Number(raw);
  if (Number.isNaN(expiryTs)) return false;

  return Date.now() >= expiryTs;
}

export async function saveAccessToken(
  token: string,
  expiresInSeconds?: number
): Promise<void> {
  if (!token) return;

  if (Platform.OS === "web") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    await saveAccessTokenExpiry(expiresInSeconds);
    return;
  }

  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, secureOptions);
    // limpia legado por si antes se guardo en AsyncStorage
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await saveAccessTokenExpiry(expiresInSeconds);
    return;
  }

  // fallback defensivo
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  await saveAccessTokenExpiry(expiresInSeconds);
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;

    if (await isTokenExpired()) {
      await removeAccessToken();
      return null;
    }

    return token;
  }

  if (await isSecureStoreAvailable()) {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) {
      if (await isTokenExpired()) {
        await removeAccessToken();
        return null;
      }
      return token;
    }

    // migracion automatica desde AsyncStorage (legado)
    const legacy = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (legacy) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, legacy, secureOptions);
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      return legacy;
    }

    return null;
  }

  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXP_KEY);
    return;
  }

  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }

  // limpieza legado/fallback
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(ACCESS_TOKEN_EXP_KEY),
  ]);
}