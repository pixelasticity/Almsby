import React from "react";

interface Props {
  /** Message shown in place of the editor when it crashes. */
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Last line of defense: TipTap's useEditor runs at render time, so it can't be
 * wrapped in try/catch. If a malformed content value ever reaches it (despite
 * the normalization guards), this boundary prevents the whole studio page from
 * hard-erroring — consistent with the project rule of never surfacing an opaque
 * `{}`/crash to the user. Logs the real error server-side for diagnostics.
 */
export default class EditorErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Surface to the server console; never silently swallow.
    console.error("TipTapEditor crashed:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
