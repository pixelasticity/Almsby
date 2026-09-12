"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { normalizeTipTapContent } from "@/lib/story/tiptap";
import StarterKit from "@tiptap/starter-kit";
import type { Level } from "@tiptap/extension-heading";
import { useEffect } from "react";
import FormatButton from "./FormatButton";
import styles from "./tiptap-editor.module.css";

type TipTapEditorProps = {
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
  /** id of the element that labels the editor content (accessibility). */
  ariaLabelledBy?: string;
};

/**
 * TipTap rich-text editor with a CONSTRAINED schema per Phase 2 brief §9:
 * paragraph, heading (h2-h6), bold, italic, strike, link only.
 * No tables, embeds, inline images, or arbitrary HTML. The bounded extension
 * set is what makes the "no dangerouslySetInnerHTML" safety guarantee real —
 * only nodes we explicitly allow can ever be produced.
 */
export default function TipTapEditor({ content, onChange, ariaLabelledBy }: TipTapEditorProps) {
  // Never let a malformed/legacy content value reach TipTap's parser: a legacy
  // BlockComposer array or other shape crashes EditorState.create with
  // "config.doc.type is undefined". Normalize at the boundary; non-doc values
  // become an empty editor. (Studio also normalizes on load, but this keeps
  // the editor self-contained and crash-proof.)
  const docContent = normalizeTipTapContent(content);

  const editor = useEditor({
    // v3 default changed to false; without this the toolbar (dropdown value,
    // active-state highlighting) goes stale when the cursor moves (#72 UX).
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        // Disable everything we don't want; keep only the constrained set.
        heading: { levels: [2,3,4,5,6] },
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

  const HEADING_LEVELS: readonly number[] = [2,3,4,5,6];

  const headingLevel = (level: number) => editor.isActive("heading", { level: level as Level });

  const activeHeading: number =
    HEADING_LEVELS.find((l) => headingLevel(l)) ?? 0;

  const applyHeading = (level: number) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as Level }).run();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <select
          className={styles.toolbarSelect}
          value={String(activeHeading)}
          onChange={(e) => applyHeading(Number(e.target.value))}
          aria-label="Paragraph style">
          <option value="0">Paragraph</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>

        <FormatButton editor={editor} markType="bold" />
        <FormatButton editor={editor} markType="italic" />
        <FormatButton editor={editor} markType="strike" />
        <FormatButton editor={editor} markType="link" />
      </div>

      <div className={styles.content}>
        <EditorContent
          editor={editor}
          aria-label="Story editor content"
          aria-labelledby={ariaLabelledBy}
        />
      </div>
    </div>
  );
}
