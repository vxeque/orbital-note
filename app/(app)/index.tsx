import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import HomeView from './App';

export default function Index() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? 'black' : '#ffffff' }}>
      <View style={{ flex: 1, paddingBottom: 100 }}>
        <HomeView
          onNavigateToList={() => router.push('/listview')}
          onNavigateToNew={() => router.push('/menu')}
          onNavigateToLogin={() => router.push('/login')}
          onNavigateToView={() => router.push('/Viewnote')}
          isDark={isDark}
        />
      </View>
    </SafeAreaView>
  );
}