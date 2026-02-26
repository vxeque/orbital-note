// components/MentionSuggestions.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Note } from '@/types';

interface MentionSuggestionsProps {
  notes: Note[];
  selectedIndex: number;
  onSelect: (note: Note) => void;
  onClose: () => void;
  isDark?: boolean;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  notes,
  selectedIndex,
  onSelect,
  onClose,
  isDark = true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 50;

  const bgColor = isDark ? "#2a2a2a" : "#f5f5f5";
  const textColor = isDark ? "#ffffff" : "#000000";
  const borderColor = isDark ? "#444" : "#ddd";
  const selectedBg = isDark ? "#4a9eff33" : "#4a9eff22";

  // Auto-scroll cuando cambia la selección
  useEffect(() => {
    if (scrollViewRef.current && selectedIndex >= 0) {
      scrollViewRef.current.scrollTo({
        y: selectedIndex * itemHeight,
        animated: true,
      });
    }
  }, [selectedIndex]);

  if (notes.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>
          Mencionar nota
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome name="times" size={16} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="always"
      >
        {notes.map((note, index) => (
          <TouchableOpacity
            key={note.id}
            style={[
              styles.item,
              { 
                borderColor,
                height: itemHeight,
                backgroundColor: index === selectedIndex ? selectedBg : 'transparent'
              },
            ]}
            onPress={() => onSelect(note)}
          >
            <View style={styles.itemContent}>
              <FontAwesome 
                name="file-text-o" 
                size={16} 
                color="#4a9eff" 
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text 
                  style={[styles.itemTitle, { color: textColor }]}
                  numberOfLines={1}
                >
                  {note.title}
                </Text>
                {note.tag && (
                  <Text style={[styles.itemTag, { color: isDark ? "#888" : "#666" }]}>
                    {note.tag}
                  </Text>
                )}
              </View>
              {index === selectedIndex && (
                <FontAwesome name="chevron-right" size={12} color="#4a9eff" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.footer, { borderColor }]}>
        <Text style={[styles.footerText, { color: isDark ? "#666" : "#999" }]}>
          ↑↓ para navegar • Enter para seleccionar • Esc para cerrar
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: 250,
  },
  item: {
    borderBottomWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemTag: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
  },
});