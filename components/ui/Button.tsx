"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import styles from "./button.module.css";

type ButtonProps = {
  /** "primary" = green action, "secondary" = neutral. */
  variant?: "primary" | "secondary";
  /** "submit" auto-tracks the parent <form>'s pending state; "button" needs
      the parent to pass `pending` explicitly (e.g. a useTransition flow). */
  type?: "submit" | "button";
  /** Label shown while pending (submit-in-form or explicit pending). */
  pendingLabel?: ReactNode;
  /** Explicit pending flag for buttons outside a <form> (wizard autosave). */
  pending?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/**
 * The single source of truth for buttons. Replaces ad-hoc <button> elements
 * and is the eventual home for the submit/pill behavior currently split across
 * SubmitButton + per-form CSS. One component, two variants, works in and out
 * of a <form>.
 */
export default function Button({
  variant = "primary",
  type = "button",
  pendingLabel = "…",
  pending = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  // Always called (rules of hooks); outside a <form> it returns pending=false.
  const { pending: formPending } = useFormStatus();

  const isPending = (type === "submit" && formPending) || pending;
  const variantClass = variant === "primary" ? styles.primary : styles.secondary;

  return (
    <button
      type={type}
      disabled={disabled || isPending}
      className={`${variantClass}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {isPending ? pendingLabel : children}
    </button>
  );
}
