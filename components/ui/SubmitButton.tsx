"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * Submit button bound to the enclosing `<form action={…}>` via useFormStatus,
 * so forms stop threading `isPending` out of useActionState themselves.
 * Shows `pendingLabel` while the action is in flight (matches the previous
 * "…" convention across all forms).
 */
export default function SubmitButton({
  className,
  pendingLabel = "…",
  disabled = false,
  children,
}: {
  className?: string;
  pendingLabel?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
}
