// utils/referenceManager.ts
import { Note } from "@/types/types";

export const updateIncomingReferences = (
  allNotes: Note[],
  savedNote: Note
): Note[] => {
  return allNotes.map(note => {
    if (note.id === savedNote.id) {
      return savedNote;
    }

    const isReferenced = savedNote.references?.outgoing.includes(note.id);
    const hasIncoming = note.references?.incoming.includes(savedNote.id);

    if (isReferenced && !hasIncoming) {
      // Añadir referencia entrante
      return {
        ...note,
        references: {
          outgoing: note.references?.outgoing || [],
          incoming: [...(note.references?.incoming || []), savedNote.id],
        },
      };
    } else if (!isReferenced && hasIncoming) {
      // Remover referencia entrante
      return {
        ...note,
        references: {
          outgoing: note.references?.outgoing || [],
          incoming: (note.references?.incoming || []).filter(id => id !== savedNote.id),
        },
      };
    }

    return note;
  });
};