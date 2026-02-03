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

---

# React Native Performance & Best Practices

> The following rules are optimized for AI-assisted workflows maintaining, generating, or refactoring React Native codebases. Contains 35+ rules across 13 categories, prioritized by impact.

---

## 1. Core Rendering — CRITICAL

Fundamental React Native rendering rules. Violations cause runtime crashes or broken UI.

### 1.1 Never Use && with Potentially Falsy Values

**Impact: CRITICAL (prevents production crash)**

Never use `{value && <Component />}` when `value` could be an empty string or `0`. These are falsy but JSX-renderable—React Native will try to render them as text outside a `<Text>` component, causing a hard crash in production.

```tsx
// INCORRECT: crashes if count is 0 or name is ""
function Profile({ name, count }: { name: string; count: number }) {
  return (
    <View>
      {name && <Text>{name}</Text>}
      {count && <Text>{count} items</Text>}
    </View>
  )
}

// CORRECT: ternary with null
function Profile({ name, count }: { name: string; count: number }) {
  return (
    <View>
      {name ? <Text>{name}</Text> : null}
      {count ? <Text>{count} items</Text> : null}
    </View>
  )
}

// CORRECT: explicit boolean coercion
{!!name && <Text>{name}</Text>}
{!!count && <Text>{count} items</Text>}

// BEST: early return
function Profile({ name, count }: { name: string; count: number }) {
  if (!name) return null
  return (
    <View>
      <Text>{name}</Text>
      {count > 0 ? <Text>{count} items</Text> : null}
    </View>
  )
}
```

**Lint rule:** Enable `react/jsx-no-leaked-render` from eslint-plugin-react.

### 1.2 Wrap Strings in Text Components

**Impact: CRITICAL (prevents runtime crash)**

Strings must be rendered inside `<Text>`. React Native crashes if a string is a direct child of `<View>`.

```tsx
// INCORRECT: crashes
function Greeting({ name }: { name: string }) {
  return <View>Hello, {name}!</View>
}

// CORRECT
function Greeting({ name }: { name: string }) {
  return (
    <View>
      <Text>Hello, {name}!</Text>
    </View>
  )
}
```

---

## 2. List Performance — HIGH

Optimizing virtualized lists (FlatList, LegendList, FlashList) for smooth scrolling and fast updates.

### 2.1 Avoid Inline Objects in renderItem

**Impact: HIGH (prevents unnecessary re-renders of memoized list items)**

Don't create new objects inside `renderItem` to pass as props. Inline objects create new references on every render, breaking memoization.

```tsx
// INCORRECT: inline object breaks memoization
renderItem={({ item }) => (
  <UserRow user={{ id: item.id, name: item.name }} />
)}

// CORRECT: pass item directly or primitives
renderItem={({ item }) => <UserRow user={item} />}

// CORRECT: pass primitives, derive inside child
renderItem={({ item }) => (
  <UserRow id={item.id} name={item.name} isActive={item.isActive} />
)}
```

### 2.2 Hoist Callbacks to the Root of Lists

**Impact: MEDIUM (fewer re-renders and faster lists)**

Create a single instance of the callback at the root of the list.

```tsx
// INCORRECT: creates a new callback on each render
renderItem={({ item }) => {
  const onPress = () => handlePress(item.id)
  return <Item item={item} onPress={onPress} />
}}

// CORRECT: single function instance
const onPress = useCallback((id) => handlePress(id), [handlePress])
renderItem={({ item }) => <Item item={item} onPress={onPress} />}
```

### 2.3 Keep List Items Lightweight

**Impact: HIGH (reduces render time for visible items during scroll)**

List items should be inexpensive to render. Minimize hooks, avoid queries, and limit React Context access.

```tsx
// INCORRECT: heavy list item
function ProductRow({ id }: { id: string }) {
  const { data: product } = useQuery(['product', id], () => fetchProduct(id))
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)
  const cart = useContext(CartContext)
  // ...
}

// CORRECT: lightweight list item
function ProductRow({ name, price, imageUrl }: Props) {
  return (
    <View>
      <Image source={{ uri: imageUrl }} />
      <Text>{name}</Text>
      <Text>{price}</Text>
    </View>
  )
}
```

**Guidelines for list items:**
- No queries or data fetching
- No expensive computations (move to parent)
- Prefer Zustand selectors over React Context
- Minimize useState/useEffect hooks
- Pass pre-computed values as props

### 2.4 Optimize List Performance with Stable Object References

**Impact: CRITICAL (virtualization relies on reference stability)**

Don't map or filter data before passing to virtualized lists. New references cause full re-renders of all visible items.

```tsx
// INCORRECT: creates new object references on every keystroke
const domains = tlds.map((tld) => ({
  domain: `${keyword}.${tld.name}`,
  tld: tld.name,
}))
return <LegendList data={domains} renderItem={renderItem} />

// CORRECT: stable references, transform inside items
return <LegendList data={tlds} renderItem={renderItem} />

function DomainItem({ tld }: { tld: Tld }) {
  const domain = useKeywordZustandState((s) => s.keyword + '.' + tld.name)
  return <Text>{domain}</Text>
}
```

### 2.5 Pass Primitives to List Items for Memoization

**Impact: HIGH (enables effective memo() comparison)**

Pass only primitive values (strings, numbers, booleans) as props to list item components.

```tsx
// INCORRECT: object prop requires deep comparison
const UserRow = memo(function UserRow({ user }: { user: User }) {
  return <Text>{user.name}</Text>
})

// CORRECT: primitive props enable shallow comparison
const UserRow = memo(function UserRow({ id, name, email }: { id: string; name: string; email: string }) {
  return <Text>{name}</Text>
})
```

### 2.6 Use a List Virtualizer for Any List

**Impact: HIGH (reduced memory, faster mounts)**

Use LegendList or FlashList instead of ScrollView with mapped children—even for short lists.

```tsx
// INCORRECT: ScrollView renders all items at once
<ScrollView>
  {items.map((item) => <ItemCard key={item.id} item={item} />)}
</ScrollView>

// CORRECT: virtualizer renders only visible items
<LegendList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  estimatedItemSize={80}
/>
```

### 2.7 Use Compressed Images in Lists

**Impact: HIGH (faster load times, less memory)**

Always load compressed, appropriately-sized images in lists.

```tsx
// INCORRECT: full-resolution images
<Image source={{ uri: product.imageUrl }} style={{ width: 100, height: 100 }} />

// CORRECT: request appropriately-sized image (2x for retina)
const thumbnailUrl = `${product.imageUrl}?w=200&h=200&fit=cover`
<Image source={{ uri: thumbnailUrl }} style={{ width: 100, height: 100 }} contentFit='cover' />
```

### 2.8 Use Item Types for Heterogeneous Lists

**Impact: HIGH (efficient recycling, less layout thrashing)**

When a list has different item layouts, use a `type` field and provide `getItemType`.

```tsx
type FeedItem = HeaderItem | MessageItem | ImageItem

<LegendList
  data={items}
  keyExtractor={(item) => item.id}
  getItemType={(item) => item.type}
  renderItem={({ item }) => {
    switch (item.type) {
      case 'header': return <SectionHeader title={item.title} />
      case 'message': return <MessageRow text={item.text} />
      case 'image': return <ImageRow url={item.url} />
    }
  }}
  recycleItems
/>
```

---

## 3. Animation — HIGH

GPU-accelerated animations, Reanimated patterns, and avoiding render thrashing.

### 3.1 Animate Transform and Opacity Instead of Layout Properties

**Impact: HIGH (GPU-accelerated animations, no layout recalculation)**

Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding`. Use `transform` (scale, translate) and `opacity` instead.

```tsx
// INCORRECT: animates height, triggers layout every frame
const animatedStyle = useAnimatedStyle(() => ({
  height: withTiming(expanded ? 200 : 0),
}))

// CORRECT: animates scaleY, GPU-accelerated
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scaleY: withTiming(expanded ? 1 : 0) }],
  opacity: withTiming(expanded ? 1 : 0),
}))
```

### 3.2 Prefer useDerivedValue Over useAnimatedReaction

**Impact: MEDIUM (cleaner code, automatic dependency tracking)**

Use `useDerivedValue` for derivations, `useAnimatedReaction` only for side effects.

```tsx
// INCORRECT
useAnimatedReaction(
  () => progress.value,
  (current) => { opacity.value = 1 - current }
)

// CORRECT
const opacity = useDerivedValue(() => 1 - progress.get())
```

### 3.3 Use GestureDetector for Animated Press States

**Impact: MEDIUM (UI thread animations, smoother press feedback)**

Use `GestureDetector` with `Gesture.Tap()` and shared values instead of Pressable's `onPressIn`/`onPressOut`.

```tsx
const pressed = useSharedValue(0)

const tap = Gesture.Tap()
  .onBegin(() => pressed.set(withTiming(1)))
  .onFinalize(() => pressed.set(withTiming(0)))
  .onEnd(() => runOnJS(onPress)())

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
}))

return (
  <GestureDetector gesture={tap}>
    <Animated.View style={animatedStyle}>{children}</Animated.View>
  </GestureDetector>
)
```

---

## 4. Scroll Performance — HIGH

### 4.1 Never Track Scroll Position in useState

**Impact: HIGH (prevents render thrashing during scroll)**

Use Reanimated shared values for animations or a ref for non-reactive tracking.

```tsx
// INCORRECT: causes jank
const [scrollY, setScrollY] = useState(0)
const onScroll = (e) => setScrollY(e.nativeEvent.contentOffset.y)

// CORRECT: Reanimated for animations
const scrollY = useSharedValue(0)
const onScroll = useAnimatedScrollHandler({
  onScroll: (e) => { scrollY.value = e.contentOffset.y }
})

// CORRECT: ref for non-reactive tracking
const scrollY = useRef(0)
const onScroll = (e) => { scrollY.current = e.nativeEvent.contentOffset.y }
```

---

## 5. Navigation — HIGH

### 5.1 Use Native Navigators for Navigation

**Impact: HIGH (native performance, platform-appropriate UI)**

Always use native navigators instead of JS-based ones.

- **For stacks:** Use `@react-navigation/native-stack` or expo-router's default stack
- **For tabs:** Use `react-native-bottom-tabs` or expo-router's native tabs

```tsx
// INCORRECT: JS stack navigator
import { createStackNavigator } from '@react-navigation/stack'

// CORRECT: native stack
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// CORRECT: expo-router (uses native stack by default)
import { Stack } from 'expo-router'
export default function Layout() {
  return <Stack />
}
```

---

## 6. React State — MEDIUM

### 6.1 Minimize State Variables and Derive Values

**Impact: MEDIUM (fewer re-renders, less state drift)**

```tsx
// INCORRECT: redundant state
const [total, setTotal] = useState(0)
useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0))
}, [items])

// CORRECT: derived values
const total = items.reduce((sum, item) => sum + item.price, 0)
```

### 6.2 Use Fallback State Instead of initialState

**Impact: MEDIUM (reactive fallbacks without syncing)**

```tsx
// INCORRECT: loses reactivity when prop changes
const [enabled, setEnabled] = useState(defaultEnabled)

// CORRECT: state is user intent, reactive fallback
const [_enabled, setEnabled] = useState<boolean | undefined>(undefined)
const enabled = _enabled ?? defaultEnabled
```

### 6.3 useState Dispatch Updaters for State That Depends on Current Value

**Impact: MEDIUM (avoids stale closures)**

```tsx
// INCORRECT: reads state directly
const onTap = () => setCount(count + 1)

// CORRECT: dispatch updater
const onTap = () => setCount((prev) => prev + 1)
```

---

## 7. State Architecture — MEDIUM

### 7.1 State Must Represent Ground Truth

**Impact: HIGH (cleaner logic, easier debugging)**

State variables should represent the actual state (e.g., `pressed`, `progress`, `isOpen`), not derived visual values (e.g., `scale`, `opacity`).

```tsx
// INCORRECT: storing the visual output
const scale = useSharedValue(1)
tap.onBegin(() => scale.set(withTiming(0.95)))

// CORRECT: storing the state, deriving the visual
const pressed = useSharedValue(0)
tap.onBegin(() => pressed.set(withTiming(1)))
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
}))
```

---

## 8. React Compiler — MEDIUM

### 8.1 Destructure Functions Early in Render

**Impact: HIGH (stable references, fewer re-renders)**

```tsx
// INCORRECT: dotting into object
const router = useRouter()
const handlePress = () => router.push('/success')

// CORRECT: destructure early
const { push } = useRouter()
const handlePress = () => push('/success')
```

### 8.2 Use .get() and .set() for Reanimated Shared Values

**Impact: LOW (required for React Compiler compatibility)**

```tsx
// INCORRECT: breaks with React Compiler
count.value = count.value + 1

// CORRECT: React Compiler compatible
count.set(count.get() + 1)
```

---

## 9. User Interface — MEDIUM

### 9.1 Modern React Native Styling Patterns

- Always use `borderCurve: 'continuous'` with `borderRadius`
- Use `gap` instead of margin for spacing between elements
- Use `padding` for space within, `gap` for space between
- Use `experimental_backgroundImage` for linear gradients
- Use CSS `boxShadow` string syntax for shadows

```tsx
// Use gap on parent instead of margin on children
<View style={{ gap: 8 }}>
  <Text>Title</Text>
  <Text>Subtitle</Text>
</View>

// CSS box-shadow syntax
{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }
```

### 9.2 Use contentInsetAdjustmentBehavior for Safe Areas

**Impact: MEDIUM (native safe area handling, no layout shifts)**

```tsx
// INCORRECT: SafeAreaView wrapper
<SafeAreaView><ScrollView>{children}</ScrollView></SafeAreaView>

// CORRECT: native content inset adjustment
<ScrollView contentInsetAdjustmentBehavior='automatic'>
  {children}
</ScrollView>
```

### 9.3 Use expo-image for Optimized Images

**Impact: HIGH (memory efficiency, caching, blurhash placeholders)**

```tsx
import { Image } from 'expo-image'

<Image
  source={{ uri: url }}
  placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
  contentFit="cover"
  transition={200}
  style={styles.image}
/>
```

### 9.4 Use Native Menus for Dropdowns and Context Menus

**Impact: HIGH (native accessibility, platform-consistent UX)**

Use [zeego](https://zeego.dev) for cross-platform native menus.

### 9.5 Use Native Modals Over JS-Based Bottom Sheets

**Impact: HIGH (native performance, gestures, accessibility)**

```tsx
// CORRECT: native Modal with formSheet
<Modal
  visible={visible}
  presentationStyle='formSheet'
  animationType='slide'
  onRequestClose={() => setVisible(false)}
>
  {children}
</Modal>
```

### 9.6 Use Pressable Instead of Touchable Components

**Impact: LOW (modern API, more flexible)**

Never use `TouchableOpacity` or `TouchableHighlight`. Use `Pressable` instead.

---

## 10. Design System — MEDIUM

### 10.1 Use Compound Components Over Polymorphic Children

**Impact: MEDIUM (flexible composition, clearer API)**

```tsx
// INCORRECT: polymorphic children
<Button icon={<Icon />}>Save</Button>

// CORRECT: compound components
<Button>
  <ButtonIcon><SaveIcon /></ButtonIcon>
  <ButtonText>Save</ButtonText>
</Button>
```

---

## 11. Monorepo — LOW

### 11.1 Install Native Dependencies in App Directory

**Impact: CRITICAL (required for autolinking)**

In a monorepo, packages with native code must be installed in the native app's directory directly.

### 11.2 Use Single Dependency Versions Across Monorepo

**Impact: MEDIUM (avoids duplicate bundles, version conflicts)**

Use exact versions, not ranges. Use tools like syncpack to enforce this.

---

## 12. Third-Party Dependencies — LOW

### 12.1 Import from Design System Folder

**Impact: LOW (enables global changes and easy refactoring)**

Re-export dependencies from a design system folder. App code imports from there, not directly from packages.

---

## 13. JavaScript — LOW

### 13.1 Hoist Intl Formatter Creation

**Impact: LOW-MEDIUM (avoids expensive object recreation)**

```tsx
// INCORRECT: new formatter every render
function Price({ amount }: { amount: number }) {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  return <Text>{formatter.format(amount)}</Text>
}

// CORRECT: hoisted to module scope
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
function Price({ amount }: { amount: number }) {
  return <Text>{currencyFormatter.format(amount)}</Text>
}
```

---

## 14. Fonts — LOW

### 14.1 Load Fonts Natively at Build Time

**Impact: LOW (fonts available at launch, no async loading)**

Use the `expo-font` config plugin to embed fonts at build time instead of `useFonts` or `Font.loadAsync`.

---

## References

1. [React Documentation](https://react.dev)
2. [React Native Documentation](https://reactnative.dev)
3. [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
4. [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler)
5. [Expo Documentation](https://docs.expo.dev)
6. [LegendList](https://legendapp.com/open-source/legend-list)
7. [Galeria](https://github.com/nandorojo/galeria)
8. [Zeego](https://zeego.dev)
