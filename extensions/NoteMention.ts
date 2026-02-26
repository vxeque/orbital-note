// extensions/NoteMention.ts
import { Node, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';

export const NoteMention = Mention.extend({
  name: 'noteMention',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-note-id'),
        renderHTML: attributes => {
          if (!attributes.id) return {};
          return { 'data-note-id': attributes.id };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) return {};
          return { 'data-label': attributes.label };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-note-mention]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        this.options.HTMLAttributes,
        { 'data-note-mention': '' },
        { class: 'note-mention' },
        HTMLAttributes
      ),
      `@${node.attrs.label}`,
    ];
  },
});