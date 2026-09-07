"use client";

import { useEditor, EditorContent } from "@tiptap/react";
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
 * paragraph, heading (h2/h3), bold, link only.
 *
 * No tables, embeds, inline images, or arbitrary HTML. The bounded extension
 * set is what makes the "no dangerouslySetInnerHTML" safety guarantee real —
 * only nodes we explicitly allow can ever be produced.
 */
export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
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
      }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor: e }) => {
      onChange(e.getJSON());
    },
  });

  // Sync external content changes (e.g. loading saved story) into the editor.
  useEffect(() => {
    if (editor && content) {
      const current = editor.getJSON();
      if (JSON.stringify(current) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

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
