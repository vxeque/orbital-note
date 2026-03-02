import React, { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Editor } from "@tiptap/core";
import { Note, Block } from "@/types/types";

interface WebEditorProps {
  initialContent: string;
  isDark: boolean;
  allNotes: Note[];
  onContentChange?: (html: string, blocks: Block[]) => void;
  onMentionQuery?: (query: string, position: number) => void;
  onMentionClose?: () => void;
}

const WebEditor: React.FC<WebEditorProps> = ({
  initialContent,
  isDark,
  allNotes,
  onContentChange,
  onMentionQuery,
  onMentionClose,
}) => {
  const handleMentionTrigger = useCallback((editorInstance: Editor) => {
    console.log('WebEditor handleMentionTrigger called');
    const { from } = editorInstance.state.selection;
    const text = editorInstance.state.doc.textBetween(0, from, " ");
    console.log('WebEditor text:', text);
    const lastAtIndex = text.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      console.log('WebEditor textAfterAt:', textAfterAt);
      // Mostrar sugerencias si no hay espacio ni newline después del @
      // (incluyendo el caso donde solo hay @ y el cursor está justo después)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        if (onMentionQuery) {
          // Pasar el query (puede estar vacío si solo hay @)
          onMentionQuery(textAfterAt, lastAtIndex);
        }
        return;
      }
    }
    if (onMentionClose) {
      onMentionClose();
    }
  }, [onMentionQuery, onMentionClose]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "web-editor-content",
      },
      handlePaste: (view, event) => {
        const pastedText = event.clipboardData?.getData("text/plain")?.trim();

        if (!pastedText) {
          return false;
        }

        // Ensure URLs are always inserted on paste in web and marked as links.
        if (/^https?:\/\/\S+$/i.test(pastedText)) {
          event.preventDefault();

          const { state, dispatch } = view;
          const { from, to } = state.selection;
          const linkMark = state.schema.marks.link;

          if (!linkMark) {
            return false;
          }

          const textNode = state.schema.text(pastedText, [
            linkMark.create({ href: pastedText }),
          ]);

          dispatch(state.tr.replaceRangeWith(from, to, textNode).scrollIntoView());
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (onContentChange) {
        const html = editorInstance.getHTML();
        const blocks = extractBlocks(html);
        onContentChange(html, blocks);
      }
      handleMentionTrigger(editorInstance);
    },
    onSelectionUpdate: ({ editor: editorInstance }) => {
      handleMentionTrigger(editorInstance);
    },
  });

  useEffect(() => {
    if (editor) {
      (window as any).tiptapEditor = editor;
    }
  }, [editor]);

  const extractBlocks = (html: string): Block[] => {
    const regex = /<([^>]+) data-block-id="([^"]+)"[^>]*>(.*?)<\/\1>/g;
    const blocks: Block[] = [];
    let match;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    tempDiv.querySelectorAll("p, h1, h2, h3, blockquote, li").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const blockId = el.getAttribute("data-block-id") || generateId();
      const content = el.textContent?.substring(0, 100) || "";

      if (content) {
        blocks.push({
          id: blockId,
          type:
            tag === "p"
              ? "paragraph"
              : tag.startsWith("h")
                ? "heading"
                : tag === "blockquote"
                  ? "blockquote"
                  : "list",
          content,
        });
      }
    });

    return blocks;
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  useEffect(() => {
    if (editor) {
      const style = document.createElement("style");
      style.textContent = `
        .web-editor-content {
          min-height: 300px;
          padding: 16px;
          font-size: 15px;
          color: ${isDark ? "#ffffff" : "#000000"};
          background-color: ${isDark ? "black" : "#ffffff"};
          outline: none;
          border-radius: 8px;
          font-family: Arial;
          line-height: 1;
        }
        
        .web-editor-content p {
          margin: 0 0 0.5em 0;
        }
        
        .web-editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .web-editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .web-editor-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
        }
        
        .web-editor-content blockquote {
          border-left: 4px solid #4a9eff;
          padding-left: 16px;
          margin-left: 0;
          font-style: italic;
          opacity: 0.9;
        }
        
        .web-editor-content ul, .web-editor-content ol {
          padding-left: 24px;
          margin: 12px 0;
          
          }
        
        .web-editor-content ul {
          list-style-type: disc;
          
          }
        
        .web-editor-content ol {
          list-style-type: decimal;
          
        }
        
        .web-editor-content a {

          text-decoration: underline;
        }
        
        .web-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        
        .note-mention {
          background-color: #4a9eff33;
          color: #4a9eff;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 760px) {
          .web-editor-content {
            padding: 12px;
            font-size: 16px;
            line-height: 1.45;
          }
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, [editor, isDark]);

  if (!editor) {
    return null;
  }

  return (
    <div style={{ flex: 1, padding: 5 }}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default WebEditor;
