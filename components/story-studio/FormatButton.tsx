import { type Editor } from "@tiptap/core";
import Button from "@/components/ui/Button";
import { markActions } from "@/lib/story/markUtils";

type FormatButtonProps = {
  editor: Editor;
  markType: keyof typeof markActions;
  label?: string;
};

export default function FormatButton({ editor, markType, label }: FormatButtonProps) {
  const { style } = markActions[markType];
  const isActive = editor.isActive(markType);
  const handleClick = () => {
    switch (markType) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "link": {
        const url = window.prompt("Link URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
        break;
      }
      default:
        break;
    }
  };
  return (
    <Button
      variant={isActive ? "primary" : "secondary"}
      type="button"
      onClick={handleClick}
      style={{ ...style }}
    >
      {label ?? markActions[markType].label}
    </Button>
  );
}