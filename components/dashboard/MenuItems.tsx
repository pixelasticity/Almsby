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
  menuLabel,
}: {
  /** Renders the trigger; receives the open state (so the chevron can flip)
      and the key handling to spread on the trigger button. */
  trigger: (
    open: boolean,
    keyboard: { onKeyDown: React.KeyboardEventHandler }
  ) => ReactNode;
  children: ReactNode;
  menuLabel: string;
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
    );

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
    // Focus lands on the first item after render.
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
      {trigger(open, { onKeyDown: onTriggerKeyDown })}
      {open && (
        <div
          role="menu"
          aria-label={menuLabel}
          tabIndex={-1}
          className={styles.menu}
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

/** One menu row: a link (href) or a button (action). Closes the menu on pick. */
export function MenuItem({
  href,
  action,
  children,
  icon,
}: {
  href?: string;
  action?: () => void;
  children: ReactNode;
  icon: ReactNode;
}) {
  const { hovered, active, focused, almsbyState, handlers } =
    useInteractionState();
  const onClose = useContext(MenuCloseContext);

  const shared = {
    role: "menuitem" as const,
    tabIndex: -1,
    className: styles["menu-item"],
    "data-hover": hovered ? "" : undefined,
    "data-active": active ? "" : undefined,
    "data-focus": focused ? "" : undefined,
    "data-almsby-state": almsbyState,
    onClick: () => {
      action?.();
      onClose();
    },
  };

  const row = (
    <>
      <span data-slot="icon" className={styles["menu-item-icon"]} aria-hidden="true">
        {icon}
      </span>
      <span data-slot="label" className={styles["menu-item-label"]}>
        {children}
      </span>
    </>
  );

  return href ? (
    <a {...shared} {...handlers} href={href}>
      {row}
    </a>
  ) : (
    <button {...shared} {...handlers} type="button">
      {row}
    </button>
  );
}

/** Visual separator between menu groups. */
export function MenuSeparator() {
  return <div role="separator" className={styles["menu-separator"]} />;
}
