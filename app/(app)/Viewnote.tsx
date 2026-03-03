import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Note } from "@/types/types";
import { RichText, useEditorBridge, TenTapStartKit } from "@10play/tentap-editor";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DOMPurify from "dompurify";
import { getTagBadgeStyle } from "@/utils/tagColors";

const isWeb = Platform.OS === "web";
const FAVORITE_TAGS = ["favorita", "favoritas", "favorite", "favorites", "favourite", "favourites"];
const ARCHIVED_TAGS = ["archivo", "archivada", "archivadas", "archivado", "archivados", "archive", "archived"];

interface NoteViewerViewProps {
  onBack?: () => void;
  isDark?: boolean;
}

const Viewnote: React.FC<NoteViewerViewProps> = ({ isDark = true }) => {
  const { existingNoteId: existingNoteIdParam, allNotesData } = useLocalSearchParams();
  const parsedNotes = allNotesData ? JSON.parse(allNotesData as string) : [];
  const allNotes: Note[] = parsedNotes;
  const existingNote: Note | undefined = existingNoteIdParam
    ? allNotes.find((note) => note.id === existingNoteIdParam)
    : undefined;

  const [editorHeight, setEditorHeight] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? "black" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#000000";
  const borderColor = isDarkTheme ? "#333333" : "#e0e0e0";
  const subtextColor = isDarkTheme ? "#999999" : "#666666";
  const noteTagStyle = getTagBadgeStyle(existingNote?.tag, existingNote?.tagColor);

  const allNotesDataSerialized = useMemo(() => JSON.stringify(allNotes), [allNotes]);
  const normalizeTag = (tag?: string) => (tag || "").trim().toLowerCase();
  const sortedNotes = useMemo(
    () => [...allNotes].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()),
    [allNotes]
  );
  const favoriteNotes = useMemo(
    () => sortedNotes.filter((note) => FAVORITE_TAGS.includes(normalizeTag(note.tag))),
    [sortedNotes]
  );
  const archivedNotes = useMemo(
    () => sortedNotes.filter((note) => ARCHIVED_TAGS.includes(normalizeTag(note.tag))),
    [sortedNotes]
  );

  const mobileEditorBridge = useEditorBridge({
    initialContent: existingNote?.content || "",
    dynamicHeight: true,
    autofocus: false,
    editable: false,
    bridgeExtensions: TenTapStartKit,
  });
  const editor = isWeb ? null : (mobileEditorBridge as any);

  const sanitizeNoteHtml = (html: string) =>
    DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "link", "meta"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
      ALLOWED_URI_REGEXP:
        /^(?:(?:https?|mailto|tel|data|blob|ftp|file|sms|callto|webcal|irc|news|urn):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });

  useEffect(() => {
    if (editor) {
      editor.injectCSS(`
        body, .ProseMirror {
          margin: 0;
          padding: 0;
          color: #fff;
          font-size: 18px;
          font-family: Arial;
          line-height: 1.5;
          background-color: black;
          user-select: none;
          -webkit-user-select: none;
          pointer-events: none;
          cursor: default;
          caret-color: transparent;
        }
        .note-mention {
          background-color: #4a9eff33;
          color: #4a9eff;
          padding: 2px 6px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          margin: 0 2px;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #4a9eff;
          padding-left: 16px;
          margin-left: 0;
          margin-right: 0;
          color: #fff;
          font-style: italic;
          opacity: 0.9;
        }
        .ProseMirror ul {
          padding-left: 24px;
          margin: 12px 0;
          list-style-type: disc;
        }
        .ProseMirror ul li {
          color: #fff;
          margin: 6px 0;
          padding-left: 8px;
        }
        .ProseMirror ul li::marker {
          color: #4a9eff;
          font-size: 1.2em;
        }
        .ProseMirror ol {
          padding-left: 24px;
          margin: 12px 0;
          list-style-type: decimal;
        }
        .ProseMirror ol li {
          color: #fff;
          margin: 6px 0;
          padding-left: 8px;
        }
        .ProseMirror ol li::marker {
          color: #4a9eff;
          font-weight: bold;
        }
        .ProseMirror:focus {
          outline: none;
          border: none;
          box-shadow: none;
        }
      `);
    }
  }, [editor]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "height") {
        setEditorHeight(data.value + 20);
      }
    } catch {}
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const safeContent = useMemo(() => sanitizeNoteHtml(existingNote?.content || ""), [existingNote?.content]);
  const { height } = Dimensions.get("window");

  const goToNote = (noteId: string) => {
    setIsSidebarOpen(false);
    router.push({
      pathname: "/Viewnote",
      params: {
        existingNoteId: noteId,
        allNotesData: allNotesDataSerialized,
      },
    });
  };

  const renderSidebarSection = (title: string, items: Note[], emptyText: string) => (
    <View style={styles.sidebarSection}>
      <Text style={[styles.sidebarSectionTitle, { color: textColor }]}>
        {title} ({items.length})
      </Text>
      {items.length > 0 ? (
        items.slice(0, 8).map((item) => (
          <TouchableOpacity
            key={`${title}-${item.id}`}
            style={[
              styles.sidebarItem,
              {
                borderColor,
                backgroundColor: item.id === existingNote?.id ? (isDarkTheme ? "#1f2937" : "#dbeafe") : "transparent",
              },
            ]}
            onPress={() => goToNote(item.id)}
          >
            <Text style={[styles.sidebarItemTitle, { color: textColor }]} numberOfLines={1}>
              {item.title || "Sin titulo"}
            </Text>
            <Text style={[styles.sidebarItemMeta, { color: subtextColor }]} numberOfLines={1}>
              {item.tag || "Sin tag"}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.sidebarEmptyText, { color: subtextColor }]}>{emptyText}</Text>
      )}
    </View>
  );

  const renderSidebarContent = (mobile = false) => (
    <ScrollView
      style={[
        styles.sidebar,
        mobile && styles.sidebarMobile,
        { backgroundColor: isDarkTheme ? "#0f172a" : "#f8fafc", borderColor },
      ]}
      contentContainerStyle={styles.sidebarContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sidebarTitle, { color: textColor }]}>Notas</Text>
      {renderSidebarSection("Favoritas", favoriteNotes, "Sin notas favoritas")}
      {renderSidebarSection("Archivadas", archivedNotes, "Sin notas archivadas")}
      {renderSidebarSection("Todas las notas", sortedNotes, "No hay notas")}
    </ScrollView>
  );

  if (!existingNote) {
    return (
      <SafeAreaView style={[styles.containerMovil, { backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: subtextColor, fontSize: 16 }}>Nota no encontrada.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/listview")}>
          <Text style={{ color: "#3b82f6", marginTop: 16 }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[isWeb ? styles.containerWeb : styles.containerMovil, { backgroundColor: bgColor }]}>
      <View style={[isWeb ? styles.webHeader : styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/listview")}>
          <FontAwesome name="arrow-left" size={22} color="#3b82f6" />
        </TouchableOpacity>

        <Text style={[styles.headerMainTitle, { color: textColor }]}>Ver Nota</Text>

        <View style={styles.headerActions}>
          {!isWeb && (
            <TouchableOpacity style={styles.sidebarToggleButton} onPress={() => setIsSidebarOpen(true)}>
              <FontAwesome name="list-ul" size={16} color="#3b82f6" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/editorview",
                params: {
                  existingNoteId: existingNote.id,
                  allNotesData: allNotesDataSerialized,
                },
              })
            }
          >
            <FontAwesome name="pencil" size={16} color="#3b82f6" />
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={isWeb ? styles.webBody : styles.mobileBody}>
        <ScrollView
          style={[styles.content, { backgroundColor: bgColor }]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="never"
        >
          <Text style={[styles.titleText, { color: textColor }]} selectable={false}>
            {existingNote.title}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: noteTagStyle.backgroundColor, borderColor: noteTagStyle.borderColor },
              ]}
            >
              <Text style={[styles.tagText, { color: noteTagStyle.color }]}>{existingNote.tag}</Text>
            </View>
            <Text style={[styles.dateText, { color: subtextColor }]}>{formatDate(existingNote.date)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {isWeb ? (
            <View style={{ minHeight: 300, backgroundColor: bgColor, borderRadius: 8, padding: 8 }} pointerEvents="none">
              <div
                style={{
                  color: textColor,
                  fontSize: 17,
                  lineHeight: 1.7,
                  fontFamily: "Arial, sans-serif",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </View>
          ) : (
            <View
              style={{
                minHeight: 100,
                height: height * 0.6,
                backgroundColor: bgColor,
                borderColor: borderColor,
                borderRadius: 8,
              }}
              pointerEvents="none"
            >
              <RichText
                editor={editor}
                style={{ backgroundColor: "transparent", minHeight: editorHeight }}
                onMessage={handleMessage}
                scrollEnabled={false}
              />
            </View>
          )}

          {existingNote.references?.outgoing && existingNote.references.outgoing.length > 0 && (
            <View style={[styles.referencesSection, { borderColor }]}>
              <Text style={[styles.referencesTitle, { color: subtextColor }]}>
                <FontAwesome name="link" size={13} color={subtextColor} /> Referencias
              </Text>
              {existingNote.references.outgoing.map((refId) => {
                const refNote = allNotes.find((n) => n.id === refId);
                return refNote ? (
                  <TouchableOpacity
                    key={refId}
                    style={styles.referenceChip}
                    onPress={() => goToNote(refNote.id)}
                  >
                    <Text style={styles.referenceChipText}>@ {refNote.title}</Text>
                  </TouchableOpacity>
                ) : null;
              })}
            </View>
          )}
        </ScrollView>

        {isWeb && renderSidebarContent()}
      </View>

      {!isWeb && isSidebarOpen && (
        <View style={styles.mobileSidebarOverlay}>
          <TouchableOpacity style={styles.mobileSidebarBackdrop} activeOpacity={1} onPress={() => setIsSidebarOpen(false)} />
          <View style={styles.mobileSidebarPanel}>{renderSidebarContent(true)}</View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerMovil: {
    flex: 1,
  },
  containerWeb: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mobileBody: {
    flex: 1,
  },
  webBody: {
    flex: 1,
    flexDirection: "row",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 9,
  },
  webHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 19,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginTop: 16,
  },
  backButton: {
    paddingRight: 8,
    paddingLeft: 8,
  },
  headerMainTitle: {
    fontSize: 14,
    fontWeight: "300",
    backgroundColor: "#3b84f8a4",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sidebarToggleButton: {
    padding: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  editButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 10,
    marginHorizontal: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    opacity: 0.4,
  },
  referencesSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  referencesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  referenceChip: {
    backgroundColor: "#4a9eff22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  referenceChipText: {
    color: "#4a9eff",
    fontSize: 13,
    fontWeight: "500",
  },
  sidebar: {
    width: 320,
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 16,
    marginRight: 8,
    flex: 0,
  },
  sidebarContent: {
    padding: 14,
    gap: 12,
  },
  sidebarMobile: {
    width: "100%",
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sidebarSection: {
    gap: 8,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sidebarItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  sidebarItemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  sidebarItemMeta: {
    fontSize: 11,
    textTransform: "capitalize",
  },
  sidebarEmptyText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  mobileSidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 40,
  },
  mobileSidebarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  mobileSidebarPanel: {
    width: "82%",
    maxWidth: 360,
    borderLeftWidth: 1,
    borderLeftColor: "#334155",
  },
});

export default Viewnote;
