"use client";

import type { ReactNode } from "react";
import { useInteractionState } from "@/lib/hooks/useInteractionState";
import styles from "./sidebar.module.css";

/** The two chevron directions the sidebar uses, taken verbatim from the markup
    this component replaces so rendering is unchanged. */
const CHEVRON_PATHS = {
  down: "M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z",
  up: "M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z",
} as const;

type MenuButtonProps = {
  /** Visual + label block, composed by the caller: a single `.truncate` line for
      the workspace switcher, or `.account` (avatar + `.account-details`) for the
      account chip. */
  children: ReactNode;
  /** Chevron direction. Once real dropdown menus exist this should follow the
      menu's expanded state rather than being passed in. */
  chevron?: keyof typeof CHEVRON_PATHS;
  id?: string;
  /** Menu open state. No menus exist yet, so this is always false for now. */
  expanded?: boolean;
  /** Forwarded key handling (e.g. the account menu's ArrowDown-to-open). */
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  /** Forwarded click handling (e.g. the account menu's open/close toggle). */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

/**
 * Sidebar menu trigger. The workspace switcher and the account chip share this
 * shell — touch-target overlay, content slot, trailing chevron, and the
 * `data-hover` / `data-active` / `data-focus` / `data-almsby-state` interaction
 * reporting the sidebar CSS keys off. The menus themselves are future work,
 * which is why `cursor: default` still applies to these buttons.
 */
export default function MenuButton({
  children,
  chevron = "down",
  id,
  expanded = false,
  onKeyDown,
  onClick,
}: MenuButtonProps) {
  const { hovered, active, focused, almsbyState, handlers } =
    useInteractionState();

  return (
    <button
      id={id}
      type="button"
      aria-haspopup="menu"
      aria-expanded={expanded}
      aria-controls={expanded ? "account-menu" : undefined}
      className={styles["menu-button"]}
      data-hover={hovered ? "" : undefined}
      data-active={active ? "" : undefined}
      data-focus={focused ? "" : undefined}
      data-open={expanded ? "" : undefined}
      data-almsby-state={almsbyState}
      onKeyDown={onKeyDown}
      onClick={onClick}
      {...handlers}
    >
      <span className={styles.target} aria-hidden="true"></span>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          fillRule="evenodd"
          d={CHEVRON_PATHS[chevron]}
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );
}
