import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isLoadingTheme: boolean;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoadingAuth: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark'); // Valor por defecto es oscuro
  const [isDark, setIsDark] = useState(true);
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Funciones de autenticación
  const checkLoginStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('user-token');
      setIsLoggedIn(!!userToken); // Si hay token, está logueado
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async () => {
    try {
      // Simula el guardado de un token de usuario
      await AsyncStorage.setItem('user-token', 'dummy-auth-token');
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user-token');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      // Cargar tema
      try {
        const savedTheme = (await AsyncStorage.getItem('app-theme')) as ThemeMode;
        if (savedTheme) {
          setThemeState(savedTheme);
          if (savedTheme !== 'auto') {
            Appearance.setColorScheme(savedTheme);
          }
        } else {
          Appearance.setColorScheme('dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoadingTheme(false);
      }

      // Cargar estado de autenticación
      await checkLoginStatus(); // Usa la función que acabamos de definir
    };
    loadInitialData();

    // Escuchar cambios del tema del sistema
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'auto') {
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription.remove();
  }, [theme]); // Dependencia 'theme' es importante para reaccionar a cambios manuales

  useEffect(() => {
    if (theme === 'auto') {
      const systemTheme = Appearance.getColorScheme();
      setIsDark(systemTheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme);
      
      // Aplicar el tema inmediatamente
      if (newTheme !== 'auto') {
        Appearance.setColorScheme(newTheme);
      } else {
        Appearance.setColorScheme(null);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      isDark,
      isLoadingTheme,
      isLoggedIn,
      login,
      logout,
      isLoadingAuth,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
