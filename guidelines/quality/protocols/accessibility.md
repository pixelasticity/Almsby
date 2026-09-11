# Accessibility Verification

For applicable UI changes:

1. Inspect the rendered accessibility tree/snapshot.
2. Verify meaningful names, roles, labels, headings, and control states.
3. Check keyboard reachability and logical focus order.
4. Verify visible focus where interaction requires it.
5. Check error, loading, empty, and disabled states for understandable feedback.
6. Confirm important information is not conveyed by color alone.
7. Test the primary task at representative viewport sizes.

Automated checks are useful evidence but do not replace human inspection of interaction and comprehension.

**Pass:** no known critical accessibility blocker introduced by the change.

**Evidence:** retain relevant accessibility output and a concise human-review note.
