1. [x] Fix RTL positioning by replacing `right-2` with logical `end-2` in `components/ui/sidebar/sidebar-group.tsx:110`.
2. [x] Fix tooltip side logic to account for sidebar `side` (right sidebar should tooltip left, and vice versa) in `components/ui/sidebar/sidebar-menu.tsx:149`.
3. [x] Remove redundant `!isCollapsed` guard around `SidebarMenuBadge` usage in `app/demos/sidebar.tsx:181` (component already returns null when collapsed).
4. [x] Add `accessibilityRole="button"` to submenu buttons in `components/ui/sidebar/sidebar-submenu.tsx:74`.
5. [x] Add `accessibilityState={{ selected: isActive }}` to submenu buttons in `components/ui/sidebar/sidebar-submenu.tsx:74`.
6. [x] Simplify nested ternary width calculation for readability in `components/ui/sidebar/sidebar.tsx:235`.
7. [x] Remove redundant nullish coalescing for `variant` and `side` in `components/ui/sidebar/sidebar.tsx:189`.
8. [x] Remove or implement `disabled`/`invalid` props in `SidebarInputProps` in `components/ui/sidebar/sidebar-widgets.tsx:124`.
9. [x] Replace `(triggerRef.current as any)?.focus?.()` with a typed ref that exposes `focus` in `app/demos/sidebar.tsx:67`.
10. [x] Break the circular import by moving `SidebarInternalContext`/`useSidebarInternal` out of `components/ui/sidebar/sidebar.tsx` into a shared context module.
11. [x] Fix active state text color so it switches to `text-sidebar-accent-foreground` instead of being locked to `text-sidebar-foreground` in `components/ui/sidebar/sidebar-menu.tsx:120` and `components/ui/sidebar/sidebar-submenu.tsx:68`.
12. [x] Forward `ref` and `...props` through the mobile `SheetContent` path to avoid dropping `testID`, accessibility, and style props in `components/ui/sidebar/sidebar.tsx:200`.
13. [x] Guard `SidebarRail` so it does not toggle when `collapsible="none"` (or ensure it is never rendered in that mode) in `components/ui/sidebar/sidebar-widgets.tsx:80`.
14. [x] Wrap the `localStorage.getItem` read in a try/catch to prevent Safari private-mode crashes in `components/ui/sidebar/sidebar-context.tsx:72`.
15. [x] Ensure collapsed `SidebarMenuButton` still wraps raw string/number children in `Text` to avoid RN "text strings must be rendered within a Text component" errors in `components/ui/sidebar/sidebar-menu.tsx:37`.
16. [ ] Reduce low-signal "renders/accepts className" tests and replace with behavior-driven assertions in `components/ui/sidebar/__tests__/*.test.tsx`.
17. [ ] Prefer `fireEvent.press` over `fireEvent.click` for `Pressable` in React Native tests in `components/ui/sidebar/__tests__/*.test.tsx`.
