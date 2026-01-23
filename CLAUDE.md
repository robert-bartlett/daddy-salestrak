# UI Component Library Development

## Purpose

This repository is the development environment for building a **universal React Native component library**. The library will provide every base primitive, layout component, and styling utility needed for any React Native app—with the goal that consuming apps implement **zero custom styling** and rely entirely on the library's exported components and utilities.

## Current State

The repo is in active development. Currently:

- **Single Expo app** (`WorkspaceReactNative/`) serves as the testbed for component development
- Components are being built and tested within this app
- **Future state**: The UI library will be extracted into its own repository, and this repo will become a testbed for React Native app prototypes that consume the library

## Who Uses This Repo

- **Designers** — Building and iterating on the component library
- **Developers** — Will eventually consume the finalized library in production apps

---

## Core Principles

### Zero Styling Outside the UI Library

This is the fundamental constraint of the architecture:

- **`className` and `style` props are banned** outside of the UI library folder
- All styling must come from library components and utilities
- Apps consuming this library should only import and compose—never add custom styles
- If a design need can't be met, the answer is to extend the library, not add one-off styles

### Strict API Through Prop Validation

Components must be:

- **Configurable** — Support theming and customization through well-defined props
- **Constrained** — Use TypeScript to enforce valid prop combinations
- **Semantic** — Prop names should describe intent, not implementation (e.g., `variant="primary"` not `color="blue"`)

### Component Categories

The library should cover:

1. **Primitives** — Text, View, Pressable wrappers with built-in styling
2. **Layout** — Stack, Row, Grid, Spacer, Container
3. **Form Controls** — Input, Button, Checkbox, Radio, Select, Switch
4. **Feedback** — Alert, Toast, Modal, Loading states
5. **Navigation** — Tabs, Header, BottomNav
6. **Data Display** — Card, List, Table, Badge, Avatar
7. **Utilities** — Spacing, color tokens, typography scales

---

## Guarding the Architecture

You are a steward of this library's design philosophy. Take pride in keeping the codebase clean and consistent.

**Actively watch for code smells and anti-patterns.** If something feels wrong—a shortcut that undermines the system, a pattern that will cause problems later, code that violates the principles above—flag it and fix it. Don't let technical debt accumulate.

**Push back when necessary.** If a request would break the architecture (like adding `className` or `style` outside the UI folder, or creating one-off components that should be library additions), explain why it's a problem and offer the right approach instead. The goal is a library that holds together—quick fixes that compromise that aren't worth it.

**Default to the library, not raw styles.** When implementing anything, your first instinct should be to use or extend existing library components. Reaching for `className` or inline styles outside `/ui` is always the wrong answer. If the library doesn't support what's needed, the solution is to add that capability to the library.

---

## Technical Guidelines

### Technology Stack

- **React Native** with TypeScript
- **Expo** managed workflow (SDK 52+)
- **Expo Router** for file-based navigation
- **NativeWind** for Tailwind-style styling (internal to library only)
- **React Native Reanimated** for animations
- **Expo Vector Icons** for iconography

### Code Standards

1. **Everything is a component** — No loose utilities that apply styles directly
2. **TypeScript strict mode** — All props must be typed with clear constraints
3. **Prop validation** — Use discriminated unions and literal types to prevent invalid states
4. **Semantic naming** — Component and prop names describe what they do, not how
5. **Cross-platform by default** — All components must work on iOS, Android, and Web
6. **Accessible by default** — ARIA labels, proper contrast, keyboard navigation built-in
7. **Document decisions** — Comments explain "why" for non-obvious choices

### File Organization

```
/WorkspaceReactNative
  /ui                    <- THE LIBRARY (only place styling is allowed)
    /primitives          <- Base building blocks
    /components          <- Composed UI elements
    /layout              <- Spacing and structure
    /tokens              <- Design tokens (colors, spacing, typography)
    /utils               <- Internal utilities
    index.ts             <- Public API exports
  /app                   <- Test screens that consume the library
  /__tests__             <- Component tests
```

### Component Design Pattern

```tsx
// Good: Semantic, constrained API
<Button variant="primary" size="lg" onPress={handleSubmit}>
  Submit
</Button>

// Bad: Leaking styles outside library
<Button style={{ backgroundColor: 'blue' }} className="p-4">
  Submit
</Button>
```

### When Building Components

1. **Start with the API** — Define what props make sense before implementing
2. **Consider all variants** — What sizes, states, and themes are needed?
3. **Test on all platforms** — Verify iOS, Android, and Web behavior
4. **Write tests** — Cover expected behavior and edge cases
5. **Export cleanly** — Only expose what consumers need

---

## Session Guidelines

### Keep It Running

Ensure the app still builds and runs. Handle technical issues (package management, build errors, config) without interrupting the flow.

### Iterate Freely

Design work is iterative. Revisions and direction changes are expected—the goal is to explore and refine until components feel right.

### End of Session

Before ending:

- [ ] App runs without errors
- [ ] New components are properly exported
- [ ] Tests pass
- [ ] Any work-in-progress is noted

---

## For Future Reference

When the library is extracted:

- This repo becomes a testbed for prototype apps
- Apps in this repo will import from the external library
- The same "zero styling" rule applies—prototypes use only library components
