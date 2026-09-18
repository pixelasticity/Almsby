"use client";

import React from "react";

interface Props {
  /** Human-readable context for the console error (e.g. "TipTapEditor"). */
  name: string;
  /** Message/UI shown in place of the crashed subtree. */
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Generic client error boundary for client-widget render crashes that a
 * try/catch cannot reach (hooks like TipTap's useEditor or bwip-js's WASM
 * renderers run at render time). Keeps a crashed widget from unmounting the
 * whole page: the subtree degrades to `fallback` while the surrounding
 * layout — nav, actions, sibling cards — stays intact. Previously
 * EditorErrorBoundary (studio-only); generalized when the barcode preview
 * needed the same protection (the first time logic is duplicated a second
 * time is when it belongs in a shared module).
 *
 * Logs loudly (AGENTS.md rule #1): the real error goes to the console with
 * the caller-supplied name so support can tell which widget crashed.
 */
export default class ErrorBoundary extends React.Component<
  Props,
  { hasError: boolean }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Surface to the console; never silently swallow.
    console.error(`${this.props.name} crashed:`, error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}