import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, Info, X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { TextClassContext, wrapTextChildren } from '@/components/ui/text';

// Base + web-specific styles
const messageVariants = cva(
  cn(
    'w-full flex-row items-center px-4 py-3 gap-3',
    Platform.select({
      web: 'transition-colors',
    })
  ),
  {
    variants: {
      variant: {
        info: 'bg-blue-100',
        danger: 'bg-red-100',
        subtle: 'bg-grey-100',
      },
      position: {
        start: 'justify-start',
        centered: 'justify-center',
      },
    },
    defaultVariants: {
      variant: 'info',
      position: 'start',
    },
  }
);

// Icon color variants (matches text)
const messageIconVariants = cva('', {
  variants: {
    variant: {
      info: 'text-blue-700',
      danger: 'text-red-700',
      subtle: 'text-grey-700',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

// Map variants to appropriate icons
const variantIcons = {
  info: Info,
  danger: AlertTriangle,
  subtle: null, // No icon for subtle messages
} as const;

// Text color variants
const messageTextVariants = cva('text-sm', {
  variants: {
    variant: {
      info: 'text-blue-700',
      danger: 'text-red-700',
      subtle: 'text-grey-700',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

type MessageProps = React.ComponentProps<typeof View> &
  VariantProps<typeof messageVariants> & {
    action?: React.ReactNode;
    dismissable?: boolean;
    onDismiss?: () => void;
  };

const Message = React.forwardRef<View, MessageProps>(
  (
    {
      className,
      variant,
      position,
      action,
      dismissable = true,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = variantIcons[variant ?? 'info'];
    const isUrgent = variant === 'danger';

    return (
      <TextClassContext.Provider value={messageTextVariants({ variant })}>
        <View
          ref={ref}
          accessibilityRole={isUrgent ? 'alert' : undefined}
          {...(Platform.OS === 'web' ? { role: isUrgent ? 'alert' : 'status' } : null)}
          className={cn(messageVariants({ variant, position }), className)}
          {...props}
        >
          {/* Leading icon - varies by variant */}
          {IconComponent && (
            <Icon
              as={IconComponent}
              size={20}
              className={messageIconVariants({ variant })}
            />
          )}

          {/* Content wrapper */}
          <View
            className={cn(
              'flex-row flex-wrap items-center gap-2',
              position !== 'centered' && 'flex-1'
            )}
          >
            {wrapTextChildren(children)}
            {action}
          </View>

          {/* Dismiss button */}
          {dismissable && onDismiss && (
            <Pressable
              onPress={onDismiss}
              hitSlop={8}
              className={cn(
                'rounded-sm opacity-70',
                Platform.select({ web: 'hover:opacity-100' })
              )}
              accessibilityRole="button"
              accessibilityLabel="Dismiss message"
            >
              <Icon as={X} size={16} className={messageIconVariants({ variant })} />
            </Pressable>
          )}
        </View>
      </TextClassContext.Provider>
    );
  }
);

Message.displayName = 'Message';

export { Message, messageVariants, messageTextVariants, messageIconVariants };
export type { MessageProps };
