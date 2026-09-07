"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { normalizeTipTapContent } from "@/lib/story/tiptap";
import StarterKit from "@tiptap/starter-kit";
import type { Level } from "@tiptap/extension-heading";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import styles from "./tiptap-editor.module.css";

type TipTapEditorProps = {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
};

/**
 * TipTap rich-text editor with a CONSTRAINED schema per Phase 2 brief §9:
  * paragraph, heading (h2/h3), bold, italic, strike, link only.
 *
 * No tables, embeds, inline images, or arbitrary HTML. The bounded extension
 * set is what makes the "no dangerouslySetInnerHTML" safety guarantee real —
 * only nodes we explicitly allow can ever be produced.
 */
export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  // Never let a malformed/legacy content value reach TipTap's parser: a legacy
  // BlockComposer array or other shape crashes EditorState.create with
  // "config.doc.type is undefined". Normalize at the boundary; non-doc values
  // become an empty editor. (Studio also normalizes on load, but this keeps
  // the editor self-contained and crash-proof.)
  const docContent = normalizeTipTapContent(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable everything we don't want; keep only the constrained set.
        heading: { levels: [2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener" } },
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        horizontalRule: false,
        // StarterKit bundles these marks by default; opt out to keep the
        // constrained schema tight (no underline, no inline code).
        underline: false,
        code: false,
      }),
    ],
    content: docContent,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON());
    },
  });

          // Sync external content changes (e.g. loading saved story) into the editor.
  // IMPORTANT: use the NORMALIZED doc (docContent), not the raw prop. The raw
  // prop may be a legacy block array; setContent on that shape loses the text
  // (blocks whose field is `text` rather than a `content:[{type:"text"}]` node
  // are dropped by TipTap's parser). Normalizing keeps every external write
  // (legacy-loaded content included) in safe TipTap doc form. The JSON.stringify
  // guard prevents a feedback loop with the editor's own onUpdate -> onChange.
  useEffect(() => {
    if (editor && docContent) {
      const current = editor.getJSON();
      if (JSON.stringify(current) !== JSON.stringify(docContent)) {
        editor.commands.setContent(docContent);
      }
    }
  }, [docContent, editor]);


  if (!editor) return null;

  const headingActive = (level: Level) => editor.isActive("heading", { level });

  const setHeading = (level: Level) => {
    if (headingActive(level)) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <Button
          variant={headingActive(2) ? "primary" : "secondary"}
          type="button"
          onClick={() => setHeading(2)}
          style={{ fontWeight: 700 }}
        >
          H2
        </Button>
        <Button
          variant={headingActive(3) ? "primary" : "secondary"}
          type="button"
          onClick={() => setHeading(3)}
          style={{ fontWeight: 700 }}
        >
          H3
        </Button>
        <Button
          variant={editor.isActive("bold") ? "primary" : "secondary"}
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ fontWeight: 700 }}
        >
          B
        </Button>
        <Button
          variant={editor.isActive("italic") ? "primary" : "secondary"}
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ fontStyle: "italic" }}
        >
          I
        </Button>
        <Button
          variant={editor.isActive("strike") ? "primary" : "secondary"}
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ textDecoration: "line-through" }}
        >
          S
        </Button>
        <Button
          variant={editor.isActive("link") ? "primary" : "secondary"}
          type="button"
          onClick={() => {
            const url = window.prompt("Link URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </Button>
      </div>

      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
