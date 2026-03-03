import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import { Note } from "@/types/types";

const STORAGE_KEY = "orbital-notes";
const FAVORITE_TAGS = ["favorita", "favoritas", "favorite", "favorites", "favourite", "favourites"];
const ARCHIVED_TAGS = ["archivo", "archivada", "archivadas", "archivado", "archivados", "archive", "archived"];
const isWeb = Platform.OS === "web";

interface Props {
  hidden?: boolean;
  routeKey?: string;
}

export default function GlobalNotesSidebar({ hidden = false, routeKey = "" }: Props) {
  const { width } = useWindowDimensions();
  const isCompact = width <= 1024;
  const [notes, setNotes] = useState<Note[]>([]);
  const [expanded, setExpanded] = useState(isWeb && !isCompact);

  useEffect(() => {
    if (hidden) return;
    let mounted = true;

    const loadNotes = async () => {
      try {
        if (Platform.OS === "web") {
          const raw = localStorage.getItem(STORAGE_KEY);
          const stored: Note[] = raw ? JSON.parse(raw) : [];
          if (mounted) setNotes(Array.isArray(stored) ? stored : []);
          return;
        }
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const stored: Note[] = raw ? JSON.parse(raw) : [];
        if (mounted) setNotes(Array.isArray(stored) ? stored : []);
      } catch {
        if (mounted) setNotes([]);
      }
    };

    loadNotes();
    return () => {
      mounted = false;
    };
  }, [hidden, routeKey]);

  useEffect(() => {
    if (isCompact && expanded) setExpanded(false);
  }, [isCompact, expanded]);

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
    [notes]
  );
  const normalizeTag = (tag?: string) => (tag || "").trim().toLowerCase();
  const favoriteNotes = useMemo(
    () => sortedNotes.filter((note) => FAVORITE_TAGS.includes(normalizeTag(note.tag))),
    [sortedNotes]
  );
  const archivedNotes = useMemo(
    () => sortedNotes.filter((note) => ARCHIVED_TAGS.includes(normalizeTag(note.tag))),
    [sortedNotes]
  );

  const goToNote = (noteId: string) => {
    if (!isWeb) setExpanded(false);
    router.push({
      pathname: "/Viewnote",
      params: {
        existingNoteId: noteId,
        allNotesData: JSON.stringify(notes),
      },
    });
  };

  const renderSection = (title: string, items: Note[], emptyText: string, icon: "star" | "archive" | "file-text-o") => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <FontAwesome name={icon} size={11} color="#ffb39a" /> {title} ({items.length})
      </Text>
      {items.length > 0 ? (
        items.slice(0, 8).map((item) => (
          <TouchableOpacity key={`${title}-${item.id}`} style={styles.item} onPress={() => goToNote(item.id)}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title || "Sin titulo"}
            </Text>
            <Text style={styles.itemMeta} numberOfLines={1}>
              {item.tag || "Sin tag"}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.empty}>{emptyText}</Text>
      )}
    </View>
  );

  if (hidden) return null;

  const expandedWidth = isWeb ? (isCompact ? Math.min(340, Math.max(270, Math.round(width * 0.82))) : 320) : "82%";

  return (
    <View pointerEvents="box-none" style={[styles.shell, { width: expanded ? expandedWidth : 60 }]}>
      <View style={styles.rail}>
        <TouchableOpacity style={styles.toggle} onPress={() => setExpanded((v) => !v)}>
          <FontAwesome name="bars" size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.dot} />
      </View>

      {expanded && (
        <ScrollView style={styles.panel} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Notas</Text>
          {renderSection("Favoritas", favoriteNotes, "Sin favoritas", "star")}
          {renderSection("Archivadas", archivedNotes, "Sin archivadas", "archive")}
          {renderSection("Todas", sortedNotes, "Sin notas", "file-text-o")}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    left: 12,
    top: 12,
    bottom: 90,
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    // borderColor: "#ffffff24",
    backgroundColor: "#2c1c75dd",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
    zIndex: 100,
  },
  rail: {
    width: 60,
    backgroundColor: "#202020",
    borderRightWidth: 1,
    borderRightColor: "#ffffff1c",
    alignItems: "center",
    paddingTop: 14,
  },
  toggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1c2b83",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E95420",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  dot: {
    marginTop: 12,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#3042e2",
  },
  panel: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 14,
    gap: 12,
  },
  title: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#ffb39a",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  item: {
    backgroundColor: "#1a1d26d9",
    borderWidth: 1,
    borderColor: "#ffffff1a",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 3,
  },
  itemTitle: {
    color: "#f8f8ff",
    fontSize: 13,
    fontWeight: "600",
  },
  itemMeta: {
    color: "#d2d5df",
    fontSize: 11,
  },
  empty: {
    color: "#d2d5df",
    fontSize: 12,
    fontStyle: "italic",
  },
});
