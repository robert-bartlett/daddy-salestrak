export const SPACING_SCALE = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export type SpacingToken = keyof typeof SPACING_SCALE;

export const GAP_CLASSES: Record<SpacingToken, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

export const PADDING_CLASSES: Record<SpacingToken, string> = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
};

export const PADDING_X_CLASSES: Record<SpacingToken, string> = {
  none: 'px-0',
  xs: 'px-1',
  sm: 'px-2',
  md: 'px-4',
  lg: 'px-6',
  xl: 'px-8',
  '2xl': 'px-12',
};

export const PADDING_Y_CLASSES: Record<SpacingToken, string> = {
  none: 'py-0',
  xs: 'py-1',
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-6',
  xl: 'py-8',
  '2xl': 'py-12',
};

export const MARGIN_CLASSES: Record<SpacingToken, string> = {
  none: 'm-0',
  xs: 'm-1',
  sm: 'm-2',
  md: 'm-4',
  lg: 'm-6',
  xl: 'm-8',
  '2xl': 'm-12',
};

export const MARGIN_X_CLASSES: Record<SpacingToken, string> = {
  none: 'mx-0',
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
  xl: 'mx-8',
  '2xl': 'mx-12',
};

export const MARGIN_Y_CLASSES: Record<SpacingToken, string> = {
  none: 'my-0',
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8',
  '2xl': 'my-12',
};

export const CONTAINER_MAX_WIDTH = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 576,
  '2xl': 672,
} as const;

export type ContainerSize = keyof typeof CONTAINER_MAX_WIDTH | 'full';

export const ROUNDED_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

export type RoundedToken = keyof typeof ROUNDED_CLASSES;

export type FillOption = true | 'width' | 'height';

const FILL_CLASSES = {
  true: 'flex-1 w-full h-full',
  width: 'w-full',
  height: 'h-full',
} as const;

export function getFillClass(fill?: FillOption): string | undefined {
  if (!fill) return undefined;
  return FILL_CLASSES[fill === true ? 'true' : fill];
}

export const BACKGROUND_CLASSES = {
  default: 'bg-background',
  card: 'bg-card',
  muted: 'bg-muted',
  accent: 'bg-accent',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  popover: 'bg-popover',
  transparent: 'bg-transparent',
  sidebar: 'bg-sidebar-background',
  'sidebar-primary': 'bg-sidebar-primary',
  'sidebar-accent': 'bg-sidebar-accent',
} as const;

export type BackgroundToken = keyof typeof BACKGROUND_CLASSES;
