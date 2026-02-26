export type ViewState = 'HOME' | 'LIST' | 'EDITOR';

// export interface Note {
//   id: string;
//   title: string;
//   content: string;
//   tag: string;
//   date: string;
// }

// types/index.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  date: string;
  references?: {
    outgoing: string[]; // IDs de notas que esta nota menciona
    incoming: string[]; // IDs de notas que mencionan esta nota
  };
  blocks?: Block[];
}

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'blockquote' | 'list';
  content: string;
}