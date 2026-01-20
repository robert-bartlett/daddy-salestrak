## 2026-01-20 - Item 1
- Updated SidebarGroupAction positioning to use logical `end-2` for RTL support.
- Files modified: `components/ui/sidebar/sidebar-group.tsx`.
- Learnings/gotchas: Jest logs a React Native Web console error about unexpected text nodes, but tests pass.
- Notes for next session: none.

## 2026-01-20 - Item 2
- Updated collapsed tooltip placement to flip based on sidebar `side` while respecting RTL layout so right-side sidebars show tooltips to the left.
- Files modified: `components/ui/sidebar/sidebar-menu.tsx`.
- Learnings/gotchas: Jest still logs the React Native Web unexpected text node console error, but tests pass.
- Notes for next session: none.

## 2026-01-20 - Item 3
- Removed the redundant collapsed guard around `SidebarMenuBadge` since the component already returns null when collapsed.
- Files modified: `app/demos/sidebar.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 4
- Added `accessibilityRole="button"` to submenu pressables so assistive tech announces them correctly.
- Files modified: `components/ui/sidebar/sidebar-submenu.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 5
- Added `accessibilityState` with selected state to submenu buttons for active announcement.
- Files modified: `components/ui/sidebar/sidebar-submenu.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 6
- Simplified the collapsed width calculation for the desktop sidebar to remove the nested ternary while preserving behavior.
- Files modified: `components/ui/sidebar/sidebar.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 7
- Removed redundant fallback values for `variant` and `side` when building the internal sidebar context since defaults are already set upstream.
- Files modified: `components/ui/sidebar/sidebar.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 8
- Updated `SidebarInputProps` to inherit the input component props so `disabled`/`invalid` are typed once.
- Files modified: `components/ui/sidebar/sidebar-widgets.tsx`.
- Learnings/gotchas: none.
- Notes for next session: none.

## 2026-01-20 - Item 9
- Added a focused ref type for the user menu trigger so focus restoration uses typed refs instead of `any`.
- Files modified: `app/demos/sidebar.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 10
- Moved `SidebarInternalContext`/`useSidebarInternal` into a shared module to avoid circular imports while keeping the provider in `Sidebar`.
- Files modified: `components/ui/sidebar/sidebar-internal-context.tsx`, `components/ui/sidebar/sidebar.tsx`, `components/ui/sidebar/sidebar-group.tsx`, `components/ui/sidebar/sidebar-menu.tsx`, `components/ui/sidebar/sidebar-submenu.tsx`, `components/ui/sidebar/sidebar-widgets.tsx`, `components/ui/sidebar/__tests__/sidebar.test.tsx`, `components/ui/sidebar/index.ts`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 11
- Updated active menu and submenu text styles to switch to `text-sidebar-accent-foreground` when selected.
- Files modified: `components/ui/sidebar/sidebar-menu.tsx`, `components/ui/sidebar/sidebar-submenu.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 12
- Forwarded the sidebar ref and remaining props into the mobile `SheetContent` so `testID`, accessibility props, and styles are not dropped.
- Merged mobile and desktop sidebar width styles with any incoming `style` prop to preserve custom styling.
- Files modified: `components/ui/sidebar/sidebar.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 13
- Guarded `SidebarRail` from rendering when `collapsible="none"` so it cannot toggle in non-collapsible mode.
- Files modified: `components/ui/sidebar/sidebar-widgets.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 14
- Wrapped the initial `localStorage.getItem` read in a try/catch so Safari private-mode storage errors do not crash on mount.
- Files modified: `components/ui/sidebar/sidebar-context.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.

## 2026-01-20 - Item 15
- Wrapped the first collapsed menu child with `wrapTextChildren` so raw strings/numbers render safely inside `Text`.
- Files modified: `components/ui/sidebar/sidebar-menu.tsx`.
- Learnings/gotchas: `npx tsc --noEmit` and `npm test` pass; Jest still logs the React Native Web unexpected text node console error.
- Notes for next session: none.
