// components/MentionNavigationButtons.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface MentionNavigationButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSelect: () => void;
  isDark?: boolean;
}

export const MentionNavigationButtons: React.FC<MentionNavigationButtonsProps> = ({
  onMoveUp,
  onMoveDown,
  onSelect,
  isDark = true,
}) => {
  const bgColor = isDark ? "#2a2a2a" : "#f5f5f5";
  const iconColor = "#4a9eff";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onMoveUp}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="chevron-up" size={18} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.selectButton]} 
        onPress={onSelect}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="check" size={20} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={onMoveDown}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="chevron-down" size={18} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  button: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4a9eff22',
  },
  selectButton: {
    paddingHorizontal: 16,
    backgroundColor: '#4a9eff',
  },
});