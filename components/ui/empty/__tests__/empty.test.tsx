import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  useEmpty,
} from '../index';

describe('Empty', () => {
  describe('basic rendering', () => {
    it('renders with default props (md size)', () => {
      render(
        <Empty testID="empty">
          <EmptyTitle>No items</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByText('No items')).toBeTruthy();
    });

    it('renders children content correctly', () => {
      render(
        <Empty testID="empty">
          <EmptyHeader>
            <EmptyTitle>Empty state</EmptyTitle>
            <EmptyDescription>Nothing to show here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      );

      expect(screen.getByText('Empty state')).toBeTruthy();
      expect(screen.getByText('Nothing to show here.')).toBeTruthy();
    });
  });

  describe('size variants', () => {
    it('renders sm size correctly', () => {
      render(
        <Empty testID="empty" size="sm">
          <EmptyTitle>Small</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByText('Small')).toBeTruthy();
    });

    it('renders md size correctly', () => {
      render(
        <Empty testID="empty" size="md">
          <EmptyTitle>Medium</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByText('Medium')).toBeTruthy();
    });

    it('renders lg size correctly', () => {
      render(
        <Empty testID="empty" size="lg">
          <EmptyTitle>Large</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByText('Large')).toBeTruthy();
    });
  });

  describe('EmptyMedia variants', () => {
    it('renders icon variant correctly', () => {
      render(
        <Empty>
          <EmptyMedia testID="media" variant="icon">
            <View testID="icon" />
          </EmptyMedia>
        </Empty>
      );

      expect(screen.getByTestId('media')).toBeTruthy();
      expect(screen.getByTestId('icon')).toBeTruthy();
    });

    it('renders image variant correctly', () => {
      render(
        <Empty>
          <EmptyMedia testID="media" variant="image">
            <View testID="image" />
          </EmptyMedia>
        </Empty>
      );

      expect(screen.getByTestId('media')).toBeTruthy();
      expect(screen.getByTestId('image')).toBeTruthy();
    });

    it('renders animation variant correctly', () => {
      render(
        <Empty>
          <EmptyMedia testID="media" variant="animation">
            <View testID="animated-content" />
          </EmptyMedia>
        </Empty>
      );

      expect(screen.getByTestId('media')).toBeTruthy();
      expect(screen.getByTestId('animated-content')).toBeTruthy();
    });
  });

  describe('context errors', () => {
    it('throws error when useEmpty is used outside Empty', () => {
      const TestComponent = () => {
        const context = useEmpty();
        return <Text>{context.size}</Text>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useEmpty must be used within an Empty component.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('composition', () => {
    it('renders a complete empty state with all subcomponents', () => {
      render(
        <Empty testID="empty" size="md">
          <EmptyHeader testID="header">
            <EmptyMedia testID="media" variant="icon">
              <View testID="icon" />
            </EmptyMedia>
            <EmptyTitle>No messages</EmptyTitle>
            <EmptyDescription>
              Your inbox is empty. Start a new conversation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent testID="content">
            <Button testID="action-button">
              <Text>Compose</Text>
            </Button>
          </EmptyContent>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByTestId('header')).toBeTruthy();
      expect(screen.getByTestId('media')).toBeTruthy();
      expect(screen.getByTestId('icon')).toBeTruthy();
      expect(screen.getByText('No messages')).toBeTruthy();
      expect(
        screen.getByText('Your inbox is empty. Start a new conversation.')
      ).toBeTruthy();
      expect(screen.getByTestId('content')).toBeTruthy();
      expect(screen.getByTestId('action-button')).toBeTruthy();
      expect(screen.getByText('Compose')).toBeTruthy();
    });

    it('renders with minimal content', () => {
      render(
        <Empty testID="empty">
          <EmptyTitle>Empty</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByText('Empty')).toBeTruthy();
    });
  });

  describe('custom className', () => {
    it('passes custom className to Empty root', () => {
      render(
        <Empty testID="empty" className="mt-4">
          <EmptyTitle>Styled</EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('empty')).toBeTruthy();
    });

    it('passes custom className to EmptyHeader', () => {
      render(
        <Empty>
          <EmptyHeader testID="header" className="mb-2">
            <EmptyTitle>Title</EmptyTitle>
          </EmptyHeader>
        </Empty>
      );

      expect(screen.getByTestId('header')).toBeTruthy();
    });

    it('passes custom className to EmptyMedia', () => {
      render(
        <Empty>
          <EmptyMedia testID="media" className="bg-primary">
            <View />
          </EmptyMedia>
        </Empty>
      );

      expect(screen.getByTestId('media')).toBeTruthy();
    });

    it('passes custom className to EmptyTitle', () => {
      render(
        <Empty>
          <EmptyTitle testID="title" className="text-primary">
            Title
          </EmptyTitle>
        </Empty>
      );

      expect(screen.getByTestId('title')).toBeTruthy();
    });

    it('passes custom className to EmptyDescription', () => {
      render(
        <Empty>
          <EmptyDescription testID="description" className="text-sm">
            Description
          </EmptyDescription>
        </Empty>
      );

      expect(screen.getByTestId('description')).toBeTruthy();
    });

    it('passes custom className to EmptyContent', () => {
      render(
        <Empty>
          <EmptyContent testID="content" className="gap-4">
            <Button>Action</Button>
          </EmptyContent>
        </Empty>
      );

      expect(screen.getByTestId('content')).toBeTruthy();
    });
  });

  describe('custom props', () => {
    it('passes additional props to Empty root', () => {
      render(
        <Empty testID="empty" accessibilityLabel="Empty state container">
          <EmptyTitle>Empty</EmptyTitle>
        </Empty>
      );

      expect(screen.getByLabelText('Empty state container')).toBeTruthy();
    });
  });

  describe('size propagation', () => {
    it('propagates size to all subcomponents', () => {
      render(
        <Empty testID="empty" size="lg">
          <EmptyHeader testID="header">
            <EmptyMedia testID="media" variant="icon">
              <View testID="icon" />
            </EmptyMedia>
            <EmptyTitle testID="title">Title</EmptyTitle>
            <EmptyDescription testID="description">
              Description text
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent testID="content">
            <Button>Action</Button>
          </EmptyContent>
        </Empty>
      );

      // All components should render without errors
      expect(screen.getByTestId('empty')).toBeTruthy();
      expect(screen.getByTestId('header')).toBeTruthy();
      expect(screen.getByTestId('media')).toBeTruthy();
      expect(screen.getByTestId('title')).toBeTruthy();
      expect(screen.getByTestId('description')).toBeTruthy();
      expect(screen.getByTestId('content')).toBeTruthy();
    });
  });
});
