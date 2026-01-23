import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { Text, View } from 'react-native';
import { Message } from '../message';
import { Button } from '../button';

describe('Message', () => {
  describe('basic rendering', () => {
    it('renders with default props (info variant, left position)', () => {
      render(
        <Message testID="message">
          Test message
        </Message>
      );

      expect(screen.getByTestId('message')).toBeTruthy();
      expect(screen.getByText('Test message')).toBeTruthy();
    });

    it('renders children content correctly', () => {
      render(
        <Message testID="message">
          This is an important message
        </Message>
      );

      expect(screen.getByText('This is an important message')).toBeTruthy();
    });

    it('wraps string children in Text component', () => {
      render(
        <Message testID="message">
          String content
        </Message>
      );

      expect(screen.getByText('String content')).toBeTruthy();
    });

    it('renders custom React elements as children', () => {
      render(
        <Message testID="message">
          <View testID="custom-child">
            <Text>Custom content</Text>
          </View>
        </Message>
      );

      expect(screen.getByTestId('custom-child')).toBeTruthy();
      expect(screen.getByText('Custom content')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('renders info variant correctly', () => {
      const { getByTestId } = render(
        <Message testID="message" variant="info">
          Info message
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });

    it('renders danger variant correctly', () => {
      const { getByTestId } = render(
        <Message testID="message" variant="danger">
          Danger message
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });

    it('renders subtle variant correctly', () => {
      const { getByTestId } = render(
        <Message testID="message" variant="subtle">
          Subtle message
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });
  });

  describe('position', () => {
    it('renders with left position (default)', () => {
      const { getByTestId } = render(
        <Message testID="message">
          Left aligned
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });

    it('renders with centered position', () => {
      const { getByTestId } = render(
        <Message testID="message" position="centered">
          Centered message
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });
  });

  describe('dismiss button', () => {
    it('shows dismiss button when dismissable={true} and onDismiss provided', () => {
      const onDismiss = jest.fn();
      render(
        <Message testID="message" dismissable={true} onDismiss={onDismiss}>
          Dismissable message
        </Message>
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
      expect(dismissButton).toBeTruthy();
    });

    it('hides dismiss button when dismissable={false}', () => {
      const onDismiss = jest.fn();
      render(
        <Message testID="message" dismissable={false} onDismiss={onDismiss}>
          Non-dismissable message
        </Message>
      );

      expect(screen.queryByRole('button', { name: 'Dismiss message' })).toBeNull();
    });

    it('hides dismiss button when onDismiss is not provided', () => {
      render(
        <Message testID="message" dismissable={true}>
          Message without onDismiss
        </Message>
      );

      expect(screen.queryByRole('button', { name: 'Dismiss message' })).toBeNull();
    });

    it('calls onDismiss when X is pressed', () => {
      const onDismiss = jest.fn();
      render(
        <Message testID="message" dismissable={true} onDismiss={onDismiss}>
          Dismissable message
        </Message>
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
      fireEvent.press(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('action slot', () => {
    it('renders action slot when provided', () => {
      render(
        <Message
          testID="message"
          action={
            <Button testID="action-button">
              <Text>Learn more</Text>
            </Button>
          }
        >
          Message with action
        </Message>
      );

      expect(screen.getByTestId('action-button')).toBeTruthy();
      expect(screen.getByText('Learn more')).toBeTruthy();
    });

    it('renders without action slot when not provided', () => {
      render(
        <Message testID="message">
          Message without action
        </Message>
      );

      expect(screen.queryByTestId('action-button')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has correct accessibility role', () => {
      const { getByTestId } = render(
        <Message testID="message">
          Accessible message
        </Message>
      );

      // On web, role="status" is applied for non-intrusive messages
      // On native, accessibilityRole="alert" is used
      const role = getByTestId('message').getAttribute('role');
      expect(['alert', 'status']).toContain(role);
    });

    it('dismiss button has correct accessibility label', () => {
      const onDismiss = jest.fn();
      render(
        <Message testID="message" onDismiss={onDismiss}>
          Message
        </Message>
      );

      const dismissButton = screen.getByRole('button', { name: 'Dismiss message' });
      expect(dismissButton).toBeTruthy();
    });
  });

  describe('composition', () => {
    it('renders a complete message with all features', () => {
      const onDismiss = jest.fn();
      render(
        <Message
          testID="message"
          variant="danger"
          position="start"
          dismissable={true}
          onDismiss={onDismiss}
          action={
            <Button testID="action-button" variant="link" size="sm">
              <Text>Fix now</Text>
            </Button>
          }
        >
          Your session is about to expire.
        </Message>
      );

      expect(screen.getByTestId('message')).toBeTruthy();
      expect(screen.getByText('Your session is about to expire.')).toBeTruthy();
      expect(screen.getByTestId('action-button')).toBeTruthy();
      expect(screen.getByText('Fix now')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Dismiss message' })).toBeTruthy();
    });

    it('renders multiple messages in sequence', () => {
      render(
        <View>
          <Message testID="info-message" variant="info">
            Info message
          </Message>
          <Message testID="danger-message" variant="danger">
            Danger message
          </Message>
          <Message testID="subtle-message" variant="subtle">
            Subtle message
          </Message>
        </View>
      );

      expect(screen.getByTestId('info-message')).toBeTruthy();
      expect(screen.getByTestId('danger-message')).toBeTruthy();
      expect(screen.getByTestId('subtle-message')).toBeTruthy();
    });
  });

  describe('custom props', () => {
    it('passes additional props to the container', () => {
      const { getByTestId } = render(
        <Message testID="message" accessibilityLabel="Important notice">
          Message with custom props
        </Message>
      );

      expect(getByTestId('message').getAttribute('aria-label')).toBe('Important notice');
    });

    it('accepts custom className', () => {
      const { getByTestId } = render(
        <Message testID="message" className="mt-4">
          Styled message
        </Message>
      );

      expect(getByTestId('message')).toBeTruthy();
    });
  });
});
