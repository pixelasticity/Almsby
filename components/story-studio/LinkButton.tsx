"use client";

import { type Editor } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./tiptap-editor.module.css";

/**
 * Link toolbar control. Replaces the old window.prompt() link flow with an
 * inline input:
 *   - Clicking "Link" opens an input pre-filled with the link under the cursor
 *     (or empty if none). Enter applies, Escape/outside-click cancels.
 *   - When the cursor is already on a link, an explicit "Remove" action appears.
 *   - URLs are validated (http/https only) before applying, so a malformed link
 *     never reaches the saved story.
 *
 * Active state (editor.isActive("link")) re-reads on every transaction because
 * TipTapEditor sets shouldRerenderOnTransaction, so the button highlight stays
 * correct as the cursor moves in/out of a link.
 */
export default function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = editor.isActive("link");
  const currentHref =
    (editor.getAttributes("link") as { href?: string } | null)?.href ?? "";
  const editingExisting = open && currentHref.length > 0;

  const openEditor = () => {
    setDraft(currentHref);
    setError(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setError(null);
    // Return focus to the editor so keyboard users aren't stranded after the
    // input closes.
    editor.chain().focus().run();
  };

  const apply = () => {
    const url = draft.trim();
    if (!url) {
      setError("Enter a URL.");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setError("Link must start with http:// or https://");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
    setOpen(false);
    setDraft("");
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
    setDraft("");
  };

  // Auto-focus the input when it opens.
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Close on outside click (mouse-down so it fires before the button's onBlur).
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  return (
    <div className={styles.linkControl} ref={containerRef}>
      <Button
        variant={isActive ? "primary" : "secondary"}
        type="button"
        onClick={openEditor}
        aria-expanded={open}
      >
        Link
      </Button>

      {open && (
        <form
          className={styles.linkForm}
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <input
            ref={inputRef}
            className={styles.linkInput}
            type="text"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
            placeholder="https://example.com"
            aria-label="Link URL"
          />
          {error && <p className={styles.linkError}>{error}</p>}
          <div className={styles.linkActions}>
            <Button variant="primary" type="submit">
              Apply
            </Button>
            {editingExisting && (
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  remove();
                  close();
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}