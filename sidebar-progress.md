# Sidebar Fixes Progress Log

This document tracks the progress of fixing issues identified in `sidebar-plan.md`.

---

## Session Log

<!-- Each session should add an entry below in this format:

### [Date] - Item #X: [Brief Title]

**Status:** Completed | Partial | Blocked

**What was done:**
- Bullet points of changes made

**Files modified:**
- path/to/file.tsx

**Learnings:**
- Any insights, gotchas, or patterns discovered

**Notes for next session:**
- Any context needed for continuing work

---

-->

### 2026-01-20 - Item #1: Fix mobile state logic

**Status:** Completed

**What was done:**
- Added `!isMobile` guard to all `isCollapsed` checks across sidebar components
- This ensures that when the sidebar is displayed in a mobile sheet, it always renders in expanded mode regardless of the desktop collapsed state
- The desktop "collapsed" state no longer hides labels, badges, submenus, or group labels inside the mobile sheet

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (3 locations: SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge)
- `components/ui/sidebar/sidebar-group.tsx` (2 locations: SidebarGroupLabel, SidebarGroupAction)
- `components/ui/sidebar/sidebar-submenu.tsx` (1 location: SidebarMenuSub)

**Learnings:**
- The `isMobile` value is already available from `useSidebar()` context, making this fix straightforward
- The pattern `!isMobile && state === 'collapsed' && internal?.collapsible === 'icon'` cleanly gates collapse behavior to desktop only

**Notes for next session:**
- Pre-existing TypeScript errors exist in `app/_layout.tsx` and `components/ui/text.tsx` (unrelated to sidebar)
- Consider whether the context should provide a derived `effectiveState` that accounts for mobile instead of requiring this check in each component (addressed in Item #11)

---

### 2026-01-20 - Item #2: Add accessibility metadata to interactive elements

**Status:** Completed

**What was done:**
- Added `accessibilityRole="button"` and `accessibilityState={{ selected: isActive }}` to `SidebarMenuButton`
- Added `accessibilityRole="button"` to `SidebarMenuAction`
- Added `accessibilityRole="text"` and dynamic `accessibilityLabel` to `SidebarMenuBadge` for screen reader announcement of badge content
- Added `accessibilityRole="button"` to `SidebarGroupAction`
- Added `accessibilityLabel="Toggle sidebar"` to `SidebarTrigger`
- Added `accessibilityRole="button"`, `accessibilityLabel="User menu"`, and `accessibilityState={{ expanded: isOpen }}` to the NavUser trigger in the demo

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge)
- `components/ui/sidebar/sidebar-group.tsx` (SidebarGroupAction)
- `components/ui/sidebar/sidebar-utils.tsx` (SidebarTrigger)
- `app/demos/sidebar.tsx` (NavUser trigger)

**Learnings:**
- `SidebarRail` already had proper accessibility attributes (`accessibilityRole="button"` and `accessibilityLabel`)
- For badges, using `accessibilityRole="text"` with a dynamic `accessibilityLabel` helps screen readers announce the badge content
- The `accessibilityState={{ selected }}` pattern is appropriate for active/selected menu items
- For disclosure triggers like NavUser, `accessibilityState={{ expanded }}` communicates the open/closed state

**Notes for next session:**
- Item #3 covers more advanced keyboard behavior for the NavUser menu (Enter/Space toggle, Escape close, focus management)
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)

---

### 2026-01-20 - Item #3: Implement keyboard disclosure behavior for NavUser menu

**Status:** Completed

**What was done:**
- Added `triggerRef` to track the trigger button for focus management
- Added `closeMenu` callback that closes the menu and returns focus to the trigger (web only)
- Added `handleKeyDown` handler that closes the menu on Escape key press (web only)
- Wrapped the NavUser disclosure in a `View` with web-specific `onKeyDown` handler to capture Escape from both the trigger and submenu items
- Enter/Space toggle already works natively via React Native Web's handling of `onPress` on `Pressable` elements

**Files modified:**
- `app/demos/sidebar.tsx` (NavUser component)

**Learnings:**
- React Native Web's `Pressable` already handles Enter/Space to fire `onPress` when the element has focus, so no additional work needed for toggle
- Web-specific props like `onKeyDown` can be conditionally spread using `Platform.OS === 'web'` with type assertion
- Wrapping the disclosure content in a `View` with `onKeyDown` allows catching Escape from anywhere within the menu, not just the trigger
- `requestAnimationFrame` is used before focusing to ensure the DOM has updated after state changes

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #4 covers showOnHover behavior across platforms

---

### 2026-01-20 - Item #4: Make showOnHover work across platforms

**Status:** Completed

**What was done:**
- Modified `showOnHover` behavior to be web-only: on native platforms (iOS/Android), actions are always visible since there's no hover interaction
- On web: when `showOnHover` is true, the action starts with `opacity-0` and becomes visible on `group-hover:opacity-100` and `group-focus-within:opacity-100`
- Added `group` class to `SidebarMenuItem` and `SidebarGroup` to enable Tailwind's group-hover functionality
- Added web-specific `hover:opacity-100 focus-visible:opacity-100` styles to `SidebarGroupAction` for consistency with `SidebarMenuAction`

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (SidebarMenuItem: added `group` class; SidebarMenuAction: web-only showOnHover with group-hover reveal)
- `components/ui/sidebar/sidebar-group.tsx` (SidebarGroup: added `group` class; SidebarGroupAction: added Platform import, web-only showOnHover with group-hover reveal, added hover/focus-visible states)

**Learnings:**
- Tailwind's `group-hover:` requires a parent element with the `group` class
- `group-focus-within:` handles keyboard navigation, ensuring actions are visible when any child within the group has focus
- The `Platform.select()` pattern with nested `cn()` allows clean conditional styling per platform
- On native platforms, there's no hover state, so `showOnHover` behavior simply doesn't apply

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #5 addresses focus-visible affordances and accessible labels for icon-only buttons

---

### 2026-01-20 - Item #5: Restore focus-visible affordances and accessible labels for icon-only buttons

**Status:** Completed

**What was done:**
- Added `focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2` styles to `SidebarMenuButton` variants to restore keyboard focus indication where `outline-none` was used
- Added the same focus-visible ring styles to `SidebarMenuSubButton` for consistent keyboard navigation
- Added focus-visible indicator to `SidebarRail` using a pseudo-element approach (vertical line appears on focus) since a ring wouldn't suit its thin edge design
- Added `accessibilityLabel` to `SidebarMenuButton` that uses the `tooltip` prop value when the button is in collapsed icon-only mode, ensuring screen readers can identify the button's purpose

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (focus-visible ring in variants, accessibilityLabel when collapsed)
- `components/ui/sidebar/sidebar-submenu.tsx` (focus-visible ring for SidebarMenuSubButton)
- `components/ui/sidebar/sidebar-utils.tsx` (focus-visible indicator for SidebarRail)

**Learnings:**
- Using `ring-offset-background` alongside `ring-offset-2` ensures the focus ring has visual separation from the element
- For edge-positioned elements like `SidebarRail`, pseudo-element focus indicators (via `after:`) work better than ring styles
- The `tooltip` prop on `SidebarMenuButton` serves double duty: visual tooltip and accessible label in collapsed mode

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #6 addresses restoring a close button/action for the mobile sheet

---

### 2026-01-20 - Item #6: Re-enable mobile sheet close button

**Status:** Completed

**What was done:**
- Removed `showCloseButton={false}` from the `SheetContent` in the mobile sidebar rendering path
- This restores the Sheet component's default close button (X icon in top-right corner)
- The close button has proper accessibility: includes screen-reader-only "Close" text, focus ring styles, and appropriate hit slop for touch targets

**Files modified:**
- `components/ui/sidebar/sidebar.tsx` (removed `showCloseButton={false}` prop from SheetContent)

**Learnings:**
- The Sheet component already has a well-implemented close button with accessibility features (line 159-174 in sheet.tsx)
- The close button uses `DialogPrimitive.Close` which automatically calls `onOpenChange(false)` when pressed
- No custom implementation needed - just needed to stop suppressing the default behavior

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #7 addresses badge vertical positioning

---

### 2026-01-20 - Item #7: Fix badge positioning

**Status:** Completed

**What was done:**
- Added `top-1/2 -translate-y-1/2` to `SidebarMenuBadge` to vertically center it within the menu item
- This centers the badge regardless of the menu button's size variant (h-7, h-9, or h-12)

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (SidebarMenuBadge className)

**Learnings:**
- The badge was previously using `absolute right-1` without any vertical positioning, defaulting to `top: auto`
- Using `top-1/2 -translate-y-1/2` is more robust than a fixed `top-N` value because it centers correctly regardless of parent height
- `SidebarMenuAction` uses `top-1.5` which is a fixed offset; the badge benefits from dynamic centering since it displays variable content

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #8 addresses removing AI artifacts and dead code

---

### 2026-01-20 - Item #8: Remove AI artifacts and dead code

**Status:** Completed

**What was done:**
- Fixed useless tooltip ternary in `sidebar-menu.tsx:153`: `typeof tooltip === 'string' ? tooltip : tooltip` simplified to just `{tooltip}`
- Removed unused `asChild` prop from `SidebarMenuButton` type definition and destructuring
- Removed unused `asChild` prop from `SidebarMenuSubButton` type definition and destructuring
- Removed unused `asChild` prop from `SidebarGroupLabel` type definition and destructuring
- Removed dead skeleton demo block from `app/demos/sidebar.tsx` (code wrapped in `{false && ...}` that never rendered)
- Removed now-unused `SidebarMenuSkeleton` import from demo file

**Files modified:**
- `components/ui/sidebar/sidebar-menu.tsx` (tooltip ternary fix, asChild removal)
- `components/ui/sidebar/sidebar-submenu.tsx` (asChild removal)
- `components/ui/sidebar/sidebar-group.tsx` (asChild removal)
- `app/demos/sidebar.tsx` (dead code and unused import removal)

**Learnings:**
- The `asChild` prop pattern (used by Radix UI) requires a Slot component implementation to work; without it, the prop is dead code
- The tooltip ternary was likely a copy-paste artifact where conditional rendering was intended but both branches ended up the same
- Dead code like `{false && ...}` should be removed entirely rather than commented out - it provides no value and clutters the codebase

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- If `asChild` functionality is needed later (to render a custom element like a Link), a Slot pattern would need to be implemented
- Item #9 addresses exporting/hiding `useSidebarInternal`

---

### 2026-01-20 - Item #9: Export useSidebarInternal from barrel

**Status:** Completed

**What was done:**
- Added a named type `SidebarInternalContextValue` for the internal context return value (previously inline anonymous type)
- Exported `useSidebarInternal` hook from the barrel file (`index.ts`)
- Exported `SidebarInternalContextValue` type from the barrel file
- This makes the previously hidden coupling explicit and documented

**Files modified:**
- `components/ui/sidebar/sidebar.tsx` (added named type, updated type exports)
- `components/ui/sidebar/index.ts` (added hook and type exports)

**Learnings:**
- The "hidden coupling" was that internal components (`sidebar-menu`, `sidebar-group`, `sidebar-submenu`) imported directly from `./sidebar` rather than through the barrel
- While internal imports between sibling modules are fine, exporting from the barrel makes the API explicit for external consumers
- Adding a named type improves discoverability and allows consumers to type their own code against the internal context

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` remain (unrelated to sidebar)
- Item #10 addresses the redundant providers in the mobile sheet (related to the portal context bridging)
- Item #11 will consider unifying `useSidebar` and `useSidebarInternal` into a single hook

---

### 2026-01-20 - Item #10: Consolidate redundant providers in mobile sheet

**Status:** Completed

**What was done:**
- Removed the redundant outer `SidebarInternalContext.Provider` wrapper that surrounded the entire `Sheet` component in the mobile path
- The outer provider served no purpose because: (1) the Sheet component doesn't consume SidebarInternalContext, and (2) portal content doesn't inherit from providers outside the portal
- Kept the inner providers (`SidebarContext.Provider` and `SidebarInternalContext.Provider`) inside `SheetContent` which are necessary for portal context bridging
- Expanded the documentation comment to clearly explain WHY the providers must be duplicated inside the portal

**Files modified:**
- `components/ui/sidebar/sidebar.tsx` (removed redundant provider wrapper, improved documentation comment)

**Learnings:**
- React Portals render content at a different location in the DOM (at the PortalHost), which breaks React's context propagation
- Providers outside a portal don't affect content inside the portal - you must re-provide context inside the portal
- However, wrapping the Portal component itself (like Sheet) with a provider is unnecessary since the portal content won't inherit from it
- The consolidation removed 2 lines of code and eliminated a misleading pattern

**Notes for next session:**
- Pre-existing TypeScript errors in `app/_layout.tsx` and `components/ui/text.tsx` have been resolved (tsc passes cleanly)
- Item #11 addresses unifying `useSidebar` and `useSidebarInternal` to reduce split-context repetition

---

### 2026-01-20 - Item #11: Reduce split-context repetition

**Status:** Completed

**What was done:**
- Added `isCollapsed` as a derived boolean property to `SidebarInternalContextValue` type
- Computed `isCollapsed` once in the `Sidebar` component (which has access to both contexts) and included it in the internal context
- Updated 6 components to use `internal?.isCollapsed` instead of manually computing `!isMobile && state === 'collapsed' && internal?.collapsible === 'icon'`
- Removed now-unnecessary `useSidebar` imports from `sidebar-group.tsx` and `sidebar-submenu.tsx`
- `SidebarMenuButton` still imports `useSidebar` because it needs `isMobile` for the tooltip conditional (separate from isCollapsed)

**Files modified:**
- `components/ui/sidebar/sidebar.tsx` (added isCollapsed to context type and computation)
- `components/ui/sidebar/sidebar-menu.tsx` (simplified SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge)
- `components/ui/sidebar/sidebar-group.tsx` (simplified SidebarGroupLabel, SidebarGroupAction; removed useSidebar import)
- `components/ui/sidebar/sidebar-submenu.tsx` (simplified SidebarMenuSub; removed useSidebar import)

**Learnings:**
- The `Sidebar` component is the natural place to compute `isCollapsed` since it creates the internal context and has access to the parent `useSidebar()` context
- Renamed the existing local `isCollapsed` variable in the desktop layout section to `isStateCollapsed` to avoid shadowing - it serves a different purpose (any collapsed state for layout) vs the new context value (icon-only collapsed mode for children)
- This change reduces cognitive load: child components no longer need to understand the full formula, they just check a boolean

**Notes for next session:**
- Item #12 addresses controlled/uncontrolled API consistency for mobile props

---

### 2026-01-20 - Item #12: Align controlled/uncontrolled API for mobile

**Status:** Completed

**What was done:**
- Added `defaultOpenMobile` prop for initial mobile sheet state (uncontrolled mode, defaults to `false`)
- Added `openMobile` controlled prop to mirror the desktop `open` prop
- Added `onOpenMobileChange` callback to mirror the desktop `onOpenChange` prop
- Added internal state `_openMobile` and `_setOpenMobile` for uncontrolled mode
- Created derived `openMobile` value that uses controlled prop when provided, internal state otherwise
- Created `setOpenMobile` callback that calls the controlled callback if provided, otherwise updates internal state
- Updated `toggleSidebar` dependencies to include `setOpenMobile`
- Updated `contextValue` useMemo dependencies to include `setOpenMobile`
- Added JSDoc comments to all props for better discoverability

**Files modified:**
- `components/ui/sidebar/sidebar-context.tsx`

**Learnings:**
- The controlled/uncontrolled pattern follows React's established convention: `defaultX` for initial value, `X` for controlled value, `onXChange` for callback
- Mobile state doesn't need localStorage persistence (unlike desktop) since the sheet is a transient UI element
- The `toggleSidebar` function now properly depends on `setOpenMobile` as a callback rather than the raw setter

**Notes for next session:**
- Item #13 addresses simplifying `SidebarMenuSkeleton` width typing

---

<!-- Entries will be added above this line -->
