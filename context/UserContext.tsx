// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { removeAccessToken } from "@/services/tokenStorage";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  clearUser: () => Promise<void>;
  isLoading: boolean;
}

// ─── Valor por defecto ────────────────────────────────────────────────────────
const defaultContextValue: UserContextType = {
  user: null,
  setUser: async (_user: User | null): Promise<void> => {},
  clearUser: async (): Promise<void> => {},
  isLoading: true,
};

// ─── Contexto ─────────────────────────────────────────────────────────────────
const UserContext = createContext<UserContextType>(defaultContextValue);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem("google_user");
      if (stored) {
        setUserState(JSON.parse(stored) as User);
      }
    } catch (error) {
      console.error("Error loading stored user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tipo de retorno explícito en ambas funciones
  const setUser = async (newUser: User | null): Promise<void> => {
    try {
      if (newUser) {
        await AsyncStorage.setItem("google_user", JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem("google_user");
      }
      setUserState(newUser);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const clearUser = async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("google_user"),
        removeAccessToken(),
        // AsyncStorage.removeItem("google_access_token"),
      ]);
      setUserState(null);
    } catch (error) {
      console.error("Error clearing user:", error);
    }
  };

  // Variable tipada explícitamente antes de pasarla al Provider
  const contextValue: UserContextType = {
    user,
    setUser,
    clearUser,
    isLoading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de <UserProvider>");
  }
  return context;
};