import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem('app-theme')) as ThemeMode;
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'auto') {
      // Usar el tema del sistema
      setIsDark(false); // Aquí puedes usar Appearance.getColorScheme() si lo necesitas
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
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
