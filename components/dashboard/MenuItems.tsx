"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useId, useState } from "react";
import { useInteractionState } from "@/lib/hooks/useInteractionState";
import styles from "./sidebar.module.css";

/** Menu rows call this to close their menu (no refocus). */
const MenuCloseContext = createContext<() => void>(() => {});

/**
 * Account menu: a trigger plus a light-dismiss popup anchored below it inside
 * a relatively positioned `.wrap`. Esc, outside pointer-down, or Tab-out
 * closes the menu and returns focus to the trigger. Items are roving-tabindex
 * `role="menuitem"` rows with arrow-key navigation (WAI-ARIA menu basics).
 *
 * Replaces the DOM dump this file used to hold: same structure (menu, items,
 * separators), now on the app's CSS-module foundation instead of Tailwind,
 * with real destinations instead of `href="#"` placeholders.
 */
export function AccountMenu({
  trigger,
  children,
  menuId = "account-menu",
  labelledBy,
  anchor = "top start",
}: {
  /** Renders the trigger; receives the open state (so the chevron can flip)
      and the key handling to spread on the trigger button. */
  trigger: (
    open: boolean,
    keyboard: { onKeyDown: React.KeyboardEventHandler },
    toggle: () => void
  ) => ReactNode;
  children: ReactNode;
  /** id for the menu div (also the aria-controls target for the trigger). */
  menuId?: string;
  /** id of the trigger button (aria-labelledby source). Required for correct menu labeling. */
  labelledBy?: string;
  /** data-anchor value for CSS placement (see sidebar.module.css).
      "top start" opens above, left-aligned; "bottom start" below, left-aligned. */
  anchor?: string;
}) {
  const [open, setOpen] = useState(false);
  // DOM access is by id at event time — no refs, so the React compiler's
  // no-refs-during-render rule is satisfied by construction.
  const id = useId();

  const root = () => document.getElementById(id);

  const menuItems = () =>
    Array.from(
      root()?.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
        '[role="menuitem"]'
      ) ?? []
    ).filter((el) => !el.hasAttribute("data-disabled"));

  // Light dismiss: close on outside pointer-down.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root()?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) root()?.querySelector("button")?.focus();
  };

  const openMenu = () => {
    setOpen(true);
    // Focus lands on the first non-disabled item after render.
    requestAnimationFrame(() => menuItems()[0]?.focus());
  };

  /** While closed: ArrowDown on the trigger opens the menu. */
  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu();
    }
  };

  /** While open: Esc / Tab-out closes; arrows move between items. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    // Opening is handled by the trigger's own key handler; everything below
    // only applies while the menu is open.
    if (!open) return;
    const items = menuItems();
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const current = items.findIndex((el) => el === document.activeElement);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next =
        current === -1
          ? 0
          : Math.min(Math.max(current + delta, 0), items.length - 1);
      items[next]?.focus();
    }
  };

  return (
    <span id={id} className={styles.wrap}>
      {trigger(open, { onKeyDown: onTriggerKeyDown }, () => setOpen(!open))}
      {open && (
        <div
          role="menu"
          id={menuId}
          aria-labelledby={labelledBy}
          tabIndex={0}
          className={styles.menu}
          data-anchor={anchor}
          data-open=""
          onKeyDown={onKeyDown}
        >
          <MenuCloseContext.Provider value={() => close()}>
            {children}
          </MenuCloseContext.Provider>
        </div>
      )}
    </span>
  );
}

/** One menu row: a link (href) or a button (action). Closes the menu on pick.
 *  A disabled row is exposed as `aria-disabled` and stripped of its `href`
 *  (placeholder anchor) / given a native `disabled` button, so it is not
 *  activatable or natively focusable. It remains in the DOM for screen readers
 *  but is skipped by the menu's arrow-key navigation. */
export function MenuItem({
  href,
  action,
  children,
  icon,
  disabled = false,
}: {
  href?: string;
  action?: () => void;
  children: ReactNode;
  icon: ReactNode;
  disabled?: boolean;
}) {
  const { hovered, active, focused, almsbyState, handlers } =
    useInteractionState();
  const onClose = useContext(MenuCloseContext);

  const shared = {
    role: "menuitem" as const,
    tabIndex: -1,
    className: styles["menu-item"],
    "aria-disabled": disabled || undefined,
    "data-disabled": disabled ? "" : undefined,
    "data-hover": disabled ? undefined : hovered ? "" : undefined,
    "data-active": disabled ? undefined : active ? "" : undefined,
    "data-focus": disabled ? undefined : focused ? "" : undefined,
    "data-almsby-state": almsbyState,
    onClick: disabled
      ? undefined
      : () => {
          action?.();
          onClose();
        },
  };

  const row = (
    <>
      {icon}
      <span data-slot="label" className={styles["menu-item-label"]}>
        {children}
      </span>
    </>
  );

  if (disabled) {
    // Anchor without href is a placeholder (not focusable / not a link), with
    // aria-disabled surfaced to AT. We use the button form for full inert
    // suppression (real disabled => focus + click suppressed by the browser).
    return (
      <button {...shared} {...handlers} type="button" disabled>
        {row}
      </button>
    );
  }

  // Enabled path — keep interaction handlers and activation.
  const enabledShared = {
    ...shared,
    "aria-disabled": undefined,
    "data-disabled": undefined,
  };

  return href ? (
    <a {...enabledShared} {...handlers} href={href}>
      {row}
    </a>
  ) : (
    <button {...enabledShared} {...handlers} type="button">
      {row}
    </button>
  );
}

/** Visual separator between menu groups. */
export function MenuSeparator() {
  return <div role="separator" className={styles["menu-separator"]} />;
}
