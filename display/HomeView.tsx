import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HomeViewProps {
  onNavigateToList: () => void;
  onNavigateToNew: () => void;
  isDark?: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigateToList, onNavigateToNew, isDark = true }) => {
  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? '#000' : '#ffffff';
  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const cardBgColor = isDarkTheme ? '#000' : '#f0f0f0';
  const borderColor = isDarkTheme ? '#333333' : '#e0e0e0';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Planet simulation */}
      <View style={styles.planetContainer}>
        <View style={[styles.planet, { borderColor }]} />
      </View>

      {/* Welcome text */}
      <Text style={[styles.welcomeText, { color: textColor }]}>
        ¡Hola!, ¿Qué escribiremos hoy?
      </Text>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: cardBgColor, borderColor }]}
          onPress={onNavigateToList}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>
            Lista de notas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: cardBgColor, borderColor }]}
          onPress={onNavigateToNew}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>
            Nueva nota
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  planetContainer: {
    marginBottom: 32,
  },
  planet: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 48,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeView;