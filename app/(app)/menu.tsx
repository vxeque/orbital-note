import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Menu() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const MenuItem = ({ icon, label }: { icon: string; label: string }) => (
    <TouchableOpacity style={styles.menuItem}>
      <FontAwesome
        name={icon as any}
        size={20}
        color={isDark ? '#ffffff' : '#000000'}
      />
      <Text style={[styles.menuLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#ffffff',
    },
    menuContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginVertical: 8,
      backgroundColor: isDark ? '#000' : '#f5f5f5',
      borderRadius: 8,
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.menuContainer, { paddingBottom: 100 }]}>
        <MenuItem icon="cog" label="Configuración" />
        <MenuItem icon="info-circle" label="Acerca de" />
        <MenuItem icon="question-circle" label="Ayuda" />
      </View>
    </SafeAreaView>
  );
}
