"use client";

import { useState } from "react";
import type { DOMAttributes } from "react";

type InteractionHandlers = Pick<
  DOMAttributes<HTMLElement>,
  | "onMouseEnter"
  | "onMouseLeave"
  | "onMouseDown"
  | "onMouseUp"
  | "onFocus"
  | "onBlur"
>;

type InteractionState = {
  hovered: boolean;
  active: boolean;
  focused: boolean;
  /** Space-separated tokens in fixed order — "hover", "active", "focus" — and
      an empty string when idle. */
  almsbyState: string;
  handlers: InteractionHandlers;
};

/**
 * Tracks hover / pressed / focus for a single interactive element and exposes
 * it two ways: individual flags for `data-hover` / `data-active` / `data-focus`
 * presence attributes, and one aggregate `data-almsby-state` token string. Every
 * sidebar control reports state through this, so they can't drift apart.
 *
 * `active` is released on mouse-leave as well as mouse-up, so pressing the mouse
 * and dragging off the element can't leave it stuck in the pressed state.
 */
export function useInteractionState(): InteractionState {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState(false);

  return {
    hovered,
    active,
    focused,
    almsbyState: [hovered && "hover", active && "active", focused && "focus"]
      .filter(Boolean)
      .join(" "),
    handlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false);
        setActive(false);
      },
      onMouseDown: () => setActive(true),
      onMouseUp: () => setActive(false),
      onFocus: () => setFocused(true),
      onBlur: () => {
        setHovered(false);
        setActive(false);
        setFocused(false);
      },
    },
  };
}
