import { Note } from '@/types/types';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ListViewProps {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  isDark?: boolean;
}

const ListView: React.FC<ListViewProps> = ({ notes, onNoteClick, isDark = true }) => {
  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? '#101010' : '#ffffff';
  const textColor = isDarkTheme ? '#ffffff' : '#000000';
  const cardBgColor = isDarkTheme ? '#1a1a1a' : '#f5f5f5';
  const borderColor = isDarkTheme ? '#333333' : '#e0e0e0';
  const subtextColor = isDarkTheme ? '#999999' : '#666666';

  // Group notes by month
  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    notes.forEach(note => {
      const date = new Date(note.date);
      const key = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      if (!groups[formattedKey]) groups[formattedKey] = [];
      groups[formattedKey].push(note);
    });
    return groups;
  }, [notes]);

  const allNotes = Object.entries(groupedNotes).flatMap(([monthYear, monthNotes]) => (
    monthNotes.map(note => ({ ...note, monthYear }))
  ));

  const renderNoteItem = ({ item }: { item: Note & { monthYear: string } }) => (
    <TouchableOpacity 
      style={[styles.noteCard, { backgroundColor: cardBgColor, borderColor }]}
      onPress={() => onNoteClick(item)}
      activeOpacity={0.7}
    >
      <View style={styles.noteHeader}>
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>
      
      <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>
        {item.title}
      </Text>
      
      <Text style={[styles.noteContent, { color: subtextColor }]} numberOfLines={2}>
        {item.content || 'Sin contenido adicional...'}
      </Text>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      <Text style={[styles.noteDate, { color: subtextColor }]}>
        {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}, 
        {new Date(item.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Mis Notas</Text>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBgColor, borderColor }]}>
        <TextInput 
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar notas"
          placeholderTextColor={subtextColor}
        />
      </View>

      {/* Notes list */}
      {allNotes.length > 0 ? (
        <FlatList
          data={allNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: subtextColor }]}>
            No hay notas aún.
          </Text>
          <Text style={[styles.emptySubtext, { color: subtextColor }]}>
            Toca el + para crear una.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  noteCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: '#1e40af80',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  noteDate: {
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default ListView;