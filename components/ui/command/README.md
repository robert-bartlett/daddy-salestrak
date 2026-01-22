# Command

A React Native command palette component with full API parity to [cmdk](https://github.com/pacocoursey/cmdk).

## Features

- **API Parity**: Matches cmdk's public API and behavior
- **Keyboard Navigation**: Arrow keys, Enter, Home, End, Cmd+Arrow
- **Built-in Filtering**: Smart scoring with exact, starts-with, contains, and fuzzy matching
- **Custom Filtering**: Override with your own filter function
- **Accessible**: ARIA roles, keyboard navigation, screen reader support
- **Styled by Default**: Ready to use with Tailwind/NativeWind styles
- **Web-First**: Optimized for web with data attributes for CSS targeting

## Installation

The component is already installed in this design system. Import from:

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from '@/components/ui/command';
```

## Basic Usage

```tsx
<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem value="new-file" onSelect={() => {}}>
        New File
      </CommandItem>
      <CommandItem value="new-folder" onSelect={() => {}}>
        New Folder
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem value="preferences" keywords={["prefs", "settings"]}>
        Preferences
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

## Dialog Usage

```tsx
const [open, setOpen] = React.useState(false);

// Open with Cmd+K
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

return (
  <CommandDialog open={open} onOpenChange={setOpen}>
    <CommandInput placeholder="Type a command..." />
    <CommandList>
      <CommandItem value="settings" onSelect={() => setOpen(false)}>
        Settings
      </CommandItem>
    </CommandList>
  </CommandDialog>
);
```

## API Reference

### Command

Root container for the command palette.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled selected value |
| `onValueChange` | `(value: string) => void` | - | Selection change callback |
| `filter` | `(value, search, keywords?) => number` | built-in | Custom filter function |
| `shouldFilter` | `boolean` | `true` | Enable/disable filtering |
| `loop` | `boolean` | `false` | Wrap navigation at ends |
| `label` | `string` | `"Command menu"` | Accessibility label |

### CommandInput

Search input for filtering items.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled input value |
| `onValueChange` | `(value: string) => void` | - | Input change callback |
| `placeholder` | `string` | `"Search..."` | Placeholder text |
| `autoFocus` | `boolean` | `false` | Auto focus on mount |
| `hideIcon` | `boolean` | `false` | Hide search icon |

### CommandList

Scrollable container for items.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxHeight` | `number \| string` | `300` | Maximum height |

### CommandItem

Selectable item within the palette.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | **Yes** | Unique identifier for this item |
| `keywords` | `string[]` | No | Additional search keywords |
| `disabled` | `boolean` | No | Disable this item |
| `onSelect` | `(value: string) => void` | No | Selection callback |
| `forceMount` | `boolean` | No | Always render, even when filtered |

### CommandGroup

Container for grouping related items.

| Prop | Type | Description |
|------|------|-------------|
| `heading` | `ReactNode` | Group heading text |
| `forceMount` | `boolean` | Always render, even when filtered |

### CommandSeparator

Visual divider between sections.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alwaysRender` | `boolean` | `false` | Show even when searching |

### CommandEmpty

Displays when no items match the search.

### CommandLoading

Displays during async operations. Control with `useCommandLoading()` hook.

### CommandDialog

Modal wrapper combining Command with Dialog.

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Dialog open state |
| `onOpenChange` | `(open: boolean) => void` | Open state callback |

## Hooks

### useCommandState

Access reactive command state:

```tsx
const state = useCommandState();
// or with selector
const search = useCommandState(state => state.search);
```

### useCommandLoading

Control loading state:

```tsx
const { loading, setLoading } = useCommandLoading();

async function fetchData() {
  setLoading(true);
  await load();
  setLoading(false);
}
```

## Filtering

### Built-in Filter

The default filter scores matches:
- **Exact match**: 1.0
- **Starts with**: 0.9
- **Contains**: 0.7
- **Fuzzy match**: 0.5
- **No match**: 0

All inputs are trimmed and lowercased before comparison.

### Custom Filter

```tsx
<Command
  filter={(value, search, keywords = []) => {
    // Return 0-1 score, 0 means hidden
    if (value.startsWith(search)) return 1;
    return 0;
  }}
>
```

### Disable Filtering

```tsx
<Command shouldFilter={false}>
  {/* Items always visible, manage filtering yourself */}
</Command>
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` | Select next item |
| `↑` | Select previous item |
| `Enter` | Trigger onSelect |
| `Home` | Select first item |
| `End` | Select last item |
| `Cmd+↓` | Select last item |
| `Cmd+↑` | Select first item |

## CSS Selectors

For custom styling, use these data attributes:

```css
[data-cmdk-root] { }
[data-cmdk-input] { }
[data-cmdk-list] { }
[data-cmdk-item] { }
[data-cmdk-item][data-selected] { }
[data-cmdk-item][data-disabled] { }
[data-cmdk-group] { }
[data-cmdk-group-heading] { }
[data-cmdk-separator] { }
[data-cmdk-empty] { }
[data-cmdk-loading] { }
```

## Differences from cmdk

1. **Explicit Values**: Items must provide `value` prop (not inferred from text content)
2. **React Native**: Built for React Native (web) with appropriate primitives
3. **No Vim Bindings**: Standard arrow keys only (no j/k navigation)

## Demo

View the demo at `/demos/command` in the app or run:

```bash
npm run web
# Navigate to http://localhost:8081/demos/command
```
