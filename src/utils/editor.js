import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Link from '@tiptap/extension-link';
import Paragraph from '@tiptap/extension-paragraph';
import Document from '@tiptap/extension-document';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';

export function getEditorConfig({placeholder, autofocus = false, content = ''}) {
    return {
        extensions: [
            Document,
            Text,
            Paragraph,
            Link.configure({
                openOnClick: false
            }),
            Placeholder.configure({
                placeholder
            }),
            Blockquote.configure({}),

            // Enable shift + enter to insert <br> tags
            HardBreak.configure({})
        ],
        content,
        autofocus,
        editorProps: {
            attributes: {
                class: `gh-comment-content focus:outline-0`
            }
        },
        parseOptions: {
            preserveWhitespace: 'full'
        }
    };
}

/** We need to post process the HTML from tiptap, because tiptap by default */
