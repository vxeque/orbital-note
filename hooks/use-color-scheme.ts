import { useColorScheme as useRNColorScheme } from 'react-native';
import { useTheme } from './use-theme';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const { theme, isDark, isLoading } = useTheme();

  // Durante la carga, usar dark por defecto para evitar cambios visuales bruscos
  if (isLoading) {
    return 'dark';
  }

  // Si el tema es automático, usa el del sistema
  if (theme === 'auto') {
    return systemColorScheme || 'dark';
  }

  // Si no, usa el que el usuario configuró
  return isDark ? 'dark' : 'light';
}
