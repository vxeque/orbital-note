import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useTheme } from './use-theme';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { theme, isDark, isLoadingTheme } = useTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemColorScheme = useRNColorScheme();

  if (!hasHydrated || isLoadingTheme) {
    return 'dark';
  }

  if (theme === 'auto') {
    return systemColorScheme || 'dark';
  }

  return isDark ? 'dark' : 'light';
}
