// components/NoteViewerView.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Note } from "@/types/types";
import {
  RichText,
  useEditorBridge,
  TenTapStartKit,
} from "@10play/tentap-editor";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import DOMPurify from "dompurify";

const isWeb = Platform.OS === "web";

interface NoteViewerViewProps {
  onBack?: () => void;
  isDark?: boolean;
}

const Viewnote: React.FC<NoteViewerViewProps> = ({
  onBack,
  isDark = true,
}) => {
  const { existingNoteId: existingNoteIdParam, allNotesData } =
    useLocalSearchParams();
  const parsedNotes = allNotesData ? JSON.parse(allNotesData as string) : [];
  const allNotes: Note[] = parsedNotes;
  const existingNote: Note | undefined = existingNoteIdParam
    ? allNotes.find((note) => note.id === existingNoteIdParam)
    : undefined;

  const [editorHeight, setEditorHeight] = useState(100);

  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? "black" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#000000";
  const borderColor = isDarkTheme ? "#333333" : "#e0e0e0";
  const subtextColor = isDarkTheme ? "#999999" : "#666666";
  const tagBg = isDarkTheme ? "#1a1a2e" : "#e8f0fe";
  const tagColor = isDarkTheme ? "#4a9eff" : "#1a73e8";

  // Editor bridge solo lectura: sin autofocus, sin edición
  const mobileEditorBridge = useEditorBridge({
    initialContent: existingNote?.content || "",
    dynamicHeight: true,
    autofocus: false,
    editable: false,
    bridgeExtensions: TenTapStartKit,
  });

  const editor = isWeb ? null : (mobileEditorBridge as any);

  const sanitizeNoteHtml = (html: string) => DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "link", "meta"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data|blob|ftp|file|sms|callto|webcal|irc|news|urn):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  // Inyectar CSS para modo lectura
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
          /* Deshabilitar selección y cursor de edición */
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

        /* Ocultar cursor y borde de foco del editor */
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
    } catch (_) { }
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
    <SafeAreaView
      style={[
        isWeb ? styles.containerWeb : styles.containerMovil,
        { backgroundColor: bgColor },
      ]}
    >
      {/* Header */}
      <View
        style={[
          isWeb ? styles.webHeader : styles.header,
          { backgroundColor: bgColor },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/listview")}
        >
          <FontAwesome name="arrow-left" size={22} color="#3b82f6" />
        </TouchableOpacity>

        <Text style={[styles.headerMainTitle, { color: textColor }]}>
          Ver Nota
        </Text>

        {/* Botón Editar (navega al editor real si se necesita) */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/editor",
              params: {
                existingNoteId: existingNote.id,
                allNotesData: JSON.stringify(allNotes),
              },
            })
          }
        >
          <FontAwesome name="pencil" size={16} color="#3b82f6" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: bgColor }]}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
        // Desactivar interacciones que editen el contenido
        keyboardShouldPersistTaps="never"
      >
        {/* Título */}
        <Text
          style={[
            styles.titleText,
            { color: textColor },
          ]}
          selectable={false}
        >
          {existingNote.title}
        </Text>

        {/* Meta: tag + fecha */}
        <View style={styles.metaRow}>
          <View style={[styles.tagBadge, { backgroundColor: tagBg }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>
              {existingNote.tag}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: subtextColor }]}>
            {formatDate(existingNote.date)}
          </Text>
        </View>

        {/* Separador */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Contenido de la nota */}
        {isWeb ? (
          // Web: renderizar HTML directamente como lectura
          <View
            style={{
              minHeight: 300,
              backgroundColor: bgColor,
              borderRadius: 8,
              padding: 8,
            }}
            pointerEvents="none"
          >
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
          // Mobile: RichText en modo no editable
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
              style={{ backgroundColor: "transparent" }}
              onMessage={handleMessage}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Referencias salientes */}
        {existingNote.references?.outgoing &&
          existingNote.references.outgoing.length > 0 && (
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
                    onPress={() =>
                      router.push({
                        pathname: "/viewer",
                        params: {
                          existingNoteId: refNote.id,
                          allNotesData: JSON.stringify(allNotes),
                        },
                      })
                    }
                  >
                    <Text style={styles.referenceChipText}>
                      @ {refNote.title}
                    </Text>
                  </TouchableOpacity>
                ) : null;
              })}
            </View>
          )}
      </ScrollView>
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
});

export default Viewnote;