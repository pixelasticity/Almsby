# Playwright MCP Adapter

This document defines the semantic adapter contract for Playwright MCP output. It intentionally does not prescribe a particular MCP host or CLI syntax.

The adapter MUST normalize browser activity into `browser-evidence.schema.json` records.

## Minimum mapping

- browser navigation → `render` evidence
- click/fill/keyboard interaction plus assertion → `primary-interaction`
- accessibility snapshot/assertions → `accessibility`
- viewport configuration → `viewport`
- screenshot → screenshot artifact
- console/test failure → failed assertion or failed scenario when relevant

## Important

Do not convert an arbitrary Playwright transcript into `passed` merely because a tool call succeeded. The adapter must identify the scenario's declared assertions and their results.

The adapter may consume Playwright MCP, Playwright Test, or another structured Playwright output. The normalized evidence format is the stable interface.
