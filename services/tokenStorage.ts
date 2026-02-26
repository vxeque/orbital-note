import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "google_access_token";

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

export async function saveAccessToken(token: string): Promise<void> {
  if (!token) return;

  if (Platform.OS === "web") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, secureOptions);
    // limpia legado por si antes se guardó en AsyncStorage
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  // fallback defensivo
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  if (await isSecureStoreAvailable()) {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) return token;

    // migración automática desde AsyncStorage (legado)
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
    return;
  }

  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }

  // limpieza legado/fallback
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}
