// components/EditorView.tsx
import React, { useEffect, useState, useReducer, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { Note, Block } from "@/types/types";
import TextEditorToolbar from "@/components/TextEditorToolbar";
import CustomAlert from "@/components/modal/CustonAlert";
import {
  RichText,
  useEditorBridge,
  TenTapStartKit,
} from "@10play/tentap-editor";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MentionSuggestions } from "@/components/MentionSuggestions";
import { MentionNavigationButtons } from "@/components/MentionNavigationButtons";
import WebEditor from "@/components/WebEditor";
import WebToolbar from "@/components/WebToolbar";

const isWeb = Platform.OS === "web";

interface EditorViewProps {
  onSave?: (note: Partial<Note>) => void;
  onBack?: () => void;
  isDark?: boolean;
}

const EditorView: React.FC<EditorViewProps> = ({
  onSave,
  onBack,
  isDark = true,
}) => {
  const { existingNoteId: existingNoteIdParam, allNotesData } = useLocalSearchParams();
  const parsedNotes = allNotesData ? JSON.parse(allNotesData as string) : [];
  const allNotes: Note[] = parsedNotes;
  const existingNote: Note | undefined = existingNoteIdParam
    ? allNotes.find((note) => note.id === existingNoteIdParam)
    : undefined;

  const allNotesRef = useRef(allNotes);
  const existingNoteIdRef = useRef(existingNoteIdParam);

  useEffect(() => {
    allNotesRef.current = allNotes;
    existingNoteIdRef.current = existingNoteIdParam;
  }, [allNotes, existingNoteIdParam]);

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Trabajo");
  const [_, forceRerender] = useReducer((v) => v + 1, 0);
  const [editorHeight, setEditorHeight] = useState(100);

  // Estados para menciones
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionTriggerPos, setMentionTriggerPos] = useState<number | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");

  // Estado para el editor web
  const [webContent, setWebContent] = useState(existingNote?.content || "");
  const [webBlocks, setWebBlocks] = useState<Block[]>([]);

  const mobileEditorBridge = useEditorBridge({
    initialContent: existingNote?.content || "",
    dynamicHeight: true,
    autofocus: true,
    bridgeExtensions: TenTapStartKit,
  });

  const editor = isWeb ? null : (mobileEditorBridge as any);

  const [showAlert, setShowAlert] = useState(false);
  const [showAlertNotSaved, setShowAlertNotSaved] = useState(false);
  const [showNotTitleAlert, setShowNotTitleAlert] = useState(false);

  const isDarkTheme = isDark ?? true;
  const bgColor = isDarkTheme ? "black" : "#ffffff";
  const textColor = isDarkTheme ? "#ffffff" : "#000000";
  const borderColor = isDarkTheme ? "#333333" : "#e0e0e0";
  const subtextColor = isDarkTheme ? "#999999" : "#666666";

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setTag(existingNote.tag);
    } else {
      setTitle("");
      setTag("Personal");
    }
  }, [existingNote?.id]);

  // Detectar menciones mediante inyeccion de JavaScript
  const checkForMentions = useCallback(() => {
    if (!editor?.webviewRef?.current || isWeb) return;

    const script = `
      (function() {
        try {
          const prosemirror = document.querySelector('.ProseMirror');
          if (!prosemirror) return;
          
          const text = prosemirror.textContent || '';
          const lastAtIndex = text.lastIndexOf('@');
          
          if (lastAtIndex === -1) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mention-check',
              hasMention: false
            }));
            return;
          }
          
          const textAfterAt = text.substring(lastAtIndex + 1);
          
          // Si hay espacio o salto de linea, no hay mencion activa
          if (textAfterAt.includes(' ') || textAfterAt.includes('\\n')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mention-check',
              hasMention: false
            }));
            return;
          }
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mention-check',
            hasMention: true,
            query: textAfterAt,
            position: lastAtIndex
          }));
        } catch (error) {
          console.error('Error checking mentions:', error);
        }
      })();
    `;

    editor.webviewRef.current.injectJavaScript(script);
  }, [editor, isWeb]);

  // Polling cada 300ms para verificar menciones
  useEffect(() => {
    if (isWeb || !editor) return;

    const interval = setInterval(() => {
      checkForMentions();
    }, 300);

    return () => clearInterval(interval);
  }, [isWeb, editor, checkForMentions]);

  // Insertar mencion usando inyeccion de JavaScript
  const insertMention = useCallback(async (note: Note) => {
    if (!editor?.webviewRef?.current || mentionTriggerPos === null) return;

    const script = `
      (function() {
        try {
          const prosemirror = document.querySelector('.ProseMirror');
          if (!prosemirror) return;
          
          const text = prosemirror.textContent || '';
          const lastAtIndex = text.lastIndexOf('@');
          
          if (lastAtIndex === -1) return;
          
          // Crear un range para seleccionar desde @ hasta el final de la query
          const selection = window.getSelection();
          const range = document.createRange();
          
          // Encontrar el nodo de texto que contiene el @
          let textNode = null;
          let walker = document.createTreeWalker(
            prosemirror,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let currentPos = 0;
          while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent.length;
            
            if (currentPos + nodeLength > lastAtIndex) {
              textNode = node;
              break;
            }
            currentPos += nodeLength;
          }
          
          if (!textNode) return;
          
          // Calcular la posicion dentro del nodo
          const posInNode = lastAtIndex - currentPos;
          const textAfterAt = text.substring(lastAtIndex + 1);
          const queryLength = textAfterAt.search(/[\\s\\n]/) === -1 
            ? textAfterAt.length 
            : textAfterAt.search(/[\\s\\n]/);
          
          // Seleccionar el texto a reemplazar
          range.setStart(textNode, posInNode);
          range.setEnd(textNode, posInNode + queryLength + 1);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Crear el elemento de mencion
          const mention = document.createElement('span');
          mention.className = 'note-mention';
          mention.setAttribute('data-note-id', '${note.id}');
          mention.setAttribute('contenteditable', 'false');
          mention.textContent = '@${note.title.replace(/'/g, "\\'")}';
          
          // Reemplazar el texto seleccionado
          range.deleteContents();
          range.insertNode(mention);
          
          // Anadir espacio despues
          const space = document.createTextNode(' ');
          range.collapse(false);
          range.insertNode(space);
          
          // Mover el cursor despues del espacio
          range.setStartAfter(space);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Disparar evento de input para que TenTap detecte el cambio
          prosemirror.dispatchEvent(new Event('input', { bubbles: true }));
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mention-inserted',
            noteId: '${note.id}'
          }));
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mention-error',
            error: error.message
          }));
        }
      })();
    `;

    editor.webviewRef.current.injectJavaScript(script);

    setShowMentionSuggestions(false);
    setMentionTriggerPos(null);
    setCurrentQuery("");
  }, [editor, mentionTriggerPos]);

  // Navegacion
  const moveUp = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : mentionSuggestions.length - 1));
  };

  const moveDown = () => {
    setSelectedIndex((prev) => (prev < mentionSuggestions.length - 1 ? prev + 1 : 0));
  };

  const selectCurrent = () => {
    if (mentionSuggestions[selectedIndex]) {
      insertMention(mentionSuggestions[selectedIndex]);
    }
  };

  // Manejar mensajes del WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'height') {
        setEditorHeight(data.value + 20);
      }

      if (data.type === 'mention-check') {
        if (data.hasMention) {
          const query = data.query.toLowerCase();
          setCurrentQuery(query);

          const filtered = (query === ''
            ? allNotesRef.current
            : allNotesRef.current.filter(note =>
              note.title.toLowerCase().includes(query)
            ))
            .filter(note => note.id !== existingNoteIdRef.current)
            .slice(0, 10);

          if (filtered.length > 0) {
            setMentionSuggestions(filtered);
            setShowMentionSuggestions(true);
            setMentionTriggerPos(data.position);
            setSelectedIndex(0);
          } else {
            setShowMentionSuggestions(false);
          }
        } else {
          setShowMentionSuggestions(false);
          setCurrentQuery("");
        }
      }

      if (data.type === 'mention-inserted') {
        console.log('Mencion insertada:', data.noteId);
      }

      if (data.type === 'mention-error') {
        console.error('Error al insertar mencion:', data.error);
      }
    } catch (error) {
      // Ignorar mensajes no JSON
    }
  };

  // cambios en el editor para detectar menciones y estilos personalizados 
  useEffect(() => {
    if (editor) {
      editor.injectCSS(`
        body, .ProseMirror {
          margin: 0;
          padding: 0;
          color: #fff;
          font-size: 12px;
          font-family: Arial;
          line-height: 1;
          background-color: black;
        }

        /* Estilos para menciones de notas */
        .note-mention {
          background-color: #4a9eff33;
          color: #4a9eff;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
          display: inline-block;
          margin: 0 2px;
        }
        
        .note-mention:hover {
          background-color: #4a9eff55;
        }

        /* Estilos para blockquote */
        .ProseMirror blockquote {
          border-left: 4px solid #4a9eff;
          padding-left: 16px;
          margin-left: 0;
          margin-right: 0;
          color: #fff;
          font-style: italic;
          opacity: 0.9;
        }

        /* Listas */
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

        .ProseMirror p.is-empty::before {
          color: #666;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `);
    }
  }, [editor]);

  const sanitizeNoteHtml = (html: string): string => {
    let safe = html ?? "";

    safe = safe.replace(/\0/g, "");
    safe = safe.replace(
      /<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ""
    );
    safe = safe.replace(
      /<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?\s*>/gi,
      ""
    );
    safe = safe.replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
    safe = safe.replace(
      /\s(href|src)\s*=\s*(['"])\s*(javascript:|vbscript:|data:text\/html)[\s\S]*?\2/gi,
      ' $1="#"'
    );
    safe = safe.replace(
      /\s(href|src)\s*=\s*(javascript:|vbscript:|data:text\/html)[^\s>]*/gi,
      ' $1="#"'
    );

    return safe;
  };

  const extractReferences = (html: string): string[] => {
    const regex = /data-note-id="([^"]+)"/g;
    const references: string[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (match[1] && match[1] !== existingNote?.id) {
        references.push(match[1]);
      }
    }

    return [...new Set(references)];
  };

  const extractBlocks = (html: string): Block[] => {
    const regex = /<([^>]+)data-block-id="([^"]+)"[^>]*>(.*?)<\/\1>/g;
    const blocks: Block[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const tag = match[1];
      const blockId = match[2];
      const content = match[3].replace(/<[^>]+>/g, '').trim();

      if (content) {
        blocks.push({
          id: blockId,
          type: tag === 'p' ? 'paragraph' :
            tag.startsWith('h') ? 'heading' :
              tag === 'blockquote' ? 'blockquote' : 'list',
          content: content.substring(0, 100),
        });
      }
    }

    return blocks;
  };

  const handleSaveWeb = async () => {
    if (!title.trim()) {
      setShowNotTitleAlert(true);
      return;
    }

    try {
      const sanitizedContent = sanitizeNoteHtml(webContent);
      const outgoingReferences: string[] = [];
      const refRegex = /data-note-id="([^"]+)"/g;
      let match;
      while ((match = refRegex.exec(sanitizedContent)) !== null) {
        if (match[1] && match[1] !== existingNote?.id) {
          outgoingReferences.push(match[1]);
        }
      }

      const noteId = existingNote?.id || Date.now().toString();
      const newNote: Note = {
        id: noteId,
        title,
        content: sanitizedContent,
        tag,
        date: new Date().toISOString(),
        references: {
          outgoing: [...new Set(outgoingReferences)],
          incoming: existingNote?.references?.incoming || [],
        },
        blocks: webBlocks,
      };

      let existingNotes: Note[] = [];
      const webNotesJson = localStorage.getItem('orbital-notes');
      existingNotes = webNotesJson ? JSON.parse(webNotesJson) : [];

      const updatedNotes = existingNotes.filter(n => n.id !== noteId);
      updatedNotes.push(newNote);

      localStorage.setItem('orbital-notes', JSON.stringify(updatedNotes));

      setShowAlert(true);
    } catch (error) {
      setShowAlertNotSaved(true);
      console.error('Error saving note:', error);
    }
  };

  const handleSave = async () => {
    console.log('Intentando guardar nota con titulo:', title);

    console.log('esperandx', await Promise.race([
      editor.getHTML(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: editor.getHTML() tardo demasiado')), 5000)
      )
    ]))

    if (!title.trim()) {
      setShowNotTitleAlert(true);
      return;
    }

    try {
      const rawContentHTML = await editor.getHTML();
      const contentHTML = sanitizeNoteHtml(rawContentHTML);
      console.log('Contenido HTML a guardar:', contentHTML);
      const outgoingReferences = extractReferences(contentHTML);
      const blocks = extractBlocks(contentHTML);

      const noteId = existingNote?.id || Date.now().toString();
      const newNote: Note = {
        id: noteId,
        title,
        content: contentHTML,
        tag,
        date: new Date().toISOString(),
        references: {
          outgoing: outgoingReferences,
          incoming: existingNote?.references?.incoming || [],
        },
        blocks,
      };

      const mobileNotesJson = await AsyncStorage.getItem('orbital-notes');
      let existingNotes: Note[] = mobileNotesJson ? JSON.parse(mobileNotesJson) : [];

      const updatedNotes = existingNotes.filter(n => n.id !== noteId);
      updatedNotes.push(newNote);

      await AsyncStorage.setItem('orbital-notes', JSON.stringify(updatedNotes));

      setShowAlert(true);
      router.push('/listview')
    } catch (error) {
      console.error('Error saving note:', error);
      setShowAlertNotSaved(true);
    }
  };

  const { width, height } = useWindowDimensions();
  const isCompactWeb = isWeb && width < 760;
  const isSmallWeb = isWeb && width < 430;

  return (
    <SafeAreaView style={[isWeb ? styles.containerWeb : styles.containerMovil, { backgroundColor: bgColor }]}>
      <View style={[styles.mainCanvas, isWeb && styles.mainCanvasWeb]}>
        {isWeb ? (
          <View
            style={[
              styles.webHeader,
              isCompactWeb && styles.webHeaderCompact,
              { backgroundColor: bgColor },
            ]}
          >
            <View style={[styles.webHeaderSingleRow, isCompactWeb && styles.webHeaderSingleRowCompact]}>
              <TouchableOpacity style={[styles.backButton, styles.backButtonCompact]} onPress={() => router.push('/listview')}>
                <FontAwesome name="arrow-left" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <View style={styles.styleTag}>
              <Text
                style={[styles.headerMainTitle, styles.headerMainTitleCompact, isSmallWeb && styles.headerMainTitleSmall, { color: textColor }]}
                numberOfLines={1}
              >
                {existingNote ? "Editar Nota" : "Nueva Nota"}
              </Text>
              <Text style={[styles.headerTagBadge, styles.headerTagBadgeCompact, { color: textColor }]} numberOfLines={1}>
                {tag} <FontAwesome name="tag" size={12} color="#ffffff" />
              </Text>

            </View>
            <Pressable
              onPress={handleSaveWeb}
              style={({ pressed, hovered }) => [
                styles.saveButton,
                styles.saveButtonPrimary,
                styles.saveButtonCompact,
                (pressed || hovered) && styles.saveButtonPrimaryHover,
              ]}
            >
              <Text style={[styles.saveButtonText, styles.saveButtonTextCompact]}>Guardar</Text>
            </Pressable>
          </View>
          </View>
      ) : (
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/listview')}>
          <FontAwesome name="arrow-left" size={22} color="#3b82f6" />
        </TouchableOpacity>
        <View style={[styles.headerTitleWrap, styles.headerTitleWrapMobile]}>
          <Text style={[styles.headerMainTitle, { color: textColor }]} numberOfLines={1}>
            {existingNote ? "Editar Nota" : "Nueva Nota"}
          </Text>
          <Text style={[styles.headerTagBadge, { color: textColor }]} numberOfLines={1}>
            {tag} <FontAwesome name="tag" size={12} color="#ffffff" />
          </Text>
        </View>
        <Pressable
          onPress={handleSave}
          style={({ pressed, hovered }) => [
            styles.saveButton,
            styles.saveButtonPrimary,
            (pressed || hovered) && styles.saveButtonPrimaryHover,
          ]}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </Pressable>
      </View>
        )}
      {/* modales */}
      <CustomAlert
        visible={showAlert}
        title="Guardado"
        message="Nota guardada correctamente."
        onClose={() => setShowAlert(false)}
      />

      {/* modal para cuando no se guardo */}
      <CustomAlert
        visible={showAlertNotSaved}
        title="Error al guardar"
        message="No se pudo guardar la nota."
        onClose={() => setShowAlertNotSaved(false)}
      />

      <CustomAlert
        visible={showNotTitleAlert}
        title="Error al guardar"
        message="Por favor, introduce un titulo."
        onClose={() => setShowNotTitleAlert(false)}
      />

      <Pressable style={[styles.titleInputWrap, isWeb && styles.titleInputWrapWeb]}>
        {({ hovered }) => (
          <TextInput
            style={[
              styles.titleInput,
              isCompactWeb && styles.titleInputCompact,
              { color: textColor },
              hovered && { borderColor: '#3b82f6', backgroundColor: '#3b83f65e' },
            ]}
            placeholder="INTRODUCE UN TITULO"
            placeholderTextColor={subtextColor}
            value={title}
            onChangeText={setTitle}
          />)}
      </Pressable>

      {/* Sugerencias de menciones */}
      {showMentionSuggestions && mentionSuggestions.length > 0 && (
        <>
          <MentionSuggestions
            notes={mentionSuggestions}
            selectedIndex={selectedIndex}
            onSelect={insertMention}
            onClose={() => setShowMentionSuggestions(false)}
            isDark={isDarkTheme}
          />

          <MentionNavigationButtons
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onSelect={selectCurrent}
            isDark={isDarkTheme}
          />
        </>
      )}

      {isWeb ? (
        <ScrollView
          style={[styles.content, { backgroundColor: bgColor }]}
          contentContainerStyle={[styles.contentContainer, styles.contentContainerWeb]}
        >
          <View
            style={[
              styles.editorSurface,
              styles.editorSurfaceWeb,
              {
                minHeight: 300,
                backgroundColor: bgColor,
                borderColor: borderColor,
              },
            ]}
          >
            <WebEditor
              initialContent={existingNote?.content || ""}
              isDark={isDarkTheme}
              allNotes={allNotes}
              onContentChange={(html, blocks) => {
                setWebContent(html);
                setWebBlocks(blocks);
              }}
              onMentionQuery={(query, position) => {
                const filtered = (query === ''
                  ? allNotes
                  : allNotes.filter(note =>
                    note.title.toLowerCase().includes(query.toLowerCase())
                  ))
                  .filter(note => note.id !== existingNote?.id)
                  .slice(0, 10);

                if (filtered.length > 0) {
                  setMentionSuggestions(filtered);
                  setShowMentionSuggestions(true);
                  setMentionTriggerPos(position);
                  setSelectedIndex(0);
                } else {
                  setShowMentionSuggestions(false);
                }
              }}
              onMentionClose={() => {
                setShowMentionSuggestions(false);
                setMentionTriggerPos(null);
              }}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={[styles.content, { backgroundColor: bgColor }]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{
            minHeight: 100,
            height: height,
            backgroundColor: bgColor,
            // borderColor: borderColor,
            // borderRadius: 8,
          }}>
            <RichText
              editor={editor}
              style={{ backgroundColor: 'transparent' }}
              onMessage={handleMessage}
            />
          </View>
        </ScrollView>
      )}

      {isWeb ? (
        <WebToolbar isDark={isDarkTheme} onSave={handleSaveWeb} />
      ) : (
        <TextEditorToolbar editor={editor} isDark={isDarkTheme} />
      )}
    </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  containerMovil: {
    flex: 1,
  },
  containerWeb: {
    flex: 1,
    width: "100%",
  },
  mainCanvas: {
    flex: 1,
  },
  mainCanvasWeb: {
    width: "100%",
    maxWidth: 1450,
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 1,
    paddingVertical: 9,
  },
  webHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginTop: 10,
    borderRadius: 14,
  },
  webHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  webHeaderSingleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    gap: 6,
  },
  webHeaderSingleRowCompact: {
    gap: 4,
  },
  webHeaderCompact: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  headerTitleWrapCompact: {
    justifyContent: "flex-start",
    marginTop: 10,
  },
  headerTitleWrapMobile: {
    flex: 1,
    marginTop: 0,
    justifyContent: "center",
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backButtonCompact: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerMainTitle: {
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerMainTitleSmall: {
    fontSize: 13,
    maxWidth: "100%",
  },
  headerMainTitleCompact: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerTagBadge: {
    backgroundColor: "#ab3bf6c2",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "600",
  },
  headerTagBadgeCompact: {
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  styleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  saveButtonPrimary: {
    backgroundColor: "#2563eb",
  },
  saveButtonPrimaryHover: {
    backgroundColor: "#3b82f6",
  },
  saveButtonCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  saveButtonTextCompact: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 88,
  },
  contentContainerWeb: {
    paddingHorizontal: 0,
  },
  titleInputWrap: {
    marginHorizontal: 12,
    marginTop: 8,
  },
  titleInputWrapWeb: {
    marginHorizontal: 0,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    // borderWidth: 1,
    borderColor: "transparent",
    textTransform: "uppercase",
  },
  titleInputCompact: {
    fontSize: 17,
  },
  editorSurface: {
    borderRadius: 8,
    // padding: 8,
  },
  editorSurfaceWeb: {
    borderRadius: 14,
  },
});

export default EditorView;

