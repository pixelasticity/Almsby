# components/dashboard/

Sidebar menu components and their shared foundation: trigger button, dropdown menu container, and rows/separator primitives.

## File map

| File | Purpose |
|---|---|
| `Sidebar.tsx` | Root sidebar shell (the container holding the nav column). |
| `DashboardNav.tsx` | Top nav region. |
| `SidebarLink.tsx` | A pinned nav link (left rail). |
| `AccountChip.tsx` | Bottom account chip + its dropdown (`AccountMenu` + `MenuItem`s + `MenuSeparator`). |
| `MenuButton.tsx` | Shared trigger shell: touch-target overlay, content slot, chevron, and the `data-*` interaction reporting the CSS keys off. |
| `MenuItems.tsx` | `AccountMenu` (state, keyboard, positioning), `MenuItem` (link-or-button row), `MenuSeparator`. |
| `sidebar.module.css` | All sidebar styling (CSS module). |
| `lib/hooks/useInteractionState.ts` | Shared `data-hover` / `data-active` / `data-focus` / `data-almsby-state` reporter used by `MenuButton`. |

## The pattern, end-to-end

A dropdown is built from **trigger → menu container → rows**, and the ARIA wiring is what makes it a real menu rather than a styled `div`:

`````
<button
  id="account-menu-button"
  aria-haspopup="menu"
  aria-expanded="true"
  aria-controls="account-menu">
</button>

<ul
  id="account-menu"
  role="menu"
  aria-labelledby="account-menu-button"
  tabindex="0">
  <a role="menuitem" tabindex="-1" href="/settings">...</a>
  <button role="menuitem" tabindex="-1" disabled aria-disabled="true">...</button>
</div>
`````

`AccountMenu` owns open/close state and exposes it to the trigger via the
`trigger(open, { onKeyDown }, toggle)` render-prop. `MenuButton` receives
`expanded` and flips `aria-expanded` / `aria-controls` / `data-open` in
response.

### Component API

**`AccountMenu`**
```ts
<AccountMenu
  menuId="account-menu"        // id for the menu div; also aria-controls target
  labelledBy="account-menu-button"  // id of the trigger button (aria-labelledby source)
  anchor="top start"            // data-anchor value: "top start" (above) | "bottom start" (below)
  trigger={(open, keyboard, toggle) => <MenuButton ... />}
>
  {...rows...}
</AccountMenu>
```

**`MenuItem`**
```ts
<MenuItem
  href="/settings"     // OR
  action={() => signOutAction()}
  icon={<svg ... />}
  disabled={false}     // renders a native <button disabled> + aria-disabled
>
  My account
</MenuItem>
```

**`MenuButton`** — shared shell. `expanded`, `onKeyDown`, `onClick` are passed
from `AccountMenu` so the trigger and the menu stay in sync (open state drives
both the ARIA attributes and the chevron — see below).

**`MenuSeparator`** — `<div role="separator">`, no props.

## data-* attribute contract

The CSS keys off these. `MenuButton` uses `useInteractionState`; `AccountMenu`
sets `data-open`/`data-anchor` directly:

| Attribute | Set by | Meaning |
|---|---|---|
| `data-hover` / `data-active` / `data-focus` | `useInteractionState` (via `MenuButton`) | pointer + focus state presence attributes |
| `data-almsby-state` | `useInteractionState` | aggregate `"hover active focus"` token string |
| `aria-haspopup="menu"` | `MenuButton` | this button opens a menu |
| `aria-expanded` / `data-open` | `MenuButton` (`expanded` prop) | menu is open (both on button; `data-open` is the CSS hook) |
| `aria-controls` | `MenuButton` (when `expanded`) | points at the menu div's id |
| `data-anchor="vertical horizontal"` | `AccountMenu` (`anchor` prop) | placement: top/bottom × start/end |
| `data-disabled` | `MenuItem` (when `disabled`) | visually/stylistically disabled |
| `aria-disabled` | `MenuItem` (when `disabled`) | screen-reader disabled |

CSS note: `data-open` on `MenuButton` is the semantic hook
(`.menu-button[data-open]`), preferred over `[aria-expanded="true"]` — see
`sidebar.module.css` line 84.

## CSS placement (`.menu[data-anchor]`)

The menu floats via `position: absolute` inside a relatively positioned
`.wrap` (the outer `<span id={id}>`). The four overrides pin which edge:

```css
.menu[data-anchor="bottom start"] { top: calc(100% + 0.5rem); left: 0; right: auto; }
.menu[data-anchor="bottom end"]   { top: calc(100% + 0.5rem); left: auto; right: 0; }
.menu[data-anchor="top start"]    { top: auto; bottom: calc(100% + 0.5rem); left: 0; right: auto; }
.menu[data-anchor="top end"]      { top: auto; bottom: calc(100% + 0.5rem); left: auto; right: 0; }
```

Each rule explicitly resets the opposing axes so the base `.menu` rule's
`top`/`left` can't leak into the `top-*` variants.

## Chevron direction

The chevron is a **static prop** passed from the consumer, chosen to point at
the open menu:

- `.menu[data-anchor="top start"]` → `chevron="up"`   (menu opens above)
- `.menu[data-anchor="bottom start"]` → `chevron="down"` (menu opens below)

It does **not** rotate on open/close — the consumer picks the direction for the
menu's placement and the button keeps it. `AccountChip` uses `chevron="up"`
because its menu lives above (`anchor="top start"`). A workspace switcher menu
below would use `chevron="down"`.

## Disabled rows

A `disabled` `MenuItem` renders as:

```tsx
<button
  role="menuitem"
  tabIndex={-1}
  data-disabled
  aria-disabled="true"
  disabled           // native HTML: full browser inertness
  type="button"
>
```

This is the **placeholder-link pattern** (per W3C APG + Scott O'Hara's
"Disabling a link"): a disabled menuitem must not be activatable or natively
focusable while remaining perceivable to assistive tech. We use a real
`<button disabled>` rather than stripping `href` from an `<a>` because:

- the browser itself suppresses focus + click (no manual handler needed),
- `aria-disabled` then surfaces the state (O'Hara warns against `aria-disabled`
  on an `<a href>` without also suppressing activation — "that's lying"),
- arrow-key navigation skips `[data-disabled]` rows, and initial focus lands on
  the first non-disabled item (standard roving-tabindex menu behavior).

CSS dims disabled rows and kills the hover background — see
`.menu-item[data-disabled]` in `sidebar.module.css`.

## Keyboard map (AccountMenu)

- **Esc** — close, return focus to trigger
- **Tab / Shift+Tab** — close (menu doesn't trap tab; focus leaves the widget)
- **ArrowDown / ArrowUp** — move roving focus between items (skips disabled)
- **ArrowDown on closed trigger** — open the menu
- **click / Space / Enter on trigger** — toggle
- **click / Enter on a row** — select, close

## Gotchas / notes

- `AccountMenu` uses `useId()` for its outer `<span id={id}>` wrapper and
  `document.getElementById(id)` (no refs), which satisfies the React Compiler's
  "no refs during render" rule and keeps the component SSR-safe.
- `useInteractionState` clears `active` on both `mouseUp` **and**
  `mouseLeave`, so dragging off a pressed button can't leave it stuck in the
  pressed visual state.
- There is no local test file for the dashboard components yet. The full test
  suite covers the app broadly; if you touch this pattern, a render+interaction
  test is welcome (RFE).


