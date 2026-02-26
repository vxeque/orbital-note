import React, { useEffect, useState } from "react";
import { Note, Block } from "@/types/types";

interface WebToolbarProps {
  isDark: boolean;
  onSave: () => void;
}

const WebToolbar: React.FC<WebToolbarProps> = ({ isDark, onSave }) => {
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const editorEl = document.querySelector(".ProseMirror");
      if (editorEl && (window as any).tiptapEditor) {
        setEditorInstance((window as any).tiptapEditor);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const bgColor = isDark ? "#1a1a1a" : "#f5f5f5";
  const textColor = isDark ? "#ffffff" : "#000000";
  const borderColor = isDark ? "#333" : "#ddd";

  const buttonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: textColor,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "4px",
    margin: "0 2px",
  };

  const activeStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "#3b82f6",
    color: "white",
  };

  const handleClick = (command: string, value?: any) => {
    const editor = (window as any).tiptapEditor;
    if (!editor) return;

    switch (command) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "h1":
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "orderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
        break;
      case "color":
        const color = prompt("Enter color (e.g., red, #ff0000):", "red");
        if (color) {
          editor.chain().focus().setColor(color).run();
        }
        break;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: bgColor,
        borderRadius: "15px",
        padding: "8px 12px",
        display: "flex",
        gap: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        border: `1px solid ${borderColor}`,
        zIndex: 1000,
      }}
    >
      <button
        style={buttonStyle}
        onClick={() => handleClick("bold")}
        title="Bold"
      >
        B
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("italic")}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("strike")}
        title="Strike"
      >
        <s>S</s>
      </button>
      <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      <button
        style={buttonStyle}
        onClick={() => handleClick("h1")}
        title="Heading 1"
      >
        H1
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("h2")}
        title="Heading 2"
      >
        H2
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("h3")}
        title="Heading 3"
      >
        H3
      </button>
      <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      <button
        style={buttonStyle}
        onClick={() => handleClick("bulletList")}
        title="Bullet List"
      >
        •
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("orderedList")}
        title="Ordered List"
      >
        1.
      </button>
      <button
        style={buttonStyle}
        onClick={() => handleClick("blockquote")}
        title="Quote"
      >
        &quot;
      </button>
      <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      <button
        style={buttonStyle}
        onClick={() => handleClick("link")}
        title="Link"
      >
        🔗
      </button>
      <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      {/* boton blanco */}
      <button
        style={{ ...buttonStyle, color: "white" }}
        onClick={() => handleClick("color", "white")}
        title="White Color"
      >
        A
      </button>
      {/* boton rojo */}
      <button
        style={{ ...buttonStyle, color: "red" }}
        onClick={() => handleClick("color", "red")}
        title="Red Color"
      >
        A
      </button>
      {/* boton verde */}
      <button
        style={{ ...buttonStyle, color: "green" }}
        onClick={() => handleClick("color", "green")}
        title="Green Color"
      >
        A
      </button>
      <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      <button
        style={{ ...buttonStyle, color: "white" }}
        onClick={() => handleClick("color", "green")}
        title="Table"
      >
        𝄜
      </button>
      {/* <span style={{ width: 1, background: borderColor, margin: "0 4px" }} />
      <button
        style={{ ...buttonStyle, color: "#3b82f6", fontWeight: "bold" }}
        onClick={onSave}
        title="Save"
      >
        Save
      </button> */}
    </div>
  );
};

export default WebToolbar;
