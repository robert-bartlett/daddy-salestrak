import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View } from 'react-native';
import { Text, TextClassContext } from './text';

/** Symbol mappings for common keyboard keys */
const KEY_SYMBOLS: Record<string, string> = {
  cmd: '⌘',
  command: '⌘',
  alt: '⌥',
  option: '⌥',
  ctrl: '⌃',
  control: '⌃',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  escape: 'Esc',
  esc: 'Esc',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: '␣',
};

/**
 * Formats a key string to its display symbol.
 * Returns the symbol for known keys, or uppercases unknown keys.
 */
function formatKey(key: string): string {
  const normalized = key.toLowerCase().trim();
  return KEY_SYMBOLS[normalized] ?? key.toUpperCase();
}

// Base styles shared across all platforms
const BASE_STYLES =
  'bg-muted inline-flex items-center justify-center rounded-sm font-sans pointer-events-none select-none';

// Web-specific styles
const WEB_STYLES = 'whitespace-nowrap';

const kbdVariants = cva(cn(BASE_STYLES, Platform.select({ web: WEB_STYLES })), {
  variants: {
    size: {
      sm: 'h-4 min-w-4 px-1',
      default: 'h-5 min-w-5 px-1.5',
      lg: 'h-6 min-w-6 px-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

// Separate text variants (following Badge pattern)
const kbdTextVariants = cva('text-muted-foreground font-medium', {
  variants: {
    size: {
      sm: 'text-[10px] leading-none',
      default: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const kbdSeparatorVariants = cva('text-muted-foreground/70 font-normal', {
  variants: {
    size: {
      sm: 'text-[10px] mx-0.5',
      default: 'text-xs mx-1',
      lg: 'text-sm mx-1.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

type KbdProps = React.ComponentProps<typeof View> &
  VariantProps<typeof kbdVariants> & {
    /** Array of keys for combinations (renders with "+" separator) */
    keys?: string[];
    /** Single key content (alternative to keys array) */
    children?: React.ReactNode;
  };

const Kbd = React.forwardRef<View, KbdProps>(
  ({ className, size, keys, children, ...props }, ref) => {
    // Single key via children
    if (children && !keys) {
      const displayText = typeof children === 'string' ? formatKey(children) : children;

      return (
        <TextClassContext.Provider value={kbdTextVariants({ size })}>
          <View
            ref={ref}
            className={cn(kbdVariants({ size }), className)}
            accessibilityRole="text"
            {...props}
          >
            <Text>{displayText}</Text>
          </View>
        </TextClassContext.Provider>
      );
    }

    // Multiple keys via keys array
    if (keys && keys.length > 0) {
      return (
        <View
          ref={ref}
          className={cn('flex-row items-center', className)}
          accessibilityRole="text"
          accessibilityLabel={keys.join(' plus ')}
          {...props}
        >
          {keys.map((key, index) => (
            <React.Fragment key={index}>
              <TextClassContext.Provider value={kbdTextVariants({ size })}>
                <View className={kbdVariants({ size })}>
                  <Text>{formatKey(key)}</Text>
                </View>
              </TextClassContext.Provider>
              {index < keys.length - 1 && (
                <Text className={kbdSeparatorVariants({ size })}>+</Text>
              )}
            </React.Fragment>
          ))}
        </View>
      );
    }

    return null;
  }
);

Kbd.displayName = 'Kbd';

export { Kbd, kbdVariants, kbdTextVariants, formatKey };
export type { KbdProps };
