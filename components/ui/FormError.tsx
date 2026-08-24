import type { ReactNode } from "react";

/** `role="alert"` error line rendered only when a message exists. */
export default function FormError({
  message,
  className,
}: {
  message?: ReactNode;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p role="alert" className={className}>
      {message}
    </p>
  );
}
