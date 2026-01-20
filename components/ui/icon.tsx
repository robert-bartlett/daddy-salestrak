import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon, LucideProps } from 'lucide-react-native';
import * as React from 'react';
import { cssInterop } from 'nativewind';

// Default icon size matching the design system
const DEFAULT_ICON_SIZE = 14;

type IconProps = LucideProps & {
  as: LucideIcon;
};

// Note: Lucide icons don't expose refs in their type definitions,
// so IconImpl is a simple passthrough without ref forwarding
function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: 'size',
      width: 'size',
    },
  },
});

/**
 * A wrapper component for Lucide icons with Nativewind `className` support via `cssInterop`.
 *
 * This component allows you to render any Lucide icon while applying utility classes
 * using `nativewind`. It avoids the need to wrap or configure each icon individually.
 *
 * When placed inside a Button or other component that provides TextClassContext,
 * the icon will automatically inherit the appropriate text color.
 *
 * Note: This component does not forward refs as Lucide icons don't expose refs
 * in their type definitions.
 *
 * @component
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react-native';
 * import { Icon } from '@/components/ui/icon';
 *
 * <Icon as={ArrowRight} className="text-red-500" size={16} />
 * ```
 *
 * @param {LucideIcon} as - The Lucide icon component to render.
 * @param {string} className - Utility classes to style the icon using Nativewind.
 * @param {number} size - Icon size (defaults to 14).
 * @param {...LucideProps} ...props - Additional Lucide icon props passed to the "as" icon.
 */
function Icon({ as: IconComponent, className, size = DEFAULT_ICON_SIZE, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IconImpl
      as={IconComponent}
      className={cn(textClass || 'text-foreground', className)}
      size={size}
      {...props}
    />
  );
}

Icon.displayName = 'Icon';

export { Icon };
export type { IconProps };
