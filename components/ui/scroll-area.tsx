import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, ScrollView, View } from 'react-native';

// Default maximum height for scroll container
const DEFAULT_MAX_HEIGHT = 300;

// Default scroll orientation
const DEFAULT_ORIENTATION = 'vertical';

/**
 * Scrollbar visibility and size variants for web platform.
 * Uses webkit pseudo-elements for Chrome/Safari and Firefox properties.
 */
const scrollbarStyles = cva(
  // Base: transparent track, themed thumb with rounded corners
  '[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30',
  {
    variants: {
      visibility: {
        auto: '',
        always: '',
        never: '[&::-webkit-scrollbar]:hidden scrollbar-width:none',
        hover:
          '[&::-webkit-scrollbar-thumb]:opacity-0 [&:hover::-webkit-scrollbar-thumb]:opacity-100 [&::-webkit-scrollbar-thumb]:transition-opacity',
      },
      size: {
        default: '[&::-webkit-scrollbar]:w-2 scrollbar-width:thin',
        thin: '[&::-webkit-scrollbar]:w-1.5 scrollbar-width:thin',
      },
    },
    defaultVariants: {
      visibility: 'auto',
      size: 'default',
    },
  }
);

type ScrollAreaProps = {
  /** Maximum height for the scroll area. Can be a number (pixels) or string (CSS value). */
  maxHeight?: number | string;
  /** Maximum width for the scroll area. Can be a number (pixels) or string (CSS value). */
  maxWidth?: number | string;
  /** Scroll direction. Defaults to 'vertical'. */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** When to show scrollbar. Defaults to 'auto'. */
  showScrollbar?: 'always' | 'auto' | 'never' | 'hover';
  /** Scrollbar thickness. Defaults to 'default'. */
  scrollbarSize?: 'default' | 'thin';
  /** iOS only: whether the scroll view bounces at boundaries. Defaults to true. */
  bounces?: boolean;
  /** Additional className for the viewport/scroll container. */
  viewportClassName?: string;
  /** Additional className for the outer wrapper. */
  className?: string;
  children?: React.ReactNode;
};

// Platform-specific ref types
type WebRef = HTMLDivElement;
type NativeRef = ScrollView;
type ScrollAreaRef = WebRef | NativeRef;

/**
 * ScrollArea - A cross-platform scroll container with customizable scrollbar styling.
 *
 * @ref Forwards to HTMLDivElement on web, ScrollView on native.
 *
 * @remarks
 * - On web, uses a div with overflow styles and custom webkit/Firefox scrollbar CSS
 * - On native, uses ScrollView with configurable scroll indicators
 * - Scrollbar visibility and size variants only affect web appearance
 * - The `bounces` prop only affects iOS behavior
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight={300} showScrollbar="auto" scrollbarSize="thin">
 *   {children}
 * </ScrollArea>
 * ```
 */
const ScrollArea = React.forwardRef<ScrollAreaRef, ScrollAreaProps>(
  (
    {
      maxHeight = DEFAULT_MAX_HEIGHT,
      maxWidth,
      orientation = DEFAULT_ORIENTATION,
      showScrollbar = 'auto',
      scrollbarSize = 'default',
      bounces = true,
      viewportClassName,
      className,
      children,
    },
    ref
  ) => {
    // Convert numeric dimensions to pixel strings for web
    const maxHeightValue = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
    const maxWidthValue = maxWidth ? (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth) : undefined;

    // Determine overflow classes based on orientation
    const overflowClasses = {
      vertical: 'overflow-y-auto overflow-x-hidden',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      both: 'overflow-auto',
    }[orientation];

    if (Platform.OS === 'web') {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={cn(
            overflowClasses,
            scrollbarStyles({ visibility: showScrollbar, size: scrollbarSize }),
            viewportClassName,
            className
          )}
          style={{
            maxHeight: maxHeightValue,
            maxWidth: maxWidthValue,
          }}>
          {children}
        </div>
      );
    }

    // Native implementation using ScrollView
    // Hide scroll indicators on mobile for cleaner appearance
    return (
      <View className={className} style={{ maxHeight: maxHeight as number, maxWidth: maxWidth as number }}>
        <ScrollView
          ref={ref as React.Ref<ScrollView>}
          horizontal={orientation === 'horizontal'}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={bounces}
          className={viewportClassName}
          contentContainerStyle={
            orientation === 'both'
              ? undefined
              : { flexGrow: orientation === 'horizontal' ? 0 : undefined }
          }>
          {children}
        </ScrollView>
      </View>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
export type { ScrollAreaProps, ScrollAreaRef };
