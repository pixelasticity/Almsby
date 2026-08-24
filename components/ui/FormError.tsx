import type { ReactNode } from "react";

/** `role="alert"` error line rendered only when a message exists. */
export default function FormError({
  message,
  className,
  id,
}: {
  message?: ReactNode;
  className?: string;
  /** Optional stable id so fields can aria-describedby this error. */
  id?: string;
}) {
  if (!message) return null;
  return (
    <p role="alert" id={id} className={className}>
      {message}
    </p>
  );
}
