// extensions/BlockId.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// Función simple para generar IDs únicos
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const BlockId = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'listItem'],
        attributes: {
          id: {
            default: null,
            parseHTML: element => element.getAttribute('data-block-id'),
            renderHTML: attributes => {
              if (!attributes.id) {
                return { 'data-block-id': generateId() };
              }
              return { 'data-block-id': attributes.id };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockId'),
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (
              ['paragraph', 'heading', 'blockquote', 'listItem'].includes(node.type.name) &&
              !node.attrs.id
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id: generateId(),
              });
              modified = true;
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});