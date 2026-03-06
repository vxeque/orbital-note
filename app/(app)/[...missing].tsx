import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

export default function NotFound() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.content}>
        <Text style={[styles.code, { color: isDark ? '#fff' : '#000' }]}>404</Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Página no encontrada</Text>
        <Text style={[styles.description, { color: isDark ? '#ccc' : '#666' }]}>
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: isDark ? '#1a1a1a' : '#e0e0e0' }]}
          onPress={() => router.push('/App')}
        >
          <Text style={[styles.buttonText, { color: isDark ? '#fff' : '#000' }]}>
            Volver al inicio
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  code: {
    fontSize: 120,
    fontWeight: '900',
    lineHeight: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
