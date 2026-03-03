import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform, Dimensions, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Note } from "@/types/types";
import { RichText, useEditorBridge, TenTapStartKit } from "@10play/tentap-editor";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DOMPurify from "dompurify";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { getTagBadgeStyle } from "@/utils/tagColors";
import { useColorScheme } from "@/hooks/use-color-scheme";

const isWeb = Platform.OS === "web";

const Viewnote: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { existingNoteId: existingNoteIdParam, allNotesData } = useLocalSearchParams();
  const parsedNotes = allNotesData ? JSON.parse(allNotesData as string) : [];
  const allNotes: Note[] = parsedNotes;
  const existingNote: Note | undefined = existingNoteIdParam
    ? allNotes.find((note) => note.id === existingNoteIdParam)
    : undefined;

  const [editorHeight, setEditorHeight] = useState(100);

  const isDarkTheme = isDark;
  const bgColor = isDarkTheme ? "black" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#000000";
  const borderColor = isDarkTheme ? "#333333" : "#e0e0e0";
  const subtextColor = isDarkTheme ? "#999999" : "#666666";
  const noteTagStyle = getTagBadgeStyle(existingNote?.tag, existingNote?.tagColor);

  const allNotesDataSerialized = useMemo(() => JSON.stringify(allNotes), [allNotes]);

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

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const exportNoteToPdf = async () => {
    if (!existingNote) return;

    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              @page { size: auto; margin: 20mm 14mm; }
              * { box-sizing: border-box; }
              body {
                margin: 0;
                font-family: Arial, sans-serif;
                color: #111827;
                background: #ffffff;
              }
              .sheet {
                width: 100%;
                max-width: 860px;
              }
              .title {
                margin: 0 0 10px;
                font-size: 22px;
                font-weight: 800;
                letter-spacing: 0.2px;
                text-transform: uppercase;
                color: #000000;
                line-height: 1.1;
              }
              .meta-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
              }
              .tag-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 999px;
                border: 1px solid ${escapeHtml(noteTagStyle.borderColor)};
                background: ${escapeHtml(noteTagStyle.backgroundColor)};
                color: ${escapeHtml(noteTagStyle.color)};
                font-size: 12px;
                font-weight: 600;
                padding: 3px 10px;
                line-height: 1;
              }
              .date {
                font-size: 12px;
                color: #374151;
                line-height: 1.2;
              }
              .divider {
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 0 0 16px;
              }
              .content {
                font-size: 17px;
                line-height: 1.7;
                color: #000000;
                word-wrap: break-word;
              }
              .content p {
                margin: 0 0 14px;
              }
              .content p:last-child {
                margin-bottom: 0;
              }
              .note-mention {
                background-color: #4a9eff33;
                color: #2563eb;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <main class="sheet">
              <h1 class="title">${escapeHtml(existingNote.title)}</h1>
              <div class="meta-row">
                <span class="tag-pill">${escapeHtml(existingNote.tag || "Sin etiqueta")}</span>
                <span class="date">${escapeHtml(formatDate(existingNote.date))}</span>
              </div>
              <hr class="divider" />
              <div class="content">${safeContent}</div>
            </main>
          </body>
        </html>
      `;

      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (!printWindow) {
          Alert.alert("Error", "No se pudo abrir la ventana de impresion.");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar nota a PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("PDF generado", `Archivo creado en:\n${uri}`);
      }
    } catch {
      Alert.alert("Error", "No se pudo exportar la nota a PDF.");
    }
  };

  const goToNote = (noteId: string) => {
    router.push({
      pathname: "/Viewnote",
      params: {
        existingNoteId: noteId,
        allNotesData: allNotesDataSerialized,
      },
    });
  };

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
          <TouchableOpacity style={styles.pdfButton} onPress={exportNoteToPdf}>
            <FontAwesome name="file-pdf-o" size={18} color="#ef4444" />
            <Text style={styles.pdfButtonText}>PDF</Text>
          </TouchableOpacity>

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
      </View>
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
    flexDirection: "column",
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
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  pdfButtonText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
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
});

export default Viewnote;
