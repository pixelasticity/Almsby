/**
 * Step 2 of the story CMS wizard (#72): the structured body blocks.
 * Each block is a textarea (type: "paragraph" | "heading") with add/remove
 * and a type toggle. No rich-text/WYSIWYG (brief §9 guardrail). The serialized
 * form goes to the parent's onAutoSave, which forwards JSON to the action.
 */
"use client";

import { useTranslations } from "next-intl";
import FormField from "@/components/ui/FormField";
import type { StoryBlock } from "@/lib/story/queries";
import styles from "./story.module.css";

export default function StoryStepBlocks({
  blocks,
  onChange,
  onAutoSave,
}: {
  blocks: StoryBlock[];
  onChange: (blocks: StoryBlock[]) => void;
  onAutoSave: (blocks: StoryBlock[]) => void;
}) {
  const t = useTranslations("story.stepBlocks");
  const commonT = useTranslations("story");

  const updateBlock = (index: number, field: "type" | "text", value: string) => {
    const next = [...blocks];
    next[index] = { ...next[index], [field]: value } as StoryBlock;
    onChange(next);
    onAutoSave(next);
  };

  const addBlock = () => {
    onChange([...blocks, { type: "paragraph", text: "" }]);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) return; // keep at least one block
    const next = [...blocks];
    next.splice(index, 1);
    onChange(next);
    onAutoSave(next);
  };

  const allEmpty = blocks.every((b) => b.text.trim() === "");
  const emptyMsg = commonT("stepBlocks.empty");

  return (
    <FormField styles={styles} htmlFor="story-blocks" label={t("label")} helper={allEmpty ? emptyMsg : undefined}>
      <div id="story-blocks" className={styles.blocks}>
        {blocks.map((block, i) => (
          <div key={i} className={styles.blockRow}>
            <select
              value={block.type}
              onChange={(e) => updateBlock(i, "type", e.target.value)}
              aria-label={t("paragraph") + " / " + t("heading")}
            >
              <option value="paragraph">{t("paragraph")}</option>
              <option value="heading">{t("heading")}</option>
            </select>
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(i, "text", e.target.value)}
              placeholder={emptyMsg}
              className={styles.blockTextarea}
              rows={3}
              aria-label={block.type === "heading" ? t("heading") : t("paragraph")}
            />
            <button
              type="button"
              onClick={() => removeBlock(i)}
              disabled={blocks.length <= 1}
              className={styles.removeBtn}
              title={t("remove")}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addBlock} className={styles.addBtn}>
        {t("addBlock")}
      </button>
    </FormField>
  );
}
