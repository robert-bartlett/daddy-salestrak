/**
 * Empty - A composable empty state component for displaying
 * no content, no results, or onboarding prompts.
 *
 * @example
 * ```tsx
 * <Empty size="md">
 *   <EmptyHeader>
 *     <EmptyMedia variant="icon">
 *       <Inbox />
 *     </EmptyMedia>
 *     <EmptyTitle>No messages</EmptyTitle>
 *     <EmptyDescription>Your inbox is empty.</EmptyDescription>
 *   </EmptyHeader>
 *   <EmptyContent>
 *     <Button>Compose</Button>
 *   </EmptyContent>
 * </Empty>
 * ```
 */

// Components
export { EmptyRoot as Empty } from './empty-root';
export { EmptyHeader } from './empty-header';
export { EmptyMedia } from './empty-media';
export { EmptyTitle } from './empty-title';
export { EmptyDescription } from './empty-description';
export { EmptyContent } from './empty-content';

// Hooks for advanced usage
export { useEmpty, useEmptySize } from './empty-context';

// Types
export type { EmptyRootProps as EmptyProps } from './empty-root';
export type { EmptyHeaderProps } from './empty-header';
export type { EmptyMediaProps } from './empty-media';
export type { EmptyTitleProps } from './empty-title';
export type { EmptyDescriptionProps } from './empty-description';
export type { EmptyContentProps } from './empty-content';
export type { EmptySize, EmptyContextValue } from './empty-context';
