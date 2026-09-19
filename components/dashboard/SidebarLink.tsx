"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useInteractionState } from "@/lib/hooks/useInteractionState";
import styles from "./sidebar.module.css";

type SidebarLinkProps = {
  href: string;
  children: ReactNode;
};

/**
 * A sidebar nav item. `data-hover` / `data-active` / `data-focus` mirror the
 * matching pseudo-classes so the same visuals can also be driven
 * programmatically, `data-current` + `aria-current` mark the current route
 * (which draws the rail indicator), and `data-almsby-state` reports all three
 * interaction states as one space-separated token list. Interaction state comes
 * from `useInteractionState`, shared with MenuButton.
 *
 * Client component because Sidebar is an async Server Component and cannot
 * track mouse state. Renders a fragment (no wrapper element) — the caller keeps
 * its `.wrap` span, which is the positioning context for the indicator.
 */
export default function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname();
  const { hovered, active, focused, almsbyState, handlers } =
    useInteractionState();

  // Root is exact-matched: every path starts with "/", so prefix matching would
  // leave Home permanently current. Sub-routes match their parent
  // (/products stays current on /products/[id]).
  const current =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {current ? <span className={styles.indicator} aria-hidden="true" /> : null}
      <Link
        className={styles["nav-link"]}
        href={href}
        data-hover={hovered ? "" : undefined}
        data-active={active ? "" : undefined}
        data-focus={focused ? "" : undefined}
        data-current={current ? "true" : undefined}
        data-almsby-state={almsbyState}
        aria-current={current ? "page" : undefined}
        {...handlers}
      >
        {children}
      </Link>
    </>
  );
}

