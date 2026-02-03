import * as React from 'react';
import { Platform } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { cn } from '@/lib/utils';

// Size variants for consistent avatar dimensions
const avatarVariants = cva('relative flex shrink-0 overflow-hidden rounded-full', {
  variants: {
    size: {
      sm: 'size-6',
      default: 'size-8',
      lg: 'size-12',
      xl: 'size-16',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

// Base styles for avatar image
const AVATAR_IMAGE_STYLES = 'aspect-square size-full';

// Base styles for avatar fallback
const AVATAR_FALLBACK_BASE_STYLES =
  'bg-muted flex size-full items-center justify-center rounded-full';

type AvatarProps = AvatarPrimitive.RootProps & VariantProps<typeof avatarVariants>;

const Avatar = React.forwardRef<AvatarPrimitive.RootRef, AvatarProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          // Always apply dark class on native (app is dark mode only)
          Platform.OS !== 'web' && 'dark',
          avatarVariants({ size }),
          Platform.select({
            web: 'select-none',
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

type AvatarImageProps = AvatarPrimitive.ImageProps;

const AvatarImage = React.forwardRef<AvatarPrimitive.ImageRef, AvatarImageProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Image
        ref={ref}
        className={cn(AVATAR_IMAGE_STYLES, className)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

type AvatarFallbackProps = AvatarPrimitive.FallbackProps;

const AvatarFallback = React.forwardRef<AvatarPrimitive.FallbackRef, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
          // Always apply dark class on native (app is dark mode only)
          Platform.OS !== 'web' && 'dark',
          AVATAR_FALLBACK_BASE_STYLES,
          className
        )}
        {...props}
      />
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage, avatarVariants };
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
