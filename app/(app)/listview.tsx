import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  SectionList,
  Platform,
  Image
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Note } from '@/types/types';
import { getTagBadgeStyle } from '@/utils/tagColors';

import { useUser } from '@/context/UserContext'

// import LogoutModal from '@/components/modal/logout/logoutModal'; '@/components/modal/logout/logoutModal';
import LogoutModal from '@/components/modal/logout/LogoutModal';
import SaveToDriveModal from '@/components/modal/saveNote/saveNote';

// descargar archivos de google drive 
import { descargarDesdeDrive } from '@/services/sincronizarWithDrive';

const MOCK_NOTES: Note[] = [];

export default function ListViewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notes, setNotes] = useState<Note[]>([]);
  const [menuVisibleForNoteId, setMenuVisibleForNoteId] = useState<string | null>(null);
  const router = useRouter();

  const isWeb = Platform.OS === 'web';

  // contexto del usuario 
  const { user, isLoading, clearUser } = useUser()

  const bgColor = isDark ? 'black' : '#ffffff';
  const cardBgColor = isDark ? '#1b1a1ad0' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#888888' : '#666666';
  const borderColor = isDark ? '#2a2a2a' : '#e0e0e0';
  const sectionHeaderColor = isDark ? '#ffffff' : '#000000';

  const STORAGE_KEY = 'orbital-notes';
  const readNotes = async (): Promise<Note[]> => {
  // comprueba si la plataforma es web si es así, usa localStorage, si no, usa AsyncStorage
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    // si no es web, usa AsyncStorage que es para moviles
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  const writeNotes = async (data: Note[]) => {
    const raw = JSON.stringify(data);
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, raw);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, raw);
  };

  // si existe la misma nota, en ambos lados, se queda con la que tenga la fecha más reciente
  const mergeNotesByNewest = (local: Note[], remote: Note[]): Note[] => {
    const map = new Map<string, Note>();
    [...local, ...remote].forEach(note => {
      const prev = map.get(note.id);
      if (!prev) {
        map.set(note.id, note);
        return;
      }

      const prevTime = new Date(prev.modifiedAt || prev.date).getTime() || 0;
      const nexTime = new Date(note.modifiedAt || note.date).getTime() || 0;
      map.set(note.id, nexTime >= prevTime ? note : prev);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      try {
        // pintar rapido lo local 
        const local = await readNotes();
        if (!cancelled) setNotes(local);

        // luego intentar descargar lo remoto y mergear
        const archivos = await descargarDesdeDrive();
        const remote: Note[] = archivos['orbital-notes'] ? JSON.parse(archivos['orbital-notes']) : [];

        // luego de obtener los datos remoto y local, mergea ambos conjuntos de notas quedandose con la nota más reciente en caso de conflicto
        const merged = mergeNotesByNewest(local, remote);

        if (!cancelled) setNotes(merged);
        await writeNotes(merged);
      } catch (error) {
        // si falla drive se queda con lo local, que ya se pintó, y no hace nada más
        // console.error('Error al cargar notas:', error);
      }
    }
    loadNotes();
    return () => { cancelled = true; };
  }, []);

  const groupedNotes = useMemo(() => {
    const groups: Record<string, { title: string; data: Note[] }> = {};

    notes.forEach(note => {
      const date = new Date(note.date);
      if (isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
      ];
      const displayTitle = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!groups[key]) {
        groups[key] = { title: displayTitle, data: [] };
      }
      groups[key].data.push(note);
    });

    return Object.entries(groups)
      .map(([, group]) => group)
      .sort((a, b) => {
        const dateA = new Date(a.data[0]?.date || '1900-01-01');
        const dateB = new Date(b.data[0]?.date || '1900-01-01');
        return dateA.getTime() - dateB.getTime();
      });
  }, [notes]);

  const handleDeleteNote = async (noteId: string) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      await AsyncStorage.setItem('orbital-notes', JSON.stringify(updatedNotes));
      setMenuVisibleForNoteId(null);
    } catch (error) {
      // console.error('Error deleting note:', error);
    }
  };

  const handleViewNote = (noteId: string) => {
    router.push({
      pathname: '/Viewnote',
      params: { existingNoteId: noteId, allNotesData: JSON.stringify(notes) },
    });
    setMenuVisibleForNoteId(null);
  };

  const handleNoteClick = (note: Note) => {
    router.push({
      pathname: '/editorview',
      params: { existingNoteId: note.id, allNotesData: JSON.stringify(notes) },
    });
  };

  const handleNewNote = () => {
    router.push({
      pathname: '/editorview',
      params: { allNotesData: JSON.stringify(notes) },
    });
  };

  const [showLogout, setShowLogout] = useState(false);
  const [showSaveToDrive, setShowSaveToDrive] = useState(false);

  const ModalLogoutControlador = () => {
    setShowLogout(true);
  }


  const renderNoteItem = ({ item }: { item: Note }) => {
    const tagStyle = getTagBadgeStyle(item.tag, item.tagColor);

    return (
      <TouchableOpacity
        style={[styles.noteCard, { borderColor, backgroundColor: cardBgColor }]}
        onPress={() => handleNoteClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.noteContentWrapper}>
          <View style={styles.noteBody}>
            <View style={styles.noteHeader}>
              <View
                style={[
                  styles.tagContainer,
                  { backgroundColor: tagStyle.backgroundColor, borderColor: tagStyle.borderColor },
                ]}
              >
                <Text style={[styles.tagText, { color: tagStyle.color }]}>{item.tag}</Text>
              </View>
            </View>
            <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.noteContent, { color: subtextColor }]} numberOfLines={2}>
              {item.content.replace(/<[^>]*>/g, '') || 'Sin contenido adicional...'}
            </Text>
            <Text style={[styles.noteDate, { color: subtextColor }]}>
              Creada: {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })},{' '}
              {new Date(item.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {item.modifiedAt ? (
              <Text style={[styles.noteDate, { color: subtextColor }]}>
                Modificada: {new Date(item.modifiedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })},{' '}
                {new Date(item.modifiedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisibleForNoteId(item.id)}>
            <FontAwesome name="ellipsis-v" size={16} color={subtextColor} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <Text style={[styles.sectionHeader, { color: sectionHeaderColor }]}>
      {title}
    </Text>
  );



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>

      {/* Header y buscador — fijos arriba, fuera del scroll */}
      <View style={[isWeb && { marginLeft: 20, marginRight: 20, marginTop: 16 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Mis Notas</Text>
          <View style={{ flexDirection: 'row', }}>
            <TouchableOpacity style={styles.newNoteButton} onPress={handleNewNote}>
              <FontAwesome name="plus-circle" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.newNoteButton} onPress={() => setShowSaveToDrive(true)}>
              <FontAwesome name='cloud' size={24} color={'#3b82f6'}></FontAwesome>
            </TouchableOpacity>
            <TouchableOpacity style={styles.newNoteButton} onPress={ModalLogoutControlador}>
              <Image source={{ uri: user?.picture }} style={{ width: 24, height: 24, borderRadius: 20 }}></Image>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: cardBgColor, borderColor }]}>
          <FontAwesome name="search" size={16} color={subtextColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar nota"
            placeholderTextColor={subtextColor}
          />
        </View>
      </View>

      <LogoutModal
        visible={showLogout}
        onClose={() => setShowLogout(false)}
      />

      <SaveToDriveModal
        visible={showSaveToDrive}
        onClose={() => setShowSaveToDrive(false)}
      />

      {/* Lista scrolleable — ocupa todo el espacio restante */}
      {notes.length > 0 ? (
        <SectionList
          sections={groupedNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            isWeb && { marginLeft: 20, marginRight: 20 },
          ]}
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>No hay notas disponibles</Text>
          <Text style={[styles.emptySubtext, { color: subtextColor }]}>
            Crea nuevas notas para verlas aquí.
          </Text>
        </View>
      )}

      {/* Modal del menú — posición absoluta, no interfiere con el layout */}
      {menuVisibleForNoteId && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisibleForNoteId(null)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButtonSelect}
              onPress={() => handleViewNote(menuVisibleForNoteId)}
            >
              <FontAwesome name="eye" size={18} color="#fff" style={{ marginRight: 12 }} />
              <Text style={styles.menuText}>Ver nota</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuButtonSelect}
              onPress={() => handleDeleteNote(menuVisibleForNoteId)}
            >
              <FontAwesome name="trash" size={18} color="#ff4444" style={{ marginRight: 12 }} />
              <Text style={[styles.menuText, { color: '#ff4444' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newNoteButton: {
    padding: 8,
  },
  searchContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  listContainer: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 32,

  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  noteCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  noteContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteBody: {
    flex: 1,
  },
  noteHeader: {
    marginBottom: 6,
  },
  tagContainer: {
    backgroundColor: '#1e40af80',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 9,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonSelect: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
});
